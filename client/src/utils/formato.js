const entero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
  "septiembre", "octubre", "noviembre", "diciembre"];

export const SIN_DATO = "Sin dato";
export const SIN_TRAMO = "—";

const abreviado = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 });
const abreviadoEntero = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 0 });
const signado = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });

export const numero = (valor) => (valor == null ? SIN_DATO : entero.format(valor));
export const compacto = (valor) => (!valor ? "" : (valor >= 10000 ? abreviadoEntero : abreviado).format(valor));
export const diferencia = (valor, referencia) =>
  valor == null || !referencia ? SIN_DATO : `${signado.format((valor / referencia - 1) * 100)} %`;
export const cantidad = (valor, unidad) => (valor == null ? SIN_DATO : `${entero.format(valor)} ${unidad}`);
export const kilometros = (valor) => (valor == null ? SIN_DATO : `${entero.format(valor)} km`);
export const unidadEficiencia = (unidadMedida) => `${unidadMedida}/100 km`;

export const eficiencia = (valor, unidadMedida) =>
  valor == null ? SIN_DATO : `${decimal.format(valor)} ${unidadEficiencia(unidadMedida)}`;

export function fecha(texto) {
  if (!texto) return "Sin fecha";
  const [anio, mes, dia] = texto.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

export function fechaHora(texto) {
  if (!texto) return SIN_DATO;
  return `${fecha(texto)} ${texto.slice(11, 16)}`;
}

export function instante(iso) {
  if (!iso) return SIN_DATO;
  return new Date(iso).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export function nombreMes(mes) {
  const [anio, numeroMes] = mes.split("-");
  return `${MESES[Number(numeroMes) - 1]} de ${anio}`;
}

export function mesCorto(mes) {
  const [anio, numeroMes] = mes.split("-");
  const nombre = MESES[Number(numeroMes) - 1];
  return `${nombre[0].toUpperCase()}${nombre.slice(1, 3)} ${anio.slice(2)}`;
}

export function dias(valor) {
  if (valor == null) return SIN_DATO;
  if (valor < 0) return `Hace ${-valor} días`;
  if (valor === 0) return "Hoy";
  return `En ${valor} días`;
}

export const nombreCompleto = (nombre, apellido) => (nombre ? `${apellido}, ${nombre}` : "Sin asignación");
