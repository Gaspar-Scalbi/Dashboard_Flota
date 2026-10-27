import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { pool } from "../db.js";
import { tokenVigente } from "../libs/jwt.js";

export const validateToken = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "No hay una sesión activa." });
  }

  jwt.verify(token, TOKEN_SECRET, async (error, usuario) => {
    if (error || !tokenVigente(usuario)) {
      return res.status(401).json({ error: "La sesión venció o no es válida." });
    }

    try {
      const { rows } = await pool.query(
        `SELECT activo FROM "Usuarios" WHERE "idUsuario" = $1`,
        [usuario.idUsuario]
      );
      if (!rows[0]?.activo) {
        return res.status(401).json({ error: "La cuenta ya no tiene acceso." });
      }
      req.userId = usuario.idUsuario;
      next();
    } catch (errorConsulta) {
      next(errorConsulta);
    }
  });
};
