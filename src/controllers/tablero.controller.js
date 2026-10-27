import { unidadesPorEstado } from "../consultas/flota.js";
import { consumoMensual, semaforoEficiencia12Meses } from "../consultas/combustible.js";
import { semaforoDocumentos } from "../consultas/documentos.js";
import { semaforoLicencias } from "../consultas/choferes.js";
import { estadoImportacion } from "../consultas/importacion.js";

export const getTablero = async (req, res) => {
  const [estados, consumo, documentos, licencias, eficiencia] = await Promise.all([
    unidadesPorEstado(),
    consumoMensual(),
    semaforoDocumentos(),
    semaforoLicencias(),
    semaforoEficiencia12Meses()
  ]);
  res.json({ estados, consumo, documentos, licencias, eficiencia });
};

export const getImportacion = async (req, res) => {
  res.json(await estadoImportacion());
};
