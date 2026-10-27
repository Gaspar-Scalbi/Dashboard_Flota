import {
  MIRROR_URL,
  MIRROR_PUBLISHABLE_KEY,
  MIRROR_EMAIL,
  MIRROR_PASSWORD
} from "../config.js";

export class ErrorMirror extends Error {
  constructor(mensaje, codigo) {
    super(mensaje);
    this.codigo = codigo;
  }
}

let sesion = null;

async function obtenerToken() {
  if (sesion && sesion.vence > Date.now() + 60_000) return sesion.token;

  const respuesta = await fetch(`${MIRROR_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: MIRROR_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: MIRROR_EMAIL, password: MIRROR_PASSWORD })
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new ErrorMirror(`No se pudo iniciar sesión en la réplica: ${datos.error_description || datos.msg || respuesta.status}`);
  }
  sesion = { token: datos.access_token, vence: Date.now() + datos.expires_in * 1000 };
  return sesion.token;
}

export async function exportar(parametros) {
  const respuesta = await fetch(`${MIRROR_URL}/rest/v1/rpc/exportar_tablero`, {
    method: "POST",
    headers: {
      apikey: MIRROR_PUBLISHABLE_KEY,
      Authorization: `Bearer ${await obtenerToken()}`,
      "Content-Type": "application/json",
      "Content-Profile": "mirror"
    },
    body: JSON.stringify(parametros)
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401) sesion = null;
    throw new ErrorMirror(datos.message || `La réplica respondió ${respuesta.status}`, datos.code);
  }
  if (datos.versionContrato !== 2) {
    throw new ErrorMirror(`Versión de contrato no soportada: ${datos.versionContrato}`);
  }
  return datos;
}
