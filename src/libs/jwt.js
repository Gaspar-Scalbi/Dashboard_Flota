import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Un token deja de valer si se emitió antes de que arrancara el servidor o de que su usuario cerrara sesión.
const ARRANQUE = Date.now();
const cierres = new Map();

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign({ ...payload, emitido: Date.now() }, TOKEN_SECRET, { expiresIn: "30m" }, (error, token) => {
      if (error) return reject(error);
      resolve(token);
    });
  });
}

export function cerrarSesiones(idUsuario) {
  cierres.set(idUsuario, Date.now());
}

export function tokenVigente(datos) {
  return datos.emitido >= Math.max(ARRANQUE, cierres.get(datos.idUsuario) ?? 0);
}
