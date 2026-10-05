import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken, cerrarSesiones, tokenVigente } from "../libs/jwt.js";

export const login = async (req, res) => {
  const { nombreUsuario, contrasena } = req.body || {};
  if (!nombreUsuario || !contrasena) {
    return res.status(400).json({ error: "Ingresá usuario y contraseña." });
  }

  try {
    const result = await pool.query(
      `SELECT "idUsuario", "nombreUsuario", nombre, "contrasenaHash", activo
       FROM "Usuarios" WHERE "nombreUsuario" = $1`,
      [nombreUsuario]
    );
    const usuario = result.rows[0];

    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasenaHash))) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
    if (!usuario.activo) {
      return res.status(403).json({ error: "La cuenta está inactiva." });
    }
    const token = await createAccessToken({ idUsuario: usuario.idUsuario });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 60 * 1000
    });
    res.json({
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      nombre: usuario.nombre
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const logout = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, TOKEN_SECRET, (error, datos) => {
      if (!error) cerrarSesiones(datos.idUsuario);
    });
  }
  res.clearCookie("token", { path: "/" });
  res.json({ mensaje: "Sesión cerrada." });
};

export const verifyToken = (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "No hay una sesión activa." });

  jwt.verify(token, TOKEN_SECRET, async (error, datos) => {
    if (error || !tokenVigente(datos)) return res.status(401).json({ error: "La sesión venció o no es válida." });

    try {
      const result = await pool.query(
        `SELECT "idUsuario", "nombreUsuario", nombre, activo
         FROM "Usuarios" WHERE "idUsuario" = $1`,
        [datos.idUsuario]
      );
      const usuario = result.rows[0];
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ error: "La cuenta ya no tiene acceso." });
      }
      res.json({ user: {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        nombre: usuario.nombre
      } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });
};

export const profile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "idUsuario", "nombreUsuario", nombre, activo
       FROM "Usuarios" WHERE "idUsuario" = $1`,
      [req.userId]
    );
    const usuario = result.rows[0];
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: "La cuenta ya no tiene acceso." });
    }
    res.json({
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      nombre: usuario.nombre
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
