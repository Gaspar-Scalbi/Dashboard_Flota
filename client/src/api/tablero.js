export const RUTAS = {
  tablero: "/tablero",
  importacion: "/importacion",
  flota: "/flota",
  estado: (estado) => `/flota/${encodeURIComponent(estado)}`,
  unidad: (idUnidad) => `/unidades/${idUnidad}`,
  combustible: "/combustible",
  mes: (mes) => `/combustible/${mes}`,
  cargasDeUnidad: (mes, idUnidad) => `/combustible/${mes}/unidades/${idUnidad}`,
  documentos: "/documentos",
  documentosDelColor: (color) => `/documentos/${color}`,
  choferes: "/choferes",
  choferesDelColor: (color) => `/choferes/${color}`
};
