-- Ejecutar conectado a dashboard_flota.
-- Consultas sobre los usuarios del tablero y la importación desde la réplica.

-- 1. Usuarios del tablero (la contraseña se guarda como hash de bcrypt, nunca en texto).
SELECT "idUsuario", "nombreUsuario", nombre, activo
FROM "Usuarios"
ORDER BY "idUsuario";

-- 2. Resultado de la última importación.
SELECT "ultimoIntento", "resultadoUltimoIntento", "mensajeUltimoIntento", "ultimaCargaExitosa", generacion, "datosAl"
FROM importacion.estado;

-- 3. Cantidad de registros recibidos por entidad en la zona previa.
SELECT entidad, COUNT(*) AS "Registros"
FROM importacion.registros
GROUP BY entidad
ORDER BY entidad;

-- 4. Cantidad de unidades, choferes y cargas cargadas en el modelo.
SELECT COUNT(*) AS "Unidades" FROM "Unidades";
SELECT COUNT(*) AS "Choferes" FROM "Choferes";
SELECT COUNT(*) AS "Cargas" FROM "CargasCombustible";
