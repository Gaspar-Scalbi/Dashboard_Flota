import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getDocumentosRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { BarrasApiladas, COLOR } from "../components/Graficos.jsx";
import { DOCUMENTOS_COLOR, ORDEN_COLORES, Referencia, VENCIMIENTO } from "../components/Semaforo.jsx";
import { numero } from "../utils/formato.js";

const DETALLE = {
  rojo: "Fecha anterior a hoy",
  amarillo: "Hasta 30 días desde hoy",
  verde: "Más de 30 días",
  gris: "Dato faltante"
};

export default function DocumentosPage() {
  const navigate = useNavigate();
  const consulta = useConsulta(getDocumentosRequest, []);
  const series = ORDEN_COLORES.map((color) => ({ clave: color, nombre: DOCUMENTOS_COLOR[color], color: COLOR[color] }));

  return (
    <>
      <Encabezado migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Documentación", a: "/documentacion" }]}
        titulo="Documentación y vencimientos"
        descripcion="Documentos de las unidades en la flota según su vencimiento. Seleccioná un color para ver el listado." />
      <Contenido consulta={consulta}>
        {({ colores, tipos }) => (
          <>
            <div className="tarjetas">
              {ORDEN_COLORES.map((color) => (
                <Tarjeta key={color} titulo={DOCUMENTOS_COLOR[color]}
                  valor={numero(colores[color])} tono={color} detalle={DETALLE[color]} a={`/documentacion/${color}`} />
              ))}
            </div>
            <div className="grilla dos">
              <Panel titulo="Situación por tipo de documento" descripcion="Seleccioná un color del gráfico para ver sus documentos.">
                <BarrasApiladas datos={tipos} categoria="tipoDocumento" series={series}
                  alElegir={(color) => navigate(`/documentacion/${color}`)} />
              </Panel>
              <Panel titulo="Detalle por tipo">
                <Tabla filas={tipos} clave={(t) => t.tipoDocumento}
                  columnas={[
                    { titulo: "Documento", valor: (t) => t.tipoDocumento },
                    ...ORDEN_COLORES.map((color) => ({
                      titulo: DOCUMENTOS_COLOR[color], clase: "numero", valor: (t) => numero(t[color])
                    }))
                  ]} />
              </Panel>
            </div>
            <Referencia criterio={VENCIMIENTO} />
          </>
        )}
      </Contenido>
    </>
  );
}
