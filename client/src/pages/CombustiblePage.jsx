import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { RUTAS } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { BarrasMensuales, COLOR } from "../components/Graficos.jsx";
import { cantidad, eficiencia, nombreMes, numero } from "../utils/formato.js";

export default function CombustiblePage() {
  const navigate = useNavigate();
  const consulta = useConsulta(RUTAS.combustible);
  const alElegirMes = (mes) => navigate(`/combustible/${mes}`);

  return (
    <>
      <Encabezado migas={[{ texto: "Inicio", a: "/inicio" }, { texto: "Combustible", a: "/combustible" }]}
        titulo="Combustible y eficiencia"
        descripcion="Consumo de los últimos 12 meses. Seleccioná un mes para ver las unidades que cargaron." />
      <Contenido consulta={consulta}>
        {({ consumo, eficiencia: flota }) => {
          const litros = consumo.reduce((total, mes) => total + mes.litros, 0);
          const metros = consumo.reduce((total, mes) => total + mes.metrosCubicos, 0);
          const deMedida = (medida) => flota.find((fila) => fila.unidadMedida === medida);
          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Gasoil en 12 meses" valor={cantidad(litros, "L")} tono="azul" />
                <Tarjeta titulo="GNC en 12 meses" valor={cantidad(metros, "m³")} tono="violeta" />
                <Tarjeta titulo="Eficiencia gasoil" valor={eficiencia(deMedida("L")?.eficiencia, "L")}
                  detalle={`${numero(deMedida("L")?.km)} km en tramos válidos`} />
                <Tarjeta titulo="Eficiencia GNC" valor={eficiencia(deMedida("m³")?.eficiencia, "m³")}
                  detalle={`${numero(deMedida("m³")?.km)} km en tramos válidos`} />
              </div>
              <div className="grilla dos">
                <Panel titulo="Gasoil por mes" descripcion="Litros cargados.">
                  <BarrasMensuales datos={consumo} clave="litros" unidad="L" color={COLOR.azul} alElegir={alElegirMes} />
                </Panel>
                <Panel titulo="GNC por mes" descripcion="Metros cúbicos cargados.">
                  <BarrasMensuales datos={consumo} clave="metrosCubicos" unidad="m³" color={COLOR.violeta} alElegir={alElegirMes} />
                </Panel>
              </div>
              <Panel titulo="Consumo por mes">
                <Tabla filas={[...consumo].reverse()} clave={(mes) => mes.mes} destino={(mes) => `/combustible/${mes.mes}`}
                  textoEnlace="Ver unidades"
                  columnas={[
                    { titulo: "Mes", valor: (mes) => nombreMes(mes.mes) },
                    { titulo: "Gasoil", clase: "numero", valor: (mes) => cantidad(mes.litros, "L") },
                    { titulo: "GNC", clase: "numero", valor: (mes) => cantidad(mes.metrosCubicos, "m³") },
                    { titulo: "Cargas", clase: "numero", valor: (mes) => numero(mes.cargas) }
                  ]} />
              </Panel>
              <p className="nota">
                La eficiencia es la cantidad cargada cada 100 km de toda la flota. Se calcula por tramos entre lecturas de
                odómetro confiables, sumando todas las cargas de cada tramo. Gasoil y GNC se calculan por separado.
              </p>
            </>
          );
        }}
      </Contenido>
    </>
  );
}
