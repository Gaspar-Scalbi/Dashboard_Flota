import {
  consumoMensual,
  eficienciaFlota12Meses,
  unidadesDelMes,
  cargasDeUnidadEnMes
} from "../consultas/combustible.js";

const esMes = (mes) => /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);

export const getCombustible = async (req, res) => {
  const [consumo, eficiencia] = await Promise.all([consumoMensual(), eficienciaFlota12Meses()]);
  res.json({ consumo, eficiencia });
};

export const getMes = async (req, res) => {
  const { mes } = req.params;
  if (!esMes(mes)) return res.status(404).json({ error: "Mes inválido." });
  res.json(await unidadesDelMes(mes));
};

export const getCargasDeUnidad = async (req, res) => {
  const { mes } = req.params;
  const idUnidad = Number(req.params.idUnidad);
  if (!esMes(mes) || !Number.isInteger(idUnidad)) {
    return res.status(404).json({ error: "Consulta inválida." });
  }
  const datos = await cargasDeUnidadEnMes(idUnidad, mes);
  if (!datos) return res.status(404).json({ error: "Unidad inexistente." });
  res.json(datos);
};
