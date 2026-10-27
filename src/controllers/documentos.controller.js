import { COLORES } from "../consultas/comunes.js";
import { semaforoDocumentos, documentosPorTipo, documentosDelColor } from "../consultas/documentos.js";

export const getDocumentos = async (req, res) => {
  const [colores, tipos] = await Promise.all([semaforoDocumentos(), documentosPorTipo()]);
  res.json({ colores, tipos });
};

export const getDocumentosDelColor = async (req, res) => {
  const { color } = req.params;
  if (!COLORES.includes(color)) return res.status(404).json({ error: "Color inexistente." });
  res.json(await documentosDelColor(color));
};
