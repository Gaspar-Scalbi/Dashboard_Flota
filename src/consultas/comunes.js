export const ESTADOS = ["Operativa", "En taller", "Parada", "Alquilada", "Baja"];
export const COLORES = ["rojo", "amarillo", "verde", "gris"];

export const HOY = `(now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date`;

const INICIO_MES_ACTUAL = `date_trunc('month', ${HOY}::timestamp)`;
export const DESDE_12_MESES = `${INICIO_MES_ACTUAL} - interval '11 months'`;
export const HASTA_12_MESES = `${INICIO_MES_ACTUAL} + interval '1 month'`;

// Semáforo de vencimientos: rojo vencido, amarillo hasta 30 días, verde más de 30 días, gris sin fecha.
export const semaforoVencimiento = (columna) => `CASE
    WHEN ${columna} IS NULL THEN 'gris'
    WHEN ${columna} < ${HOY} THEN 'rojo'
    WHEN ${columna} <= ${HOY} + 30 THEN 'amarillo'
    ELSE 'verde'
  END`;

// Unidad con su tipo y el chofer de la asignación vigente.
export const UNIDADES = `
  SELECT u."idUnidad", u.interno, u.patente, u.estado, u.kilometraje,
         u."idTipoUnidad", t.nombre AS "tipoUnidad",
         c."idChofer", c.nombre AS "nombreChofer", c.apellido AS "apellidoChofer",
         a."fechaInicio" AS "asignadaDesde"
  FROM "Unidades" u
  JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
  LEFT JOIN "AsignacionesChofer" a ON a."idUnidad" = u."idUnidad" AND a."fechaFin" IS NULL
  LEFT JOIN "Choferes" c ON c."idChofer" = a."idChofer"`;

export const DOCUMENTOS = `
  SELECT d."idDocumentoUnidad", d."idUnidad", u.interno, u.patente, u.estado AS "estadoUnidad",
         t.nombre AS "tipoDocumento", d."fechaEmision", d."fechaVencimiento",
         d."fechaVencimiento" - ${HOY} AS "diasRestantes",
         ${semaforoVencimiento(`d."fechaVencimiento"`)} AS semaforo
  FROM "DocumentosUnidad" d
  JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
  JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"`;

export const LICENCIAS = `
  SELECT c."idChofer", c.nombre, c.apellido, c."numeroLicencia", c."vencimientoLicencia",
         c."vencimientoLicencia" - ${HOY} AS "diasRestantes",
         ${semaforoVencimiento(`c."vencimientoLicencia"`)} AS semaforo,
         u."idUnidad", u.interno, u.patente
  FROM "Choferes" c
  LEFT JOIN "AsignacionesChofer" a ON a."idChofer" = c."idChofer" AND a."fechaFin" IS NULL
  LEFT JOIN "Unidades" u ON u."idUnidad" = a."idUnidad"
  WHERE c.activo`;

// Cargas con su tramo de consumo. Algunas fuentes (por ejemplo, ciertas tarjetas de combustible) informan otro
// contador o un kilometraje mal tipeado, así que no toda carga sirve como lectura de odómetro:
// - referencia: el kilometraje oficial de la unidad. Si la mediana de sus últimas 5 lecturas lo
//   supera por hasta 50.000 km, el oficial está desactualizado y se usa esa mediana.
// - confiable: la lectura no supera la referencia (con 2.000 km de margen) y la distancia hasta
//   ella se puede recorrer con lo cargado después (a lo sumo 15 km por litro o m³).
// - Cada lectura confiable cierra un tramo desde la lectura confiable anterior; el tramo suma la
//   cantidad de todas sus cargas, también la de las que tienen la lectura descartada.
// - El tramo es válido si recorrió más de 0 km y consumió entre 5 y 100 por cada 100 km.
export const CARGAS = `
  WITH referencias AS (
      SELECT u."idUnidad",
             CASE WHEN m.mediana > u.kilometraje AND m.mediana <= u.kilometraje + 50000 THEN m.mediana
                  ELSE u.kilometraje END AS referencia
      FROM "Unidades" u
      LEFT JOIN LATERAL (
          SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY ultimas.kilometraje) AS mediana
          FROM (
              SELECT c.kilometraje FROM "CargasCombustible" c
              WHERE c."idUnidad" = u."idUnidad"
              ORDER BY c.fecha DESC
              LIMIT 5
          ) ultimas
      ) m ON TRUE
  ),
  base AS (
      SELECT c."idCargaCombustible", c."idUnidad", c."unidadMedida", c.fecha, c.cantidad, c.kilometraje,
             r.referencia,
             COALESCE(SUM(c.cantidad) OVER (
                 PARTITION BY c."idUnidad" ORDER BY c.fecha DESC, c."idCargaCombustible" DESC
                 ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS "cantidadPosterior"
      FROM "CargasCombustible" c
      JOIN referencias r ON r."idUnidad" = c."idUnidad"
  ),
  lecturas AS (
      SELECT b.*, (b.kilometraje <= b.referencia + 2000
                   AND b.kilometraje >= b.referencia - b."cantidadPosterior" * 15 - 2000) AS confiable
      FROM base b
  ),
  agrupadas AS (
      SELECT l.*, COUNT(*) FILTER (WHERE l.confiable) OVER (
                 PARTITION BY l."idUnidad", l."unidadMedida" ORDER BY l.fecha DESC, l."idCargaCombustible" DESC
                 ROWS UNBOUNDED PRECEDING) AS tramo
      FROM lecturas l
  ),
  tramos AS (
      SELECT a."idUnidad", a."unidadMedida", a.tramo, SUM(a.cantidad) AS cantidad,
             MAX(a.kilometraje) FILTER (WHERE a.confiable) AS lectura
      FROM agrupadas a
      WHERE a.tramo > 0
      GROUP BY a."idUnidad", a."unidadMedida", a.tramo
  ),
  recorridos AS (
      SELECT t.*, t.lectura - LEAD(t.lectura) OVER (
                 PARTITION BY t."idUnidad", t."unidadMedida" ORDER BY t.tramo) AS km
      FROM tramos t
  )
  SELECT a."idCargaCombustible", a."idUnidad", a."unidadMedida", a.fecha, a.cantidad, a.kilometraje, a.confiable,
         CASE WHEN a.confiable THEN r.km END AS km,
         CASE WHEN a.confiable THEN r.cantidad END AS "cantidadTramo",
         COALESCE(a.confiable AND r.km > 0 AND r.cantidad / r.km * 100 BETWEEN 5 AND 100, FALSE) AS valido
  FROM agrupadas a
  LEFT JOIN recorridos r
      ON r."idUnidad" = a."idUnidad" AND r."unidadMedida" = a."unidadMedida" AND r.tramo = a.tramo`;

// Eficiencia (cantidad cada 100 km) por unidad y unidad de medida en un período, y su semáforo:
// verde igual o mejor que las unidades del mismo tipo, amarillo hasta 15 % peor, rojo más de 15 % peor,
// gris sin tramos válidos o con menos de la mitad del consumo de su tipo (faltan cargas registradas).
// Las cantidades en L y en m³ nunca se mezclan.
export const eficiencia = (desde, hasta) => `
  WITH periodo AS (
      SELECT i."idUnidad", i."unidadMedida", COUNT(*)::int AS cargas, SUM(i.cantidad) AS "cantidadTotal",
             SUM(i."cantidadTramo") FILTER (WHERE i.valido) AS "cantidadIntervalos",
             SUM(i.km) FILTER (WHERE i.valido)::int AS km
      FROM (${CARGAS}) i
      WHERE i.fecha >= ${desde} AND i.fecha < ${hasta}
      GROUP BY i."idUnidad", i."unidadMedida"
  ),
  unidades AS (
      SELECT p.*, u."idTipoUnidad", ROUND(p."cantidadIntervalos" / p.km * 100, 2) AS eficiencia
      FROM periodo p
      JOIN "Unidades" u ON u."idUnidad" = p."idUnidad"
  ),
  referencias AS (
      SELECT x."idTipoUnidad", x."unidadMedida",
             ROUND(SUM(x."cantidadIntervalos") / SUM(x.km) * 100, 2) AS referencia
      FROM unidades x
      WHERE x.km IS NOT NULL
      GROUP BY x."idTipoUnidad", x."unidadMedida"
  )
  SELECT u."idUnidad", u."unidadMedida", u.cargas, u."cantidadTotal", u."cantidadIntervalos", u.km,
         u.eficiencia, r.referencia,
         CASE
             WHEN u.eficiencia IS NULL OR u.eficiencia < r.referencia * 0.5 THEN 'gris'
             WHEN u.eficiencia <= r.referencia THEN 'verde'
             WHEN u.eficiencia <= r.referencia * 1.15 THEN 'amarillo'
             ELSE 'rojo'
         END AS semaforo
  FROM unidades u
  LEFT JOIN referencias r ON r."idTipoUnidad" = u."idTipoUnidad" AND r."unidadMedida" = u."unidadMedida"`;

export function contarColores(filas) {
  const conteo = Object.fromEntries(COLORES.map((color) => [color, 0]));
  for (const { semaforo, cantidad } of filas) conteo[semaforo] = cantidad;
  return conteo;
}
