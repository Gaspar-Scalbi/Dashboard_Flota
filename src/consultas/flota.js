import { pool } from "../db.js";
import { eficienciaDeUnidades12Meses } from "./combustible.js";
import {
  ESTADOS, DESDE_12_MESES, UNIDADES, DOCUMENTOS, cargasDe, semaforoVencimiento
} from "./comunes.js";

export async function unidadesPorEstado() {
  const { rows } = await pool.query(
    `SELECT e.estado, COUNT(v."idUnidad")::int AS cantidad, COUNT(v."idChofer")::int AS "conChofer"
     FROM unnest($1::varchar[]) WITH ORDINALITY AS e(estado, orden)
     LEFT JOIN (${UNIDADES}) v ON v.estado = e.estado
     GROUP BY e.estado, e.orden
     ORDER BY e.orden`,
    [ESTADOS]
  );
  return rows;
}

export async function unidadesDelEstado(estado) {
  const { rows } = await pool.query(
    `SELECT v."idUnidad", v.interno, v.patente, v."tipoUnidad", v.kilometraje,
            v."idChofer", v."nombreChofer", v."apellidoChofer", d.documentacion
     FROM (${UNIDADES}) v
     LEFT JOIN LATERAL (
         SELECT (ARRAY['rojo', 'amarillo', 'gris', 'verde'])[
                    MIN(array_position(ARRAY['rojo', 'amarillo', 'gris', 'verde'], s.semaforo))
                ] AS documentacion
         FROM (${DOCUMENTOS}) s
         WHERE s."idUnidad" = v."idUnidad"
     ) d ON TRUE
     WHERE v.estado = $1
     ORDER BY length(v.interno), v.interno`,
    [estado]
  );
  return rows;
}

export async function detalleUnidad(idUnidad) {
  const unidad = await pool.query(
    `SELECT v.*, c."numeroLicencia", c."vencimientoLicencia",
            ${semaforoVencimiento(`c."vencimientoLicencia"`)} AS "semaforoLicencia",
            EXISTS (
                SELECT 1 FROM "CargasCombustible" cc
                JOIN "Unidades" x ON x."idUnidad" = cc."idUnidad"
                WHERE x."idTipoUnidad" = v."idTipoUnidad"
            ) AS "usaCombustible"
     FROM (${UNIDADES}) v
     LEFT JOIN "Choferes" c ON c."idChofer" = v."idChofer"
     WHERE v."idUnidad" = $1`,
    [idUnidad]
  );
  if (unidad.rows.length === 0) return null;
  const { usaCombustible } = unidad.rows[0];
  const sinFilas = Promise.resolve({ rows: [] });

  const [documentos, cargas, consumo] = await Promise.all([
    pool.query(
      `SELECT "idDocumentoUnidad", "tipoDocumento", "fechaEmision", "fechaVencimiento", "diasRestantes", semaforo
       FROM (${DOCUMENTOS}) d
       WHERE "idUnidad" = $1
       ORDER BY "fechaVencimiento" NULLS LAST, "tipoDocumento"`,
      [idUnidad]
    ),
    !usaCombustible ? sinFilas : pool.query(
      `SELECT i."idCargaCombustible", i.fecha, i.cantidad, i."unidadMedida", i.kilometraje, i.confiable, i.km, i.valido,
              t.nombre AS "tipoCombustible", c.lugar
       FROM (${cargasDe("$1")}) i
       JOIN "CargasCombustible" c ON c."idCargaCombustible" = i."idCargaCombustible"
       JOIN "TiposCombustible" t ON t."idTipoCombustible" = c."idTipoCombustible"
       WHERE i."idUnidad" = $1 AND i.fecha >= ${DESDE_12_MESES}
       ORDER BY i.fecha DESC
       LIMIT 15`,
      [idUnidad]
    ),
    !usaCombustible ? [] : eficienciaDeUnidades12Meses()
  ]);

  return {
    unidad: unidad.rows[0],
    documentos: documentos.rows,
    cargas: cargas.rows,
    eficiencia: consumo.filter((fila) => fila.idUnidad === idUnidad)
  };
}
