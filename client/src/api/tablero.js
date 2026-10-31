import axios from "./axios.js";

export const getTableroRequest = () => axios.get("/tablero");
export const getImportacionRequest = () => axios.get("/importacion");

export const getFlotaRequest = () => axios.get("/flota");
export const getUnidadesDelEstadoRequest = (estado) => axios.get(`/flota/${encodeURIComponent(estado)}`);
export const getUnidadRequest = (idUnidad) => axios.get(`/unidades/${idUnidad}`);

export const getCombustibleRequest = () => axios.get("/combustible");
export const getMesRequest = (mes) => axios.get(`/combustible/${mes}`);
export const getCargasDeUnidadRequest = (mes, idUnidad) => axios.get(`/combustible/${mes}/unidades/${idUnidad}`);

export const getDocumentosRequest = () => axios.get("/documentos");
export const getDocumentosDelColorRequest = (color) => axios.get(`/documentos/${color}`);

export const getChoferesRequest = () => axios.get("/choferes");
export const getChoferesDelColorRequest = (color) => axios.get(`/choferes/${color}`);
