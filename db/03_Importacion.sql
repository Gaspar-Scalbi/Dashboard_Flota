-- Ejecutar conectado a dashboard_flota, después de 02_Modelo.sql.

CREATE SCHEMA importacion;

CREATE TABLE importacion.registros (
    entidad VARCHAR(30) NOT NULL,
    "idOrigen" INTEGER NOT NULL,
    datos JSONB NOT NULL,
    PRIMARY KEY (entidad, "idOrigen")
);

CREATE TABLE importacion.estado (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    "ultimoIntento" TIMESTAMPTZ,
    "resultadoUltimoIntento" VARCHAR(10),
    "mensajeUltimoIntento" TEXT,
    "ultimaCargaExitosa" TIMESTAMPTZ,
    generacion INTEGER,
    "datosAl" TIMESTAMPTZ,
    detalle JSONB
);

INSERT INTO importacion.estado (id) VALUES (1);
