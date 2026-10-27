import pg from "pg";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE
} from "./config.js";

const { Pool, types } = pg;

// Fechas como texto (sin correr la zona horaria) y NUMERIC/BIGINT como números.
types.setTypeParser(types.builtins.DATE, (valor) => valor);
types.setTypeParser(types.builtins.TIMESTAMP, (valor) => valor);
types.setTypeParser(types.builtins.NUMERIC, Number.parseFloat);
types.setTypeParser(types.builtins.INT8, Number.parseInt);

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE
});
