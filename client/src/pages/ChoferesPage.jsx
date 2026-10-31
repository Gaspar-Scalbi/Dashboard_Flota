import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getChoferesRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { BarrasCategorias, COLOR } from "../components/Graficos.jsx";
import { LICENCIAS_COLOR, ORDEN_COLORES, Referencia, Semaforo, VENCIMIENTO } from "../components/Semaforo.jsx";
import { numero } from "../utils/formato.js";

export default function ChoferesPage() {
  const navigate = useNavigate();
  const consulta = useConsulta(getChoferesRequest, []);

  return (
    <>
      <Encabezado migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Choferes", a: "/choferes" }]}
        titulo="Choferes y licencias"
        descripcion="Choferes activos según el vencimiento de su licencia. Seleccioná una situación para ver el listado." />
      <Contenido consulta={consulta}>
        {({ colores, activos, conUnidad }) => {
          const situaciones = ORDEN_COLORES.map((color) => ({
            color, situacion: LICENCIAS_COLOR[color], cantidad: colores[color]
          }));
          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Choferes activos" valor={numero(activos)} />
                <Tarjeta titulo="Con unidad asignada" valor={numero(conUnidad)} detalle="Asignación vigente" />
                <Tarjeta titulo="Licencias vencidas" valor={numero(colores.rojo)} tono="rojo" a="/choferes/rojo" />
                <Tarjeta titulo="Licencias por vencer" valor={numero(colores.amarillo)} tono="amarillo"
                  detalle="Hasta 30 días desde hoy" a="/choferes/amarillo" />
              </div>
              <div className="grilla dos">
                <Panel titulo="Licencias por situación">
                  <BarrasCategorias datos={situaciones} categoria="situacion" nombreValor="Choferes"
                    colorDe={(fila) => COLOR[fila.color]} alElegir={(fila) => navigate(`/choferes/${fila.color}`)} />
                </Panel>
                <Panel titulo="Detalle por situación">
                  <Tabla filas={situaciones} clave={(fila) => fila.color} destino={(fila) => `/choferes/${fila.color}`}
                    textoEnlace="Ver choferes"
                    columnas={[
                      { titulo: "Situación", valor: (fila) => <Semaforo color={fila.color} criterio={VENCIMIENTO} /> },
                      { titulo: "Choferes", clase: "numero", valor: (fila) => numero(fila.cantidad) }
                    ]} />
                </Panel>
              </div>
              <Referencia criterio={VENCIMIENTO} />
            </>
          );
        }}
      </Contenido>
    </>
  );
}
