import { enCache } from "../libs/cache.js";
import { ESTADOS } from "../consultas/comunes.js";
import { unidadesPorEstado, unidadesDelEstado, detalleUnidad } from "../consultas/flota.js";

export const datosFlota = () => enCache("flota", unidadesPorEstado);
export const datosEstado = (estado) => enCache(`flota/${estado}`, () => unidadesDelEstado(estado));
export const datosUnidad = (idUnidad) => enCache(`unidad/${idUnidad}`, () => detalleUnidad(idUnidad));

export const getFlota = async (req, res) => {
  res.json(await datosFlota());
};

export const getUnidadesDelEstado = async (req, res) => {
  const { estado } = req.params;
  if (!ESTADOS.includes(estado)) {
    return res.status(404).json({ error: "Estado de unidad inexistente." });
  }
  res.json(await datosEstado(estado));
};

export const getUnidad = async (req, res) => {
  const idUnidad = Number(req.params.idUnidad);
  if (!Number.isInteger(idUnidad)) {
    return res.status(404).json({ error: "Unidad inexistente." });
  }
  const detalle = await datosUnidad(idUnidad);
  if (!detalle) return res.status(404).json({ error: "Unidad inexistente." });
  res.json(detalle);
};
