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
const HORA_COMPLETA = 3;
const CARGAS_INCREMENTAL = 600;

let ultimaCompleta = 0;

async function descargarEntidad(entidad, clave, generacion, desde, descarga) {
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

async function descargar(estado, desdeCarga) {
  await pool.query("TRUNCATE importacion.registros");

  const descarga = { cancelada: false };
  const resultados = await Promise.allSettled(Object.entries(ENTIDADES).map(([entidad, clave]) =>
    descargarEntidad(entidad, clave, estado.generacion, entidad === "CargaCombustible" ? desdeCarga : 0, descarga)
      .catch((error) => {
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
}

async function descargarConReintentos(estado, desdeCarga) {
  for (let intento = 1; ; intento++) {
    try {
      await descargar(estado, desdeCarga);
      return estado;
    } catch (error) {
      if (error.codigo !== GENERACION_CAMBIADA || intento === INTENTOS) throw error;
      estado = await exportar({ p_entidad: "Estado" });
    }
  }
}

// Completa al iniciar y en la primera importación después de las 3; el resto, solo las últimas 600 cargas.
function tocaCompleta() {
  const corte = new Date();
  corte.setHours(HORA_COMPLETA, 0, 0, 0);
  if (corte > new Date()) corte.setDate(corte.getDate() - 1);
  return ultimaCompleta < corte.getTime();
}

async function primeraCargaIncremental(cliente) {
  if (tocaCompleta()) return 0;
  const { rows } = await cliente.query(
    `SELECT "idCargaCombustible" - 1 AS desde FROM "CargasCombustible"
     ORDER BY "idCargaCombustible" DESC OFFSET $1 LIMIT 1`,
    [CARGAS_INCREMENTAL - 1]
  );
  return rows[0]?.desde ?? 0;
}

async function cargar(cliente, estado, desdeCarga) {
  await cliente.query("BEGIN");
  const detalle = await cargarModelo(cliente, { desdeCarga });
  await cliente.query(
    `UPDATE importacion.estado
     SET "ultimoIntento" = now(), "resultadoUltimoIntento" = 'ok', "mensajeUltimoIntento" = NULL,
         "ultimaCargaExitosa" = now(), generacion = $1, "datosAl" = $2, detalle = $3
     WHERE id = 1`,
    [estado.generacion, estado.ultimaSincronizacion, detalle]
  );
  await cliente.query("COMMIT");
  if (!desdeCarga) ultimaCompleta = Date.now();
  return detalle;
}

async function registrar(cliente, resultado, mensaje, datosAl = null) {
  await cliente.query(
    `UPDATE importacion.estado
     SET "ultimoIntento" = now(), "resultadoUltimoIntento" = $1, "mensajeUltimoIntento" = $2,
         "datosAl" = COALESCE($3, "datosAl")
     WHERE id = 1`,
    [resultado, mensaje, datosAl]
  );
}

export async function importar() {
  const cliente = await pool.connect();
  try {
    const { rows } = await cliente.query("SELECT pg_try_advisory_lock($1) AS libre", [CLAVE_BLOQUEO]);
    if (!rows[0].libre) {
      return { resultado: "omitida", mensaje: "Ya hay una importación en curso." };
    }
    try {
      let estado = await exportar({ p_entidad: "Estado" });

      const anterior = await cliente.query(`SELECT generacion FROM importacion.estado WHERE id = 1`);
      if (anterior.rows[0].generacion === estado.generacion) {
        await registrar(cliente, "sincambios", null, estado.ultimaSincronizacion);
        return { resultado: "sincambios", mensaje: `La réplica sigue en la generación ${estado.generacion}.` };
      }

      const desdeCarga = await primeraCargaIncremental(cliente);
      estado = await descargarConReintentos(estado, desdeCarga);
      let detalle;
      try {
        detalle = await cargar(cliente, estado, desdeCarga);
      } catch (error) {
        await cliente.query("ROLLBACK");
        if (!desdeCarga) throw error;
        estado = await descargarConReintentos(await exportar({ p_entidad: "Estado" }), 0);
        detalle = await cargar(cliente, estado, 0);
      }
      return { resultado: "ok", generacion: estado.generacion, completa: !desdeCarga, detalle };
    } catch (error) {
      await cliente.query("ROLLBACK");
      if (error.codigo === MIRROR_DESACTUALIZADO) {
        const mensaje = "El sistema de gestión no está publicando: se conservan los últimos datos importados.";
        await registrar(cliente, "pausado", mensaje);
        return { resultado: "pausado", mensaje };
      }
      const mensaje = error.codigo === GENERACION_CAMBIADA
        ? `La réplica publicó durante la descarga en los ${INTENTOS} intentos.`
        : error.message;
      await registrar(cliente, "error", mensaje);
      return { resultado: "error", mensaje };
    } finally {
      await cliente.query("SELECT pg_advisory_unlock($1)", [CLAVE_BLOQUEO]);
    }
  } finally {
    cliente.release();
  }
}
