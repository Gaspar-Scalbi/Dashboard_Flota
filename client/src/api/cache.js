import axios from "./axios.js";
import { RUTAS } from "./tablero.js";

// Última respuesta de cada ruta: se muestra al instante y se actualiza al llegar la nueva.
const datos = new Map();
const pendientes = new Map();
const suscriptores = new Map();

export const leer = (ruta) => datos.get(ruta);

export function suscribir(ruta, avisar) {
  if (!suscriptores.has(ruta)) suscriptores.set(ruta, new Set());
  suscriptores.get(ruta).add(avisar);
  return () => suscriptores.get(ruta).delete(avisar);
}

export function pedir(ruta) {
  if (pendientes.has(ruta)) return pendientes.get(ruta);
  const promesa = axios.get(ruta)
    .then(({ data }) => {
      datos.set(ruta, data);
      suscriptores.get(ruta)?.forEach((avisar) => avisar(data));
      return data;
    })
    .finally(() => pendientes.delete(ruta));
  pendientes.set(ruta, promesa);
  return promesa;
}

export function precargar(ruta) {
  if (ruta && !datos.has(ruta)) pedir(ruta).catch(() => {});
}

export const refrescarTodo = () => Promise.allSettled([...datos.keys()].map(pedir));

export function vaciar() {
  datos.clear();
}

const ESTADOS = ["Operativa", "En taller", "Parada", "Alquilada", "Baja"];
const COLORES = ["rojo", "amarillo", "verde", "gris"];

// Al iniciar sesión se traen los niveles 1 y 2 de todos los recorridos.
export async function precargarTablero() {
  await Promise.allSettled([RUTAS.tablero, RUTAS.importacion, RUTAS.flota, RUTAS.combustible,
    RUTAS.documentos, RUTAS.choferes].map(pedir));
  const meses = leer(RUTAS.combustible)?.consumo.map(({ mes }) => RUTAS.mes(mes)) ?? [];
  [
    ...ESTADOS.map(RUTAS.estado),
    ...COLORES.map(RUTAS.documentosDelColor),
    ...COLORES.map(RUTAS.choferesDelColor),
    ...meses
  ].forEach(precargar);
}
