import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getTableroRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import { BarrasCategorias, BarrasMensuales, COLOR, COLOR_ESTADO } from "../components/Graficos.jsx";
import { ConteoSemaforo, EFICIENCIA, Referencia, VENCIMIENTO } from "../components/Semaforo.jsx";
import { cantidad, nombreMes, numero } from "../utils/formato.js";

export default function InicioPage() {
  const navigate = useNavigate();
  const consulta = useConsulta(getTableroRequest, []);

  return (
    <>
      <Encabezado migas={[{ texto: "Inicio", a: "/inicio" }]} titulo="Resumen de la flota"
        descripcion="Estado actual de las unidades, consumo de combustible de los últimos 12 meses y vencimientos." />
      <Contenido consulta={consulta}>
        {({ estados, consumo, documentos, licencias, eficiencia }) => {
          const enFlota = estados.filter((e) => e.estado !== "Baja").reduce((total, e) => total + e.cantidad, 0);
          const operativas = estados.find((e) => e.estado === "Operativa").cantidad;
          const mesActual = consumo.at(-1);

          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Unidades en la flota" valor={numero(enFlota)}
                  detalle={`${numero(operativas)} operativas`} a="/flota" />
                <Tarjeta titulo="Gasoil del mes" valor={cantidad(mesActual.litros, "L")} tono="azul"
                  detalle={nombreMes(mesActual.mes)} a={`/combustible/${mesActual.mes}`} />
                <Tarjeta titulo="GNC del mes" valor={cantidad(mesActual.metrosCubicos, "m³")} tono="violeta"
                  detalle={nombreMes(mesActual.mes)} a={`/combustible/${mesActual.mes}`} />
                <Tarjeta titulo="Documentos por atender" valor={numero(documentos.rojo + documentos.amarillo)} tono="amarillo"
                  detalle={`${documentos.rojo} vencidos · ${documentos.amarillo} por vencer`} a="/documentacion" />
                <Tarjeta titulo="Licencias por atender" valor={numero(licencias.rojo + licencias.amarillo)} tono="amarillo"
                  detalle={`${licencias.rojo} vencidas · ${licencias.amarillo} por vencer`} a="/choferes" />
              </div>

              <div className="grilla dos">
                <Panel titulo="Flota por estado" descripcion="Seleccioná un estado para consultar sus unidades.">
                  <BarrasCategorias datos={estados} categoria="estado" nombreValor="Unidades"
                    colorDe={(fila) => COLOR_ESTADO[fila.estado]}
                    alElegir={(fila) => navigate(`/flota/${encodeURIComponent(fila.estado)}`)} />
                </Panel>
                <Panel titulo="Gasoil por mes" descripcion="Litros cargados en los últimos 12 meses. Seleccioná un mes para ver sus unidades.">
                  <BarrasMensuales datos={consumo} clave="litros" unidad="L" color={COLOR.azul}
                    alElegir={(mes) => navigate(`/combustible/${mes}`)} />
                </Panel>
              </div>

              <Panel titulo="Semáforos" descripcion="Seleccioná un color para consultar el detalle.">
                <div className="semaforos">
                  <ConteoSemaforo titulo="Documentación de las unidades" conteo={documentos} criterio={VENCIMIENTO}
                    destino={(color) => `/documentacion/${color}`} />
                  <ConteoSemaforo titulo="Licencias de los choferes" conteo={licencias} criterio={VENCIMIENTO}
                    destino={(color) => `/choferes/${color}`} />
                  <ConteoSemaforo titulo="Eficiencia de combustible (12 meses)" conteo={eficiencia} criterio={EFICIENCIA}
                    destino={() => "/combustible"} />
                </div>
                <div className="grilla dos">
                  <Referencia criterio={VENCIMIENTO} titulo="Documentos y licencias" />
                  <Referencia criterio={EFICIENCIA} titulo="Eficiencia de combustible" />
                </div>
              </Panel>
            </>
          );
        }}
      </Contenido>
    </>
  );
}
