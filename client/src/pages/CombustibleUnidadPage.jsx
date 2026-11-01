import { useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { RUTAS } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import Odometro from "../components/Odometro.jsx";
import { EFICIENCIA, Referencia } from "../components/Semaforo.jsx";
import {
  cantidad, eficiencia, fechaHora, kilometros, nombreCompleto, nombreMes, numero, SIN_DATO, SIN_TRAMO
} from "../utils/formato.js";

const TONO = { verde: "verde", amarillo: "amarillo", rojo: "rojo", gris: "" };

export default function CombustibleUnidadPage() {
  const { mes, idUnidad } = useParams();
  const consulta = useConsulta(RUTAS.cargasDeUnidad(mes, idUnidad));
  const interno = consulta.datos?.unidad.interno ?? "";

  return (
    <>
      <Encabezado
        migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Combustible", a: "/combustible" },
          { texto: nombreMes(mes), a: `/combustible/${mes}` }, { texto: `Unidad ${interno}`, a: "" }]}
        titulo={`Cargas de la unidad ${interno} en ${nombreMes(mes)}`}
        descripcion="Cada lectura de odómetro confiable cierra un tramo con la lectura anterior de la unidad." />
      <Contenido consulta={consulta}>
        {({ unidad, cargas, eficiencia: resumen }) => (
          <>
            <div className="tarjetas">
              <Tarjeta titulo="Unidad" valor={unidad.interno} detalle={`${unidad.patente} · ${unidad.tipoUnidad}`} />
              <Tarjeta titulo="Cargas del mes" valor={numero(cargas.length)} />
              {resumen.map((fila) => (
                <Tarjeta key={`c-${fila.unidadMedida}`} titulo={`Cantidad cargada (${fila.unidadMedida})`}
                  valor={cantidad(fila.cantidadTotal, fila.unidadMedida)} detalle={`${kilometros(fila.km)} en tramos válidos`} />
              ))}
              {resumen.map((fila) => (
                <Tarjeta key={`e-${fila.unidadMedida}`} titulo="Eficiencia del mes" tono={TONO[fila.semaforo]}
                  valor={eficiencia(fila.eficiencia, fila.unidadMedida)}
                  detalle={`Referencia del tipo: ${eficiencia(fila.referencia, fila.unidadMedida)}`} />
              ))}
            </div>
            <Panel titulo="Cargas de combustible">
              <Tabla filas={cargas} clave={(c) => c.idCargaCombustible} vacio="La unidad no cargó combustible en este mes."
                columnas={[
                  { titulo: "Fecha", valor: (c) => fechaHora(c.fecha) },
                  { titulo: "Chofer", valor: (c) => (c.nombreChofer ? nombreCompleto(c.nombreChofer, c.apellidoChofer) : SIN_DATO) },
                  { titulo: "Combustible", valor: (c) => c.tipoCombustible },
                  { titulo: "Cantidad", clase: "numero", valor: (c) => cantidad(c.cantidad, c.unidadMedida) },
                  { titulo: "Odómetro", clase: "numero", valor: (c) => <Odometro carga={c} /> },
                  { titulo: "Km del tramo", clase: "numero", valor: (c) => (c.valido ? kilometros(c.km) : SIN_TRAMO) },
                  { titulo: "Eficiencia del tramo", clase: "numero", valor: (c) => (c.valido ? eficiencia(c.eficiencia, c.unidadMedida) : SIN_TRAMO) },
                  { titulo: "Lugar", valor: (c) => c.lugar || SIN_DATO }
                ]} />
            </Panel>
            <p className="nota">
              Cada lectura de odómetro confiable cierra un tramo desde la lectura confiable anterior, y el tramo suma los
              litros o m³ de todas sus cargas. Las lecturas que no coinciden con el odómetro de la unidad (por ejemplo, un
              kilometraje mal tipeado en la estación) se marcan como descartadas, pero su cantidad se suma al tramo siguiente.
            </p>
            <Referencia criterio={EFICIENCIA} />
          </>
        )}
      </Contenido>
    </>
  );
}
