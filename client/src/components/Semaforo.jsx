import { Link } from "react-router-dom";

export const ORDEN_COLORES = ["rojo", "amarillo", "verde", "gris"];

export const VENCIMIENTO = {
  rojo: { etiqueta: "Vencido", referencia: "Vencido: la fecha de vencimiento es anterior a hoy." },
  amarillo: { etiqueta: "Por vencer", referencia: "Por vencer: vence en los próximos 30 días." },
  verde: { etiqueta: "Vigente", referencia: "Vigente: faltan más de 30 días para el vencimiento." },
  gris: { etiqueta: "Sin fecha", referencia: "Sin fecha: el SGU no informa el vencimiento." }
};

export const EFICIENCIA = {
  rojo: { etiqueta: "Consumo alto", referencia: "Consumo alto: más de 15 % por encima de su tipo de unidad." },
  amarillo: { etiqueta: "Advertencia", referencia: "Advertencia: hasta 15 % por encima de su tipo de unidad." },
  verde: { etiqueta: "Normal", referencia: "Normal: consume igual o menos que su tipo de unidad." },
  gris: { etiqueta: "Sin dato", referencia: "Sin dato: no tiene tramos válidos o consume menos de la mitad que su tipo, señal de cargas sin registrar." }
};

export const DOCUMENTOS_COLOR = { rojo: "Vencidos", amarillo: "Por vencer", verde: "Vigentes", gris: "Sin fecha" };
export const LICENCIAS_COLOR = { rojo: "Vencidas", amarillo: "Por vencer", verde: "Vigentes", gris: "Sin fecha" };

export function ConteoSemaforo({ titulo, conteo, criterio, destino }) {
  return (
    <div className="conteoSemaforo">
      <span className="conteoTitulo">{titulo}</span>
      <div className="conteoColores">
        {ORDEN_COLORES.map((color) => (
          <Link key={color} to={destino(color)} className={`chip ${color}`}>
            <strong>{conteo[color]}</strong>{criterio[color].etiqueta}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Semaforo({ color, criterio }) {
  if (!color) return <span className="semaforo">Sin documentos</span>;
  return <span className={`semaforo ${color}`}>{criterio[color].etiqueta}</span>;
}

export function Referencia({ criterio, titulo = "Cómo leer los colores" }) {
  return (
    <div className="referencia">
      <strong>{titulo}</strong>
      <ul>
        {ORDEN_COLORES.map((color) => (
          <li key={color}><span className={`punto ${color}`} />{criterio[color].referencia}</li>
        ))}
      </ul>
    </div>
  );
}
