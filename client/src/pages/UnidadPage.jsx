import { useLocation, useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getUnidadRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import Odometro from "../components/Odometro.jsx";
import { COLOR_ESTADO } from "../components/Graficos.jsx";
import {
  DOCUMENTOS_COLOR, EFICIENCIA, LICENCIAS_COLOR, Referencia, Semaforo, VENCIMIENTO
} from "../components/Semaforo.jsx";
import {
  cantidad, dias, eficiencia, fecha, fechaHora, kilometros, numero, SIN_DATO, SIN_TRAMO
} from "../utils/formato.js";

function migasDelRecorrido(recorrido, estado, color) {
  const inicio = { texto: "Inicio", a: "/inicio" };
  if (recorrido === "documentacion") {
    return [inicio, { texto: "Documentación", a: "/documentacion" },
      { texto: DOCUMENTOS_COLOR[color], a: `/documentacion/${color}` }];
  }
  if (recorrido === "choferes") {
    return [inicio, { texto: "Choferes", a: "/choferes" },
      { texto: `Licencias: ${LICENCIAS_COLOR[color]}`, a: `/choferes/${color}` }];
  }
  return [inicio, { texto: "Flota", a: "/flota" }, { texto: estado, a: `/flota/${encodeURIComponent(estado)}` }];
}

export default function UnidadPage() {
  const { estado, color, idUnidad } = useParams();
  const recorrido = useLocation().pathname.split("/")[1];
  const consulta = useConsulta(() => getUnidadRequest(idUnidad), [idUnidad]);
  const interno = consulta.datos?.unidad.interno;
  const migas = [...migasDelRecorrido(recorrido, estado, color), { texto: `Unidad ${interno ?? ""}`, a: "" }];

  return (
    <>
      <Encabezado migas={migas} titulo={`Detalle de la unidad ${interno ?? ""}`}
        descripcion="Asignación vigente, documentación y, si la unidad carga combustible, su eficiencia y últimas cargas." />
      <Contenido consulta={consulta}>
        {({ unidad, documentos, cargas, eficiencia: consumo }) => (
          <>
            <div className="tarjetas">
              <Tarjeta titulo="Interno" valor={unidad.interno} />
              <Tarjeta titulo="Patente" valor={unidad.patente} />
              <Tarjeta titulo="Tipo" valor={unidad.tipoUnidad} texto />
              <Tarjeta titulo="Estado" texto valor={<span style={{ color: COLOR_ESTADO[unidad.estado] }}>{unidad.estado}</span>} />
              <Tarjeta titulo="Kilometraje" valor={kilometros(unidad.kilometraje)} />
            </div>

            <div className="grilla unoDos">
              <Panel titulo="Chofer asignado">
                {unidad.idChofer ? (
                  <div className="ficha">
                    <strong className="fichaNombre">{unidad.nombreChofer} {unidad.apellidoChofer}</strong>
                    <span className="fichaDato">Número de licencia<b>{unidad.numeroLicencia || SIN_DATO}</b></span>
                    <span className="fichaDato">Vencimiento de licencia
                      <b>{fecha(unidad.vencimientoLicencia)} <Semaforo color={unidad.semaforoLicencia} criterio={VENCIMIENTO} /></b>
                    </span>
                    <span className="fichaDato">Asignada desde<b>{fecha(unidad.asignadaDesde)}</b></span>
                  </div>
                ) : <p className="vacio">La unidad no tiene un chofer asignado.</p>}
              </Panel>
              <Panel titulo="Documentación de la unidad">
                <Tabla filas={documentos} clave={(d) => d.idDocumentoUnidad} vacio="La unidad no tiene documentos registrados."
                  columnas={[
                    { titulo: "Documento", valor: (d) => d.tipoDocumento },
                    { titulo: "Vencimiento", valor: (d) => fecha(d.fechaVencimiento) },
                    { titulo: "Plazo", valor: (d) => dias(d.diasRestantes) },
                    { titulo: "Situación", valor: (d) => <Semaforo color={d.semaforo} criterio={VENCIMIENTO} /> }
                  ]} />
              </Panel>
            </div>

            {unidad.usaCombustible && (
              <>
                <Panel titulo="Eficiencia de los últimos 12 meses"
                  descripcion="Se compara con las unidades del mismo tipo que usan la misma unidad de medida.">
                  <Tabla filas={consumo} clave={(e) => e.unidadMedida} vacio="La unidad no registra cargas en los últimos 12 meses."
                    columnas={[
                      { titulo: "Medida", valor: (e) => e.unidadMedida },
                      { titulo: "Cargas", clase: "numero", valor: (e) => numero(e.cargas) },
                      { titulo: "Cantidad", clase: "numero", valor: (e) => cantidad(e.cantidadTotal, e.unidadMedida) },
                      { titulo: "Km en tramos válidos", clase: "numero", valor: (e) => kilometros(e.km) },
                      { titulo: "Eficiencia", clase: "numero", valor: (e) => eficiencia(e.eficiencia, e.unidadMedida) },
                      { titulo: "Referencia del tipo", clase: "numero", valor: (e) => eficiencia(e.referencia, e.unidadMedida) },
                      { titulo: "Situación", valor: (e) => <Semaforo color={e.semaforo} criterio={EFICIENCIA} /> }
                    ]} />
                </Panel>

                <Panel titulo="Últimas cargas de combustible" descripcion="Las 15 cargas más recientes de los últimos 12 meses.">
                  <Tabla filas={cargas} clave={(c) => c.idCargaCombustible} vacio="Sin cargas en los últimos 12 meses."
                    columnas={[
                      { titulo: "Fecha", valor: (c) => fechaHora(c.fecha) },
                      { titulo: "Combustible", valor: (c) => c.tipoCombustible },
                      { titulo: "Cantidad", clase: "numero", valor: (c) => cantidad(c.cantidad, c.unidadMedida) },
                      { titulo: "Odómetro", clase: "numero", valor: (c) => <Odometro carga={c} /> },
                      { titulo: "Km del tramo", clase: "numero", valor: (c) => (c.valido ? kilometros(c.km) : SIN_TRAMO) },
                      { titulo: "Lugar", valor: (c) => c.lugar || SIN_DATO }
                    ]} />
                </Panel>
              </>
            )}
            <div className={unidad.usaCombustible ? "grilla dos" : undefined}>
              <Referencia criterio={VENCIMIENTO} titulo="Documentos y licencia" />
              {unidad.usaCombustible && <Referencia criterio={EFICIENCIA} titulo="Eficiencia" />}
            </div>
          </>
        )}
      </Contenido>
    </>
  );
}
