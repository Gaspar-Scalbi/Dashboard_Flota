import { useParams } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getUnidadesDelEstadoRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { Referencia, Semaforo, VENCIMIENTO } from "../components/Semaforo.jsx";
import { kilometros, nombreCompleto, numero } from "../utils/formato.js";

export default function FlotaEstadoPage() {
  const { estado } = useParams();
  const consulta = useConsulta(() => getUnidadesDelEstadoRequest(estado), [estado]);
  const rutaEstado = `/flota/${encodeURIComponent(estado)}`;

  return (
    <>
      <Encabezado
        migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Flota", a: "/flota" }, { texto: estado, a: rutaEstado }]}
        titulo={`Unidades en estado ${estado}`}
        descripcion="Seleccioná una fila para ver la ficha de la unidad." />
      <Contenido consulta={consulta}>
        {(unidades) => {
          const conChofer = unidades.filter((u) => u.idChofer).length;
          const vencidas = unidades.filter((u) => u.documentacion === "rojo").length;
          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo={`Unidades: ${estado}`} valor={numero(unidades.length)} detalle="Estado seleccionado" />
                <Tarjeta titulo="Con chofer asignado" valor={numero(conChofer)} detalle="Asignación vigente" />
                <Tarjeta titulo="Sin chofer asignado" valor={numero(unidades.length - conChofer)} tono="amarillo"
                  detalle="Disponibles para asignar" />
                <Tarjeta titulo="Con documentación vencida" valor={numero(vencidas)} tono="rojo"
                  detalle="Al menos un documento vencido" />
              </div>
              <Panel titulo={`Unidades del estado ${estado}`}>
                <Tabla filas={unidades} clave={(u) => u.idUnidad} textoEnlace="Ver unidad"
                  destino={(u) => `${rutaEstado}/unidad/${u.idUnidad}`}
                  vacio="No hay unidades en este estado."
                  columnas={[
                    { titulo: "Interno", clase: "mono", valor: (u) => u.interno },
                    { titulo: "Patente", clase: "mono", valor: (u) => u.patente },
                    { titulo: "Tipo", valor: (u) => u.tipoUnidad },
                    { titulo: "Chofer asignado", valor: (u) => nombreCompleto(u.nombreChofer, u.apellidoChofer) },
                    { titulo: "Kilometraje", clase: "numero", valor: (u) => kilometros(u.kilometraje) },
                    { titulo: "Documentación", valor: (u) => <Semaforo color={u.documentacion} criterio={VENCIMIENTO} /> }
                  ]} />
              </Panel>
              <Referencia criterio={VENCIMIENTO} titulo="Documentación: se muestra el peor estado de los documentos de la unidad" />
            </>
          );
        }}
      </Contenido>
    </>
  );
}
