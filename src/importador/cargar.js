import { nuevoContexto, validar } from "./validar.js";

const LOTE = 500;

export async function insertar(db, tabla, columnas, filas, clave = null) {
  const actualizar = clave
    ? ` ON CONFLICT ("${clave}") DO UPDATE SET ${columnas.filter((c) => c !== clave)
      .map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ")}`
    : "";
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
      `INSERT INTO ${tabla} (${columnas.map((columna) => `"${columna}"`).join(", ")}) VALUES ${renglones.join(", ")}${actualizar}`,
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

const TABLAS = {
  TipoUnidad: ["TiposUnidad", "idTipoUnidad", ["idTipoUnidad", "nombre"]],
  Unidad: ["Unidades", "idUnidad", ["idUnidad", "idTipoUnidad", "interno", "patente", "estado", "kilometraje"]],
  Chofer: ["Choferes", "idChofer", ["idChofer", "nombre", "apellido", "numeroLicencia", "vencimientoLicencia", "activo"]],
  AsignacionChofer: ["AsignacionesChofer", "idAsignacionChofer",
    ["idAsignacionChofer", "idUnidad", "idChofer", "fechaInicio", "fechaFin"]],
  TipoDocumento: ["TiposDocumento", "idTipoDocumento", ["idTipoDocumento", "nombre"]],
  DocumentoUnidad: ["DocumentosUnidad", "idDocumentoUnidad",
    ["idDocumentoUnidad", "idUnidad", "idTipoDocumento", "fechaEmision", "fechaVencimiento"]],
  CargaCombustible: ["CargasCombustible", "idCargaCombustible",
    ["idCargaCombustible", "idUnidad", "idChofer", "idTipoCombustible", "fecha", "cantidad", "unidadMedida",
      "kilometraje", "lugar", "fuente"]]
};

// Se borra lo que ya no está en el origen, salvo que otra tabla todavía lo use.
const SIN_REFERENCIAS = {
  Unidades: `NOT EXISTS (SELECT 1 FROM "CargasCombustible" x WHERE x."idUnidad" = t."idUnidad")
             AND NOT EXISTS (SELECT 1 FROM "AsignacionesChofer" x WHERE x."idUnidad" = t."idUnidad")
             AND NOT EXISTS (SELECT 1 FROM "DocumentosUnidad" x WHERE x."idUnidad" = t."idUnidad")`,
  Choferes: `NOT EXISTS (SELECT 1 FROM "CargasCombustible" x WHERE x."idChofer" = t."idChofer")
             AND NOT EXISTS (SELECT 1 FROM "AsignacionesChofer" x WHERE x."idChofer" = t."idChofer")`,
  TiposDocumento: `NOT EXISTS (SELECT 1 FROM "DocumentosUnidad" x WHERE x."idTipoDocumento" = t."idTipoDocumento")`,
  TiposUnidad: `NOT EXISTS (SELECT 1 FROM "Unidades" x WHERE x."idTipoUnidad" = t."idTipoUnidad")`
};

// Completa: vacía y recarga. Incremental: de las cargas solo toca las posteriores a desdeCarga.
export async function cargarModelo(cliente, { desdeCarga = 0 } = {}) {
  const registrosDe = await leerZonaPrevia(cliente);
  const contexto = nuevoContexto();
  const validas = {};
  const detalle = {};

  function validarEntidad(entidad, registros) {
    const { filas, motivos } = validar(entidad, registros, contexto);
    validas[entidad] = filas;
    detalle[entidad] = {
      recibidos: registros.length, cargados: filas.length, rechazados: registros.length - filas.length, motivos
    };
    return filas;
  }

  validarEntidad("TipoUnidad", registrosDe("TipoUnidad")).forEach((f) => contexto.tiposUnidad.add(f.idTipoUnidad));
  // Ante internos o patentes repetidos se conserva primero la unidad que no está de baja.
  const unidades = [...registrosDe("Unidad")].sort((a, b) => esBaja(a) - esBaja(b) || a.idUnidad - b.idUnidad);
  validarEntidad("Unidad", unidades).forEach((f) => contexto.unidades.add(f.idUnidad));
  validarEntidad("Chofer", registrosDe("Chofer")).forEach((f) => contexto.choferes.add(f.idChofer));
  validarEntidad("AsignacionChofer", registrosDe("AsignacionChofer"));
  validarEntidad("TipoDocumento", registrosDe("TipoDocumento")).forEach((f) => contexto.tiposDocumento.add(f.idTipoDocumento));
  validarEntidad("DocumentoUnidad", registrosDe("DocumentoUnidad"));
  validarEntidad("CargaCombustible", registrosDe("CargaCombustible"));

  const ids = (entidad) => validas[entidad].map((fila) => fila[TABLAS[entidad][1]]);

  if (!desdeCarga) {
    for (const entidad of ["CargaCombustible", "DocumentoUnidad", "AsignacionChofer", "Chofer", "Unidad", "TipoDocumento", "TipoUnidad"]) {
      await cliente.query(`DELETE FROM "${TABLAS[entidad][0]}"`);
    }
  }

  await cliente.query(
    `DELETE FROM "CargasCombustible" WHERE "idCargaCombustible" > $1 AND NOT ("idCargaCombustible" = ANY($2))`,
    [desdeCarga, ids("CargaCombustible")]
  );
  for (const entidad of ["DocumentoUnidad", "AsignacionChofer"]) {
    const [tabla, clave] = TABLAS[entidad];
    await cliente.query(`DELETE FROM "${tabla}" WHERE NOT ("${clave}" = ANY($1))`, [ids(entidad)]);
  }
  for (const entidad of ["Unidad", "Chofer", "TipoDocumento", "TipoUnidad"]) {
    const [tabla, clave] = TABLAS[entidad];
    await cliente.query(
      `DELETE FROM "${tabla}" t WHERE NOT (t."${clave}" = ANY($1)) AND ${SIN_REFERENCIAS[tabla]}`,
      [ids(entidad)]
    );
  }

  for (const entidad of ["TipoUnidad", "Unidad", "Chofer", "TipoDocumento", "AsignacionChofer", "DocumentoUnidad"]) {
    const [tabla, clave, columnas] = TABLAS[entidad];
    await insertar(cliente, `"${tabla}"`, columnas, validas[entidad], clave);
  }

  const cargas = validas.CargaCombustible;
  const tipos = await idsDeTiposCombustible(cliente, [...new Set(cargas.map((fila) => fila.tipoCombustible))]);
  const [tabla, clave, columnas] = TABLAS.CargaCombustible;
  await insertar(cliente, `"${tabla}"`, columnas,
    cargas.map((fila) => ({ ...fila, idTipoCombustible: tipos.get(fila.tipoCombustible) })), clave);

  return detalle;
}
