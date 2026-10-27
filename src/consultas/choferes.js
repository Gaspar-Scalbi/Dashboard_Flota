import { pool } from "../db.js";
import { LICENCIAS, contarColores } from "./comunes.js";

export async function semaforoLicencias() {
  const { rows } = await pool.query(
    `SELECT semaforo, COUNT(*)::int AS cantidad
     FROM (${LICENCIAS}) l
     GROUP BY semaforo`
  );
  return contarColores(rows);
}

export async function resumenChoferes() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS activos, COUNT("idUnidad")::int AS "conUnidad"
     FROM (${LICENCIAS}) l`
  );
  return rows[0];
}

export async function choferesDelColor(color) {
  const { rows } = await pool.query(
    `SELECT "idChofer", nombre, apellido, "numeroLicencia", "vencimientoLicencia", "diasRestantes",
            "idUnidad", interno, patente
     FROM (${LICENCIAS}) l
     WHERE semaforo = $1
     ORDER BY "vencimientoLicencia" NULLS LAST, apellido, nombre`,
    [color]
  );
  return rows;
}
