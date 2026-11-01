import { enCache } from "../libs/cache.js";
import { unidadesPorEstado } from "../consultas/flota.js";
import { consumoMensual, semaforoEficiencia12Meses } from "../consultas/combustible.js";
import { semaforoDocumentos } from "../consultas/documentos.js";
import { semaforoLicencias } from "../consultas/choferes.js";
import { estadoImportacion } from "../consultas/importacion.js";

export const datosTablero = () => enCache("tablero", async () => {
  const [estados, consumo, documentos, licencias, eficiencia] = await Promise.all([
    unidadesPorEstado(),
    consumoMensual(),
    semaforoDocumentos(),
    semaforoLicencias(),
    semaforoEficiencia12Meses()
  ]);
  return { estados, consumo, documentos, licencias, eficiencia };
});

export const getTablero = async (req, res) => {
  res.json(await datosTablero());
};

export const getImportacion = async (req, res) => {
  res.json(await estadoImportacion());
};
