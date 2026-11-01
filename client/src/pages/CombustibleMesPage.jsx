import { useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { RUTAS } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { EFICIENCIA, Referencia, Semaforo } from "../components/Semaforo.jsx";
import { cantidad, diferencia, eficiencia, kilometros, nombreMes, numero } from "../utils/formato.js";

function referencias(unidades) {
  const unicas = new Map();
  for (const u of unidades) {
    if (u.referencia != null) unicas.set(`${u.tipoUnidad}-${u.unidadMedida}`, `${u.tipoUnidad} ${eficiencia(u.referencia, u.unidadMedida)}`);
  }
  return [...unicas.values()].join(" · ") || "sin datos";
}

export default function CombustibleMesPage() {
  const { mes } = useParams();
  const consulta = useConsulta(RUTAS.mes(mes));
  const titulo = nombreMes(mes);

  return (
    <>
      <Encabezado
        migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Combustible", a: "/combustible" },
          { texto: titulo, a: `/combustible/${mes}` }]}
        titulo={`Combustible de ${titulo}`}
        descripcion="Unidades que cargaron en el mes. Seleccioná una fila para ver sus cargas." />
      <Contenido consulta={consulta}>
        {({ unidades, flota }) => {
          const deMedida = (medida) => flota.find((fila) => fila.unidadMedida === medida);
          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Gasoil del mes" valor={cantidad(deMedida("L")?.cantidad ?? 0, "L")} tono="azul"
                  detalle={`${numero(deMedida("L")?.cargas ?? 0)} cargas`} />
                <Tarjeta titulo="GNC del mes" valor={cantidad(deMedida("m³")?.cantidad ?? 0, "m³")} tono="violeta"
                  detalle={`${numero(deMedida("m³")?.cargas ?? 0)} cargas`} />
                <Tarjeta titulo="Eficiencia gasoil" valor={eficiencia(deMedida("L")?.eficiencia, "L")} />
                <Tarjeta titulo="Eficiencia GNC" valor={eficiencia(deMedida("m³")?.eficiencia, "m³")} />
              </div>
              <Panel titulo="Unidades que cargaron combustible"
                descripcion={`Cada unidad se compara con la eficiencia de su tipo en el mes: ${referencias(unidades)}.`}>
                <Tabla filas={unidades} clave={(u) => `${u.idUnidad}-${u.unidadMedida}`} textoEnlace="Ver cargas"
                  destino={(u) => `/combustible/${mes}/unidad/${u.idUnidad}`}
                precarga={(u) => RUTAS.cargasDeUnidad(mes, u.idUnidad)}
                  vacio="No hay cargas registradas en este mes."
                  columnas={[
                    { titulo: "Interno", clase: "mono", valor: (u) => u.interno },
                    { titulo: "Patente", clase: "mono", valor: (u) => u.patente },
                    { titulo: "Tipo", valor: (u) => u.tipoUnidad },
                    { titulo: "Cargas", clase: "numero", valor: (u) => numero(u.cargas) },
                    { titulo: "Cantidad", clase: "numero", valor: (u) => cantidad(u.cantidadTotal, u.unidadMedida) },
                    { titulo: "Km en tramos válidos", clase: "numero", valor: (u) => kilometros(u.km) },
                    { titulo: "Eficiencia", clase: "numero", valor: (u) => eficiencia(u.eficiencia, u.unidadMedida) },
                    { titulo: "Vs. su tipo", clase: "numero", valor: (u) => <span className={`diferencia ${u.semaforo}`}>{diferencia(u.eficiencia, u.referencia)}</span> },
                    { titulo: "Situación", valor: (u) => <Semaforo color={u.semaforo} criterio={EFICIENCIA} /> }
                  ]} />
              </Panel>
              <Referencia criterio={EFICIENCIA} />
            </>
          );
        }}
      </Contenido>
    </>
  );
}
