-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre las cargas de combustible.
-- Gasoil se mide en litros (L) y GNC en metros cúbicos (m³): nunca se suman entre sí.

-- 1. Últimas 20 cargas con unidad, chofer y tipo de combustible.
SELECT ca.fecha, u.interno, ch.apellido, tc.nombre AS "Combustible", ca.cantidad, ca."unidadMedida", ca.kilometraje, ca.lugar
FROM "CargasCombustible" ca
INNER JOIN "Unidades" u ON u."idUnidad" = ca."idUnidad"
INNER JOIN "TiposCombustible" tc ON tc."idTipoCombustible" = ca."idTipoCombustible"
LEFT JOIN "Choferes" ch ON ch."idChofer" = ca."idChofer"
ORDER BY ca.fecha DESC
LIMIT 20;

-- 2. Total cargado por tipo de combustible.
SELECT tc.nombre AS "Combustible", ca."unidadMedida", COUNT(*) AS "Cargas", SUM(ca.cantidad) AS "Total"
FROM "CargasCombustible" ca
INNER JOIN "TiposCombustible" tc ON tc."idTipoCombustible" = ca."idTipoCombustible"
GROUP BY tc.nombre, ca."unidadMedida"
ORDER BY "Total" DESC;

-- 3. Total cargado en octubre de 2026, separado por unidad de medida (cambiar las fechas para otro mes).
SELECT "unidadMedida", COUNT(*) AS "Cargas", SUM(cantidad) AS "Total"
FROM "CargasCombustible"
WHERE fecha >= '2026-10-01' AND fecha < '2026-11-01'
GROUP BY "unidadMedida";

-- 4. Las 10 unidades que más litros de gasoil cargaron en octubre de 2026.
SELECT u.interno, u.patente, COUNT(*) AS "Cargas", SUM(ca.cantidad) AS "Litros"
FROM "CargasCombustible" ca
INNER JOIN "Unidades" u ON u."idUnidad" = ca."idUnidad"
WHERE ca."unidadMedida" = 'L' AND ca.fecha >= '2026-10-01' AND ca.fecha < '2026-11-01'
GROUP BY u.interno, u.patente
ORDER BY "Litros" DESC
LIMIT 10;

-- 5. Cantidad de cargas y total por fuente (tarjeta de combustible, surtidor propio, estación).
SELECT fuente, "unidadMedida", COUNT(*) AS "Cargas", SUM(cantidad) AS "Total"
FROM "CargasCombustible"
GROUP BY fuente, "unidadMedida"
ORDER BY "Cargas" DESC;

-- 6. Cantidad de cargas y total de cada chofer.
SELECT ch.apellido, ch.nombre, ca."unidadMedida", COUNT(*) AS "Cargas", SUM(ca.cantidad) AS "Total"
FROM "CargasCombustible" ca
INNER JOIN "Choferes" ch ON ch."idChofer" = ca."idChofer"
GROUP BY ch.apellido, ch.nombre, ca."unidadMedida"
ORDER BY "Cargas" DESC;

-- 7. Cargas de una unidad en particular (cambiar el interno).
SELECT ca.fecha, tc.nombre AS "Combustible", ca.cantidad, ca."unidadMedida", ca.kilometraje, ca.fuente, ca.lugar
FROM "CargasCombustible" ca
INNER JOIN "Unidades" u ON u."idUnidad" = ca."idUnidad"
INNER JOIN "TiposCombustible" tc ON tc."idTipoCombustible" = ca."idTipoCombustible"
WHERE u.interno = '11'
ORDER BY ca.fecha DESC;

-- 8. Unidades que nunca cargaron combustible (por ejemplo, los semirremolques).
SELECT u.interno, u.patente, t.nombre AS "Tipo"
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
LEFT JOIN "CargasCombustible" ca ON ca."idUnidad" = u."idUnidad"
WHERE ca."idCargaCombustible" IS NULL
ORDER BY u.interno;

-- 9. Promedio de litros por carga de cada unidad (solo gasoil).
SELECT u.interno, COUNT(*) AS "Cargas", ROUND(AVG(ca.cantidad), 2) AS "Promedio_Litros"
FROM "CargasCombustible" ca
INNER JOIN "Unidades" u ON u."idUnidad" = ca."idUnidad"
WHERE ca."unidadMedida" = 'L'
GROUP BY u.interno
ORDER BY "Promedio_Litros" DESC;
