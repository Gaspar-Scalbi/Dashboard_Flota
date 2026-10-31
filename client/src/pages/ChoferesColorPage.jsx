import { useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getChoferesDelColorRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { LICENCIAS_COLOR, Referencia, Semaforo, VENCIMIENTO } from "../components/Semaforo.jsx";
import { dias, fecha, SIN_DATO } from "../utils/formato.js";

export default function ChoferesColorPage() {
  const { color } = useParams();
  const consulta = useConsulta(() => getChoferesDelColorRequest(color), [color]);
  const nombre = LICENCIAS_COLOR[color] ?? color;

  return (
    <>
      <Encabezado
        migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Choferes", a: "/choferes" },
          { texto: `Licencias: ${nombre}`, a: `/choferes/${color}` }]}
        titulo={`Licencias: ${nombre.toLowerCase()}`}
        descripcion="Seleccioná un chofer con unidad asignada para ver la ficha de la unidad." />
      <Contenido consulta={consulta}>
        {(choferes) => (
          <>
            <Panel titulo={`${choferes.length} choferes activos`}>
              <Tabla filas={choferes} clave={(c) => c.idChofer} textoEnlace="Ver unidad"
                destino={(c) => (c.idUnidad ? `/choferes/${color}/unidad/${c.idUnidad}` : null)}
                vacio="No hay choferes en esta situación."
                columnas={[
                  { titulo: "Chofer", valor: (c) => `${c.apellido}, ${c.nombre}` },
                  { titulo: "Licencia", valor: (c) => c.numeroLicencia || SIN_DATO },
                  { titulo: "Vencimiento", valor: (c) => fecha(c.vencimientoLicencia) },
                  { titulo: "Plazo", valor: (c) => dias(c.diasRestantes) },
                  { titulo: "Unidad asignada", valor: (c) => (c.idUnidad ? `${c.interno} · ${c.patente}` : "Sin asignación") },
                  { titulo: "Situación", valor: () => <Semaforo color={color} criterio={VENCIMIENTO} /> }
                ]} />
            </Panel>
            <Referencia criterio={VENCIMIENTO} />
          </>
        )}
      </Contenido>
    </>
  );
}
