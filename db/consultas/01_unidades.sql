-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre las unidades de la flota.

-- 1. Todas las unidades con el nombre de su tipo.
SELECT u."idUnidad", u.interno, u.patente, t.nombre AS "Tipo", u.estado, u.kilometraje
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
ORDER BY u."idUnidad";

-- 2. Cantidad de unidades por estado.
SELECT estado, COUNT(*) AS "Cantidad"
FROM "Unidades"
GROUP BY estado
ORDER BY "Cantidad" DESC;

-- 3. Cantidad de unidades por tipo.
SELECT t.nombre AS "Tipo", COUNT(*) AS "Cantidad"
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
GROUP BY t.nombre
ORDER BY "Cantidad" DESC;

-- 4. Unidades operativas, de mayor a menor kilometraje.
SELECT u.interno, u.patente, t.nombre AS "Tipo", u.kilometraje
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
WHERE u.estado = 'Operativa'
ORDER BY u.kilometraje DESC;

-- 5. Unidades con su chofer asignado actualmente (la asignación vigente no tiene fecha de fin).
SELECT u.interno, u.patente, u.estado, c.apellido, c.nombre, a."fechaInicio"
FROM "Unidades" u
INNER JOIN "AsignacionesChofer" a ON a."idUnidad" = u."idUnidad"
INNER JOIN "Choferes" c ON c."idChofer" = a."idChofer"
WHERE a."fechaFin" IS NULL
ORDER BY u.interno;

-- 6. Unidades que no están de baja y no tienen chofer asignado.
SELECT u.interno, u.patente, u.estado
FROM "Unidades" u
LEFT JOIN "AsignacionesChofer" a ON a."idUnidad" = u."idUnidad" AND a."fechaFin" IS NULL
WHERE a."idAsignacionChofer" IS NULL AND u.estado <> 'Baja'
ORDER BY u.interno;

-- 7. Unidades en taller o paradas.
SELECT interno, patente, estado, kilometraje
FROM "Unidades"
WHERE estado IN ('En taller', 'Parada')
ORDER BY estado, interno;
