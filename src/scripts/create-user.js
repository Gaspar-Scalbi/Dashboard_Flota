import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { DB_PASSWORD } from "../config.js";

const nombreUsuario = process.env.INITIAL_USERNAME?.trim();
const nombre = process.env.INITIAL_NAME?.trim();
const contrasena = process.env.INITIAL_PASSWORD;

try {
  if (!DB_PASSWORD) {
    throw new Error("Completá DB_PASSWORD en .env.local con la contraseña de PostgreSQL.");
  }

  if (!nombreUsuario || nombreUsuario.length > 50 || !nombre || nombre.length > 100) {
    throw new Error("Definí INITIAL_USERNAME e INITIAL_NAME con valores válidos.");
  }
  if (!contrasena) {
    throw new Error("Definí INITIAL_PASSWORD.");
  }

  const hash = await bcrypt.hash(contrasena, 10);
  const result = await pool.query(
    `INSERT INTO "Usuarios" ("nombreUsuario", nombre, "contrasenaHash", activo)
     VALUES ($1, $2, $3, TRUE)
     ON CONFLICT ("nombreUsuario") DO NOTHING
     RETURNING "idUsuario", "nombreUsuario"`,
    [nombreUsuario, nombre, hash]
  );

  if (!result.rows.length) {
    throw new Error("Ese nombre de usuario ya existe. No se modificó su contraseña.");
  }
  console.log(`Usuario creado: ${result.rows[0].nombreUsuario} (ID ${result.rows[0].idUsuario}).`);
} catch (error) {
  console.error("No se pudo crear el usuario:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
