import { COLORES } from "../consultas/comunes.js";
import { semaforoLicencias, resumenChoferes, choferesDelColor } from "../consultas/choferes.js";

export const getChoferes = async (req, res) => {
  const [colores, resumen] = await Promise.all([semaforoLicencias(), resumenChoferes()]);
  res.json({ colores, ...resumen });
};

export const getChoferesDelColor = async (req, res) => {
  const { color } = req.params;
  if (!COLORES.includes(color)) return res.status(404).json({ error: "Color inexistente." });
  res.json(await choferesDelColor(color));
};
