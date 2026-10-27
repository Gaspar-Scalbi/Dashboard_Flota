import { nuevoContexto, validar } from "./validar.js";

const LOTE = 500;
const TABLAS_DEL_MODELO = [
  "CargasCombustible", "DocumentosUnidad", "AsignacionesChofer", "Choferes", "Unidades", "TiposDocumento", "TiposUnidad"
];

export async function insertar(db, tabla, columnas, filas) {
  for (let inicio = 0; inicio < filas.length; inicio += LOTE) {
    const valores = [];
    const renglones = filas.slice(inicio, inicio + LOTE).map((fila) => {
      const marcas = columnas.map((columna) => {
        valores.push(fila[columna]);
        return `$${valores.length}`;
      });
      return `(${marcas.join(", ")})`;
    });
    await db.query(
      `INSERT INTO ${tabla} (${columnas.map((columna) => `"${columna}"`).join(", ")}) VALUES ${renglones.join(", ")}`,
      valores
    );
  }
}

async function leerZonaPrevia(cliente) {
  const { rows } = await cliente.query(
    `SELECT entidad, datos FROM importacion.registros ORDER BY entidad, "idOrigen"`
  );
  const registros = {};
  for (const { entidad, datos } of rows) {
    (registros[entidad] ??= []).push(datos);
  }
  return (entidad) => registros[entidad] ?? [];
}

async function idsDeTiposCombustible(cliente, nombres) {
  await cliente.query(
    `INSERT INTO "TiposCombustible" (nombre) SELECT unnest($1::varchar[]) ON CONFLICT (nombre) DO NOTHING`,
    [nombres]
  );
  const { rows } = await cliente.query(`SELECT "idTipoCombustible", nombre FROM "TiposCombustible"`);
  return new Map(rows.map((fila) => [fila.nombre, fila.idTipoCombustible]));
}

const esBaja = (unidad) => unidad.eliminada || unidad.activa === false || unidad.estado === "Baja";

export async function cargarModelo(cliente) {
  const registrosDe = await leerZonaPrevia(cliente);
  for (const tabla of TABLAS_DEL_MODELO) {
    await cliente.query(`DELETE FROM "${tabla}"`);
  }

  const contexto = nuevoContexto();
  const detalle = {};

  async function cargar(entidad, tabla, columnas, registros, preparar = (filas) => filas) {
    const { filas, motivos } = validar(entidad, registros, contexto);
    await insertar(cliente, `"${tabla}"`, columnas, await preparar(filas));
    detalle[entidad] = {
      recibidos: registros.length, cargados: filas.length, rechazados: registros.length - filas.length, motivos
    };
    return filas;
  }

  const tiposUnidad = await cargar("TipoUnidad", "TiposUnidad", ["idTipoUnidad", "nombre"], registrosDe("TipoUnidad"));
  tiposUnidad.forEach((fila) => contexto.tiposUnidad.add(fila.idTipoUnidad));

  // Ante internos o patentes repetidos se conserva primero la unidad que no está de baja.
  const unidadesOrdenadas = [...registrosDe("Unidad")].sort((a, b) => esBaja(a) - esBaja(b) || a.idUnidad - b.idUnidad);
  const unidades = await cargar("Unidad", "Unidades",
    ["idUnidad", "idTipoUnidad", "interno", "patente", "estado", "kilometraje"], unidadesOrdenadas);
  unidades.forEach((fila) => contexto.unidades.add(fila.idUnidad));

  const choferes = await cargar("Chofer", "Choferes",
    ["idChofer", "nombre", "apellido", "numeroLicencia", "vencimientoLicencia", "activo"], registrosDe("Chofer"));
  choferes.forEach((fila) => contexto.choferes.add(fila.idChofer));

  await cargar("AsignacionChofer", "AsignacionesChofer",
    ["idAsignacionChofer", "idUnidad", "idChofer", "fechaInicio", "fechaFin"], registrosDe("AsignacionChofer"));

  const tiposDocumento = await cargar("TipoDocumento", "TiposDocumento",
    ["idTipoDocumento", "nombre"], registrosDe("TipoDocumento"));
  tiposDocumento.forEach((fila) => contexto.tiposDocumento.add(fila.idTipoDocumento));

  await cargar("DocumentoUnidad", "DocumentosUnidad",
    ["idDocumentoUnidad", "idUnidad", "idTipoDocumento", "fechaEmision", "fechaVencimiento"], registrosDe("DocumentoUnidad"));

  await cargar("CargaCombustible", "CargasCombustible",
    ["idCargaCombustible", "idUnidad", "idChofer", "idTipoCombustible", "fecha", "cantidad", "unidadMedida",
      "kilometraje", "lugar", "fuente"],
    registrosDe("CargaCombustible"),
    async (filas) => {
      const ids = await idsDeTiposCombustible(cliente, [...new Set(filas.map((fila) => fila.tipoCombustible))]);
      return filas.map((fila) => ({ ...fila, idTipoCombustible: ids.get(fila.tipoCombustible) }));
    });

  return detalle;
}
