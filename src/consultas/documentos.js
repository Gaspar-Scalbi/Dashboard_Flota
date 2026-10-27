import { pool } from "../db.js";
import { DOCUMENTOS, contarColores } from "./comunes.js";

export async function semaforoDocumentos() {
  const { rows } = await pool.query(
    `SELECT semaforo, COUNT(*)::int AS cantidad
     FROM (${DOCUMENTOS}) d
     WHERE "estadoUnidad" <> 'Baja'
     GROUP BY semaforo`
  );
  return contarColores(rows);
}

export async function documentosPorTipo() {
  const { rows } = await pool.query(
    `SELECT "tipoDocumento",
            COUNT(*) FILTER (WHERE semaforo = 'rojo')::int AS rojo,
            COUNT(*) FILTER (WHERE semaforo = 'amarillo')::int AS amarillo,
            COUNT(*) FILTER (WHERE semaforo = 'verde')::int AS verde,
            COUNT(*) FILTER (WHERE semaforo = 'gris')::int AS gris
     FROM (${DOCUMENTOS}) d
     WHERE "estadoUnidad" <> 'Baja'
     GROUP BY "tipoDocumento"
     ORDER BY "tipoDocumento"`
  );
  return rows;
}

export async function documentosDelColor(color) {
  const { rows } = await pool.query(
    `SELECT "idDocumentoUnidad", "idUnidad", interno, patente, "tipoDocumento",
            "fechaVencimiento", "diasRestantes"
     FROM (${DOCUMENTOS}) d
     WHERE semaforo = $1 AND "estadoUnidad" <> 'Baja'
     ORDER BY "fechaVencimiento" NULLS LAST, length(interno), interno`,
    [color]
  );
  return rows;
}
