import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { getFlotaRequest } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { BarrasCategorias, COLOR_ESTADO } from "../components/Graficos.jsx";
import { numero } from "../utils/formato.js";

export default function FlotaPage() {
  const navigate = useNavigate();
  const consulta = useConsulta(getFlotaRequest, []);
  const rutaEstado = (estado) => `/flota/${encodeURIComponent(estado)}`;

  return (
    <>
      <Encabezado migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Flota", a: "/flota" }]}
        titulo="Flota por estado" descripcion="Seleccioná un estado para ver sus unidades." />
      <Contenido consulta={consulta}>
        {(estados) => {
          const activos = estados.filter((e) => e.estado !== "Baja");
          const enFlota = activos.reduce((total, e) => total + e.cantidad, 0);
          const conChofer = activos.reduce((total, e) => total + e.conChofer, 0);
          const registradas = estados.reduce((total, e) => total + e.cantidad, 0);

          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Unidades registradas" valor={numero(registradas)} detalle="Incluye las dadas de baja" />
                <Tarjeta titulo="En la flota" valor={numero(enFlota)} tono="verde" detalle="Sin contar las bajas" />
                <Tarjeta titulo="Con chofer asignado" valor={numero(conChofer)} detalle="Asignación vigente" />
                <Tarjeta titulo="Sin chofer asignado" valor={numero(enFlota - conChofer)} tono="amarillo"
                  detalle="Unidades en la flota" />
              </div>
              <div className="grilla dos">
                <Panel titulo="Unidades por estado">
                  <BarrasCategorias datos={estados} categoria="estado" nombreValor="Unidades"
                    colorDe={(fila) => COLOR_ESTADO[fila.estado]} alElegir={(fila) => navigate(rutaEstado(fila.estado))} />
                </Panel>
                <Panel titulo="Detalle por estado">
                  <Tabla filas={estados} clave={(fila) => fila.estado} destino={(fila) => rutaEstado(fila.estado)}
                    textoEnlace="Ver unidades"
                    columnas={[
                      { titulo: "Estado", valor: (fila) => (
                        <span className="conPunto"><span className="punto" style={{ background: COLOR_ESTADO[fila.estado] }} />{fila.estado}</span>
                      ) },
                      { titulo: "Unidades", clase: "numero", valor: (fila) => numero(fila.cantidad) },
                      { titulo: "Con chofer", clase: "numero", valor: (fila) => numero(fila.conChofer) }
                    ]} />
                </Panel>
              </div>
            </>
          );
        }}
      </Contenido>
    </>
  );
}
