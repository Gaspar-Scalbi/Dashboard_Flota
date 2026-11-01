import { enCache } from "../libs/cache.js";
import { COLORES } from "../consultas/comunes.js";
import { semaforoLicencias, resumenChoferes, choferesDelColor } from "../consultas/choferes.js";

export const datosChoferes = () => enCache("choferes", async () => {
  const [colores, resumen] = await Promise.all([semaforoLicencias(), resumenChoferes()]);
  return { colores, ...resumen };
});
export const datosChoferesDelColor = (color) => enCache(`choferes/${color}`, () => choferesDelColor(color));

export const getChoferes = async (req, res) => {
  res.json(await datosChoferes());
};

export const getChoferesDelColor = async (req, res) => {
  const { color } = req.params;
  if (!COLORES.includes(color)) return res.status(404).json({ error: "Color inexistente." });
  res.json(await datosChoferesDelColor(color));
};
