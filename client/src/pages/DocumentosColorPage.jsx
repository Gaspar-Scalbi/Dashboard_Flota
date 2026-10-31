import { useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getDocumentosDelColorRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { DOCUMENTOS_COLOR, Referencia, Semaforo, VENCIMIENTO } from "../components/Semaforo.jsx";
import { dias, fecha } from "../utils/formato.js";

export default function DocumentosColorPage() {
  const { color } = useParams();
  const consulta = useConsulta(() => getDocumentosDelColorRequest(color), [color]);
  const nombre = DOCUMENTOS_COLOR[color] ?? color;

  return (
    <>
      <Encabezado
        migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Documentación", a: "/documentacion" },
          { texto: nombre, a: `/documentacion/${color}` }]}
        titulo={`Documentos: ${nombre.toLowerCase()}`}
        descripcion="Seleccioná una fila para ver la ficha de la unidad." />
      <Contenido consulta={consulta}>
        {(documentos) => (
          <>
            <Panel titulo={`${documentos.length} documentos`}>
              <Tabla filas={documentos} clave={(d) => d.idDocumentoUnidad} textoEnlace="Ver unidad"
                destino={(d) => `/documentacion/${color}/unidad/${d.idUnidad}`}
                vacio="No hay documentos en esta situación."
                columnas={[
                  { titulo: "Unidad", clase: "mono", valor: (d) => d.interno },
                  { titulo: "Patente", clase: "mono", valor: (d) => d.patente },
                  { titulo: "Documento", valor: (d) => d.tipoDocumento },
                  { titulo: "Vencimiento", valor: (d) => fecha(d.fechaVencimiento) },
                  { titulo: "Plazo", valor: (d) => dias(d.diasRestantes) },
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
