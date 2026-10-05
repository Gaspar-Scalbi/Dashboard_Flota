import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const validateToken = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "No hay una sesión activa." });
  }

  jwt.verify(token, TOKEN_SECRET, (error, usuario) => {
    if (error) {
      return res.status(401).json({ error: "La sesión venció o no es válida." });
    }

    req.userId = usuario.idUsuario;
    next();
  });
};
