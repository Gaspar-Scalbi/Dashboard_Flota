import { kilometros } from "../utils/formato.js";

export default function Odometro({ carga }) {
  if (carga.confiable) return kilometros(carga.kilometraje);
  return (
    <span className="apagado" title="No coincide con el odómetro de la unidad: sus litros se suman al tramo siguiente.">
      {kilometros(carga.kilometraje)} · descartada
    </span>
  );
}
