import { pool } from "../db.js";
import { exportar, ErrorMirror } from "./mirror.js";
import { cargarModelo, insertar } from "./cargar.js";

const ENTIDADES = {
  TipoUnidad: "idTipoUnidad",
  Unidad: "idUnidad",
  Chofer: "idChofer",
  AsignacionChofer: "idAsignacionChofer",
  TipoDocumento: "idTipoDocumento",
  DocumentoUnidad: "idDocumentoUnidad",
  CargaCombustible: "idCargaCombustible"
};
const LIMITE_PAGINA = 500;
const INTENTOS = 3;
const GENERACION_CAMBIADA = "40001";
const MIRROR_DESACTUALIZADO = "55000";
const CLAVE_BLOQUEO = 20261027;

async function descargarEntidad(entidad, clave, generacion, descarga) {
  let desde = 0;
  while (!descarga.cancelada) {
    const pagina = await exportar({
      p_entidad: entidad, p_desde: desde, p_limite: LIMITE_PAGINA, p_generacion: generacion
    });
    const filas = pagina.datos.map((registro) => ({
      entidad, idOrigen: registro[clave], datos: JSON.stringify(registro)
    }));
    await insertar(pool, "importacion.registros", ["entidad", "idOrigen", "datos"], filas);
    if (!pagina.hayMas) return;
    desde = pagina.siguienteId;
  }
}

async function descargar() {
  const estado = await exportar({ p_entidad: "Estado" });
  await pool.query("TRUNCATE importacion.registros");

  const descarga = { cancelada: false };
  const resultados = await Promise.allSettled(Object.entries(ENTIDADES).map(([entidad, clave]) =>
    descargarEntidad(entidad, clave, estado.generacion, descarga).catch((error) => {
      descarga.cancelada = true;
      throw error;
    })
  ));
  const fallo = resultados.find((resultado) => resultado.status === "rejected");
  if (fallo) throw fallo.reason;

  const final = await exportar({ p_entidad: "Estado" });
  if (final.generacion !== estado.generacion) {
    throw new ErrorMirror("La réplica publicó durante la descarga.", GENERACION_CAMBIADA);
  }
  return estado;
}

async function descargarConReintentos() {
  for (let intento = 1; ; intento++) {
    try {
      return await descargar();
    } catch (error) {
      if (error.codigo !== GENERACION_CAMBIADA || intento === INTENTOS) throw error;
    }
  }
}

function mensajeDeError(error) {
  if (error.codigo === MIRROR_DESACTUALIZADO) {
    return "La réplica no tiene una publicación de los últimos 15 minutos: el sistema de gestión no está publicando.";
  }
  if (error.codigo === GENERACION_CAMBIADA) {
    return `La réplica publicó durante la descarga en los ${INTENTOS} intentos.`;
  }
  return error.message;
}

export async function importar() {
  const cliente = await pool.connect();
  try {
    const { rows } = await cliente.query("SELECT pg_try_advisory_lock($1) AS libre", [CLAVE_BLOQUEO]);
    if (!rows[0].libre) {
      return { resultado: "omitida", mensaje: "Ya hay una importación en curso." };
    }
    try {
      const estado = await descargarConReintentos();
      await cliente.query("BEGIN");
      const detalle = await cargarModelo(cliente);
      await cliente.query(
        `UPDATE importacion.estado
         SET "ultimoIntento" = now(), "resultadoUltimoIntento" = 'ok', "mensajeUltimoIntento" = NULL,
             "ultimaCargaExitosa" = now(), generacion = $1, "datosAl" = $2, detalle = $3
         WHERE id = 1`,
        [estado.generacion, estado.ultimaSincronizacion, detalle]
      );
      await cliente.query("COMMIT");
      return { resultado: "ok", generacion: estado.generacion, detalle };
    } catch (error) {
      await cliente.query("ROLLBACK");
      const mensaje = mensajeDeError(error);
      await cliente.query(
        `UPDATE importacion.estado
         SET "ultimoIntento" = now(), "resultadoUltimoIntento" = 'error', "mensajeUltimoIntento" = $1
         WHERE id = 1`,
        [mensaje]
      );
      return { resultado: "error", mensaje };
    } finally {
      await cliente.query("SELECT pg_advisory_unlock($1)", [CLAVE_BLOQUEO]);
    }
  } finally {
    cliente.release();
  }
}
