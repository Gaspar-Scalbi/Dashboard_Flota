import { enCache } from "../libs/cache.js";
import {
  consumoMensual,
  eficienciaFlota12Meses,
  unidadesDelMes,
  cargasDeUnidadEnMes
} from "../consultas/combustible.js";

const esMes = (mes) => /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);

export const datosCombustible = () => enCache("combustible", async () => {
  const [consumo, eficiencia] = await Promise.all([consumoMensual(), eficienciaFlota12Meses()]);
  return { consumo, eficiencia };
});
export const datosMes = (mes) => enCache(`combustible/${mes}`, () => unidadesDelMes(mes));
export const datosCargasDeUnidad = (idUnidad, mes) =>
  enCache(`combustible/${mes}/${idUnidad}`, () => cargasDeUnidadEnMes(idUnidad, mes));

export const getCombustible = async (req, res) => {
  res.json(await datosCombustible());
};

export const getMes = async (req, res) => {
  const { mes } = req.params;
  if (!esMes(mes)) return res.status(404).json({ error: "Mes inválido." });
  res.json(await datosMes(mes));
};

export const getCargasDeUnidad = async (req, res) => {
  const { mes } = req.params;
  const idUnidad = Number(req.params.idUnidad);
  if (!esMes(mes) || !Number.isInteger(idUnidad)) {
    return res.status(404).json({ error: "Consulta inválida." });
  }
  const datos = await datosCargasDeUnidad(idUnidad, mes);
  if (!datos) return res.status(404).json({ error: "Unidad inexistente." });
  res.json(datos);
};
