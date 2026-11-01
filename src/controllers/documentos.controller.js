import { enCache } from "../libs/cache.js";
import { COLORES } from "../consultas/comunes.js";
import { semaforoDocumentos, documentosPorTipo, documentosDelColor } from "../consultas/documentos.js";

export const datosDocumentos = () => enCache("documentos", async () => {
  const [colores, tipos] = await Promise.all([semaforoDocumentos(), documentosPorTipo()]);
  return { colores, tipos };
});
export const datosDocumentosDelColor = (color) => enCache(`documentos/${color}`, () => documentosDelColor(color));

export const getDocumentos = async (req, res) => {
  res.json(await datosDocumentos());
};

export const getDocumentosDelColor = async (req, res) => {
  const { color } = req.params;
  if (!COLORES.includes(color)) return res.status(404).json({ error: "Color inexistente." });
  res.json(await datosDocumentosDelColor(color));
};
