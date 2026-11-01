-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre los choferes, sus licencias y sus asignaciones.

-- 1. Choferes activos ordenados por apellido.
SELECT "idChofer", apellido, nombre, "numeroLicencia", "vencimientoLicencia"
FROM "Choferes"
WHERE activo = TRUE
ORDER BY apellido, nombre;

-- 2. Choferes activos con la licencia vencida (semáforo rojo).
SELECT apellido, nombre, "vencimientoLicencia"
FROM "Choferes"
WHERE activo = TRUE AND "vencimientoLicencia" < CURRENT_DATE
ORDER BY "vencimientoLicencia";

-- 3. Choferes activos cuya licencia vence en los próximos 30 días (semáforo amarillo).
SELECT apellido, nombre, "vencimientoLicencia"
FROM "Choferes"
WHERE activo = TRUE AND "vencimientoLicencia" BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
ORDER BY "vencimientoLicencia";

-- 4. Choferes activos con la licencia vigente por más de 30 días (semáforo verde).
SELECT apellido, nombre, "vencimientoLicencia"
FROM "Choferes"
WHERE activo = TRUE AND "vencimientoLicencia" > CURRENT_DATE + 30
ORDER BY "vencimientoLicencia";

-- 5. Choferes activos sin fecha de vencimiento cargada (semáforo gris).
SELECT apellido, nombre
FROM "Choferes"
WHERE activo = TRUE AND "vencimientoLicencia" IS NULL;

-- 6. Choferes con la unidad que manejan hoy.
SELECT c.apellido, c.nombre, u.interno, u.patente, a."fechaInicio"
FROM "Choferes" c
INNER JOIN "AsignacionesChofer" a ON a."idChofer" = c."idChofer"
INNER JOIN "Unidades" u ON u."idUnidad" = a."idUnidad"
WHERE a."fechaFin" IS NULL
ORDER BY c.apellido;

-- 7. Choferes activos sin unidad asignada.
SELECT c.apellido, c.nombre
FROM "Choferes" c
LEFT JOIN "AsignacionesChofer" a ON a."idChofer" = c."idChofer" AND a."fechaFin" IS NULL
WHERE c.activo = TRUE AND a."idAsignacionChofer" IS NULL
ORDER BY c.apellido;

-- 8. Historial completo de asignaciones de cada chofer.
SELECT c.apellido, c.nombre, u.interno, a."fechaInicio", a."fechaFin"
FROM "AsignacionesChofer" a
INNER JOIN "Choferes" c ON c."idChofer" = a."idChofer"
INNER JOIN "Unidades" u ON u."idUnidad" = a."idUnidad"
ORDER BY c.apellido, a."fechaInicio";

-- 9. Cantidad de unidades distintas que manejó cada chofer.
SELECT c.apellido, c.nombre, COUNT(DISTINCT a."idUnidad") AS "Unidades"
FROM "Choferes" c
INNER JOIN "AsignacionesChofer" a ON a."idChofer" = c."idChofer"
GROUP BY c.apellido, c.nombre
ORDER BY "Unidades" DESC;
