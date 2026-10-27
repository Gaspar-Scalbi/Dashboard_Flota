import { pool } from "../db.js";

export async function estadoImportacion() {
  const { rows } = await pool.query(
    `SELECT "ultimoIntento", "resultadoUltimoIntento", "mensajeUltimoIntento",
            "ultimaCargaExitosa", generacion, "datosAl", detalle
     FROM importacion.estado
     WHERE id = 1`
  );
  return rows[0];
}
