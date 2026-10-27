import { ESTADOS } from "../consultas/comunes.js";
import { unidadesPorEstado, unidadesDelEstado, detalleUnidad } from "../consultas/flota.js";

export const getFlota = async (req, res) => {
  res.json(await unidadesPorEstado());
};

export const getUnidadesDelEstado = async (req, res) => {
  const { estado } = req.params;
  if (!ESTADOS.includes(estado)) {
    return res.status(404).json({ error: "Estado de unidad inexistente." });
  }
  res.json(await unidadesDelEstado(estado));
};

export const getUnidad = async (req, res) => {
  const idUnidad = Number(req.params.idUnidad);
  if (!Number.isInteger(idUnidad)) {
    return res.status(404).json({ error: "Unidad inexistente." });
  }
  const detalle = await detalleUnidad(idUnidad);
  if (!detalle) return res.status(404).json({ error: "Unidad inexistente." });
  res.json(detalle);
};
