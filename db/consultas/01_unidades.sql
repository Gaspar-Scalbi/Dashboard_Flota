-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre las unidades de la flota.

-- 1. Todas las unidades con el nombre de su tipo.
SELECT u."idUnidad" AS "Id_Unidad", u.interno AS "Interno", u.patente AS "Patente", t.nombre AS "Tipo", u.estado AS "Estado", u.kilometraje AS "Kilometraje"
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
ORDER BY u."idUnidad";

-- 2. Cantidad de unidades por estado.
SELECT estado AS "Estado", COUNT(*) AS "Cantidad"
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
SELECT u.interno AS "Interno", u.patente AS "Patente", t.nombre AS "Tipo", u.kilometraje AS "Kilometraje"
FROM "Unidades" u
INNER JOIN "TiposUnidad" t ON t."idTipoUnidad" = u."idTipoUnidad"
WHERE u.estado = 'Operativa'
ORDER BY u.kilometraje DESC;

-- 5. Unidades con su chofer asignado actualmente (la asignación vigente no tiene fecha de fin).
SELECT u.interno AS "Interno", u.patente AS "Patente", u.estado AS "Estado", c.apellido AS "Apellido", c.nombre AS "Nombre", a."fechaInicio" AS "Fecha_Inicio"
FROM "Unidades" u
INNER JOIN "AsignacionesChofer" a ON a."idUnidad" = u."idUnidad"
INNER JOIN "Choferes" c ON c."idChofer" = a."idChofer"
WHERE a."fechaFin" IS NULL
ORDER BY u.interno;

-- 6. Unidades que no están de baja y no tienen chofer asignado.
SELECT u.interno AS "Interno", u.patente AS "Patente", u.estado AS "Estado"
FROM "Unidades" u
LEFT JOIN "AsignacionesChofer" a ON a."idUnidad" = u."idUnidad" AND a."fechaFin" IS NULL
WHERE a."idAsignacionChofer" IS NULL AND u.estado <> 'Baja'
ORDER BY u.interno;

-- 7. Unidades en taller o paradas.
SELECT interno AS "Interno", patente AS "Patente", estado AS "Estado", kilometraje AS "Kilometraje"
FROM "Unidades"
WHERE estado IN ('En taller', 'Parada')
ORDER BY estado, interno;
