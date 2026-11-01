-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre la documentación de las unidades.

-- 1. Documentos de cada unidad con su tipo.
SELECT u.interno AS "Interno", u.patente AS "Patente", t.nombre AS "Documento", d."fechaEmision" AS "Fecha_Emision", d."fechaVencimiento" AS "Fecha_Vencimiento"
FROM "DocumentosUnidad" d
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
ORDER BY u.interno, t.nombre;

-- 2. Documentos vencidos de unidades que no están de baja (semáforo rojo).
SELECT u.interno AS "Interno", u.patente AS "Patente", t.nombre AS "Documento", d."fechaVencimiento" AS "Fecha_Vencimiento"
FROM "DocumentosUnidad" d
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
WHERE d."fechaVencimiento" < CURRENT_DATE AND u.estado <> 'Baja'
ORDER BY d."fechaVencimiento";

-- 3. Documentos que vencen en los próximos 30 días (semáforo amarillo).
SELECT u.interno AS "Interno", t.nombre AS "Documento", d."fechaVencimiento" AS "Fecha_Vencimiento"
FROM "DocumentosUnidad" d
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
WHERE d."fechaVencimiento" BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 AND u.estado <> 'Baja'
ORDER BY d."fechaVencimiento";

-- 4. Documentos vigentes por más de 30 días (semáforo verde).
SELECT u.interno AS "Interno", t.nombre AS "Documento", d."fechaVencimiento" AS "Fecha_Vencimiento"
FROM "DocumentosUnidad" d
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
WHERE d."fechaVencimiento" > CURRENT_DATE + 30 AND u.estado <> 'Baja'
ORDER BY d."fechaVencimiento";

-- 5. Documentos sin fecha de vencimiento cargada (semáforo gris).
SELECT u.interno AS "Interno", t.nombre AS "Documento"
FROM "DocumentosUnidad" d
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
WHERE d."fechaVencimiento" IS NULL AND u.estado <> 'Baja';

-- 6. Cantidad de documentos por tipo.
SELECT t.nombre AS "Documento", COUNT(*) AS "Cantidad"
FROM "DocumentosUnidad" d
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
GROUP BY t.nombre
ORDER BY "Cantidad" DESC;

-- 7. Cantidad de documentos vencidos por tipo.
SELECT t.nombre AS "Documento", COUNT(*) AS "Vencidos"
FROM "DocumentosUnidad" d
INNER JOIN "TiposDocumento" t ON t."idTipoDocumento" = d."idTipoDocumento"
INNER JOIN "Unidades" u ON u."idUnidad" = d."idUnidad"
WHERE d."fechaVencimiento" < CURRENT_DATE AND u.estado <> 'Baja'
GROUP BY t.nombre
ORDER BY "Vencidos" DESC;
