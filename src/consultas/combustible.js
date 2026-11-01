import { pool } from "../db.js";
import { enCache } from "../libs/cache.js";
import {
  DESDE_12_MESES, HASTA_12_MESES, UNIDADES, cargasDe, eficiencia, contarColores
} from "./comunes.js";

export async function consumoMensual() {
  const { rows } = await pool.query(
    `SELECT to_char(m.mes, 'YYYY-MM') AS mes,
            COALESCE(SUM(c.cantidad) FILTER (WHERE c."unidadMedida" = 'L'), 0) AS litros,
            COALESCE(SUM(c.cantidad) FILTER (WHERE c."unidadMedida" = 'm³'), 0) AS "metrosCubicos",
            COUNT(c."idCargaCombustible")::int AS cargas
     FROM generate_series(${DESDE_12_MESES}, ${HASTA_12_MESES} - interval '1 month', interval '1 month') AS m(mes)
     LEFT JOIN "CargasCombustible" c ON c.fecha >= m.mes AND c.fecha < m.mes + interval '1 month'
     GROUP BY m.mes
     ORDER BY m.mes`
  );
  return rows;
}

async function eficienciaFlota(desde, hasta, parametros = []) {
  const { rows } = await pool.query(
    `SELECT "unidadMedida", SUM(cargas)::int AS cargas, SUM("cantidadTotal") AS cantidad,
            SUM(km)::int AS km, ROUND(SUM("cantidadIntervalos") / SUM(km) * 100, 2) AS eficiencia
     FROM (${eficiencia(desde, hasta)}) e
     GROUP BY "unidadMedida"
     ORDER BY "unidadMedida"`,
    parametros
  );
  return rows;
}

export const eficienciaFlota12Meses = () => eficienciaFlota(DESDE_12_MESES, HASTA_12_MESES);

export async function semaforoEficiencia12Meses() {
  const { rows } = await pool.query(
    `SELECT e.semaforo, COUNT(*)::int AS cantidad
     FROM (${eficiencia(DESDE_12_MESES, HASTA_12_MESES)}) e
     JOIN "Unidades" u ON u."idUnidad" = e."idUnidad"
     WHERE u.estado <> 'Baja'
     GROUP BY e.semaforo`
  );
  return contarColores(rows);
}

// Eficiencia de todas las unidades en un período; la ficha de una unidad toma su fila de acá.
export const eficienciaDeUnidades12Meses = () => enCache("eficiencia/12meses", async () =>
  (await pool.query(`SELECT * FROM (${eficiencia(DESDE_12_MESES, HASTA_12_MESES)}) e`)).rows);

const INICIO_MES = `to_date($1, 'YYYY-MM')::timestamp`;
const FIN_MES = `to_date($1, 'YYYY-MM')::timestamp + interval '1 month'`;

export const eficienciaDeUnidadesDelMes = (mes) => enCache(`eficiencia/${mes}`, async () =>
  (await pool.query(`SELECT * FROM (${eficiencia(INICIO_MES, FIN_MES)}) e`, [mes])).rows);

export async function unidadesDelMes(mes) {
  const [unidades, flota] = await Promise.all([
    pool.query(
      `SELECT e.*, v.interno, v.patente, v."tipoUnidad"
       FROM (${eficiencia(INICIO_MES, FIN_MES)}) e
       JOIN (${UNIDADES}) v ON v."idUnidad" = e."idUnidad"
       ORDER BY e."unidadMedida", e."cantidadTotal" DESC`,
      [mes]
    ),
    eficienciaFlota(INICIO_MES, FIN_MES, [mes])
  ]);
  return { unidades: unidades.rows, flota };
}

export async function cargasDeUnidadEnMes(idUnidad, mes) {
  const unidad = await pool.query(
    `SELECT "idUnidad", interno, patente, "tipoUnidad", estado FROM (${UNIDADES}) v WHERE "idUnidad" = $1`,
    [idUnidad]
  );
  if (unidad.rows.length === 0) return null;

  const [cargas, delMes] = await Promise.all([
    pool.query(
      `SELECT i."idCargaCombustible", i.fecha, i.cantidad, i."unidadMedida", i.kilometraje, i.confiable, i.km, i.valido,
              CASE WHEN i.valido THEN ROUND(i."cantidadTramo" / i.km * 100, 2) END AS eficiencia,
              t.nombre AS "tipoCombustible", c.lugar, c.fuente,
              ch.nombre AS "nombreChofer", ch.apellido AS "apellidoChofer"
       FROM (${cargasDe("$2")}) i
       JOIN "CargasCombustible" c ON c."idCargaCombustible" = i."idCargaCombustible"
       JOIN "TiposCombustible" t ON t."idTipoCombustible" = c."idTipoCombustible"
       LEFT JOIN "Choferes" ch ON ch."idChofer" = c."idChofer"
       WHERE i."idUnidad" = $2 AND i.fecha >= ${INICIO_MES} AND i.fecha < ${FIN_MES}
       ORDER BY i.fecha`,
      [mes, idUnidad]
    ),
    eficienciaDeUnidadesDelMes(mes)
  ]);
  const consumo = delMes.filter((fila) => fila.idUnidad === idUnidad);
  return { unidad: unidad.rows[0], cargas: cargas.rows, eficiencia: consumo };
}
