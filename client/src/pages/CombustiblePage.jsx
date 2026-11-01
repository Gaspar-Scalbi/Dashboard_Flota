import { useNavigate } from "react-router-dom";
import { useConsulta } from "../hooks/useConsulta.js";
import { RUTAS } from "../api/tablero.js";
import Encabezado from "../components/Encabezado.jsx";
import Contenido from "../components/Contenido.jsx";
import Tarjeta from "../components/Tarjeta.jsx";
import Panel from "../components/Panel.jsx";
import Tabla from "../components/Tabla.jsx";
import { BarrasMensuales, COLOR } from "../components/Graficos.jsx";
import { cantidad, diferencia, eficiencia, kilometros, nombreMes, numero } from "../utils/formato.js";

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
        {({ consumo }) => {
          const suma = (clave) => consumo.reduce((total, mes) => total + (mes[clave] ?? 0), 0);
          const porCien = (cantidadConsumida, km) => (km ? (cantidadConsumida / km) * 100 : null);
          const kmLitros = suma("kmLitros");
          const kmMetros = suma("kmMetrosCubicos");
          const vsPromedio = (mes) => (
            <span className={`diferencia ${mes.semaforoGeneral}`}>
              {mes.eficienciaGeneral == null ? "Sin dato" : diferencia(100 + mes.eficienciaGeneral, 100)}
            </span>
          );
          const meses = [...consumo].reverse();
          return (
            <>
              <div className="tarjetas">
                <Tarjeta titulo="Gasoil en 12 meses" valor={cantidad(suma("litros"), "L")} tono="azul" />
                <Tarjeta titulo="GNC en 12 meses" valor={cantidad(suma("metrosCubicos"), "m³")} tono="violeta" />
                <Tarjeta titulo="Eficiencia gasoil" valor={eficiencia(porCien(suma("litrosConsumidos"), kmLitros), "L")}
                  detalle={`${numero(kmLitros)} km medidos`} />
                <Tarjeta titulo="Eficiencia GNC" valor={eficiencia(porCien(suma("metrosCubicosConsumidos"), kmMetros), "m³")}
                  detalle={`${numero(kmMetros)} km medidos`} />
              </div>
              <div className="grilla dos">
                <Panel titulo="Gasoil por mes" descripcion="Litros cargados.">
                  <BarrasMensuales datos={consumo} clave="litros" unidad="L" color={COLOR.azul} alElegir={alElegirMes} />
                </Panel>
                <Panel titulo="GNC por mes" descripcion="Metros cúbicos cargados.">
                  <BarrasMensuales datos={consumo} clave="metrosCubicos" unidad="m³" color={COLOR.violeta} alElegir={alElegirMes} />
                </Panel>
              </div>
              <Panel titulo="Cargas por mes" descripcion="Lo que se cargó en cada mes, según la fecha de la carga.">
                <Tabla filas={meses} clave={(mes) => mes.mes} destino={(mes) => `/combustible/${mes.mes}`}
                  textoEnlace="Ver unidades"
                  columnas={[
                    { titulo: "Mes", valor: (mes) => nombreMes(mes.mes) },
                    { titulo: "Gasoil cargado", clase: "numero", valor: (mes) => cantidad(mes.litros, "L") },
                    { titulo: "GNC cargado", clase: "numero", valor: (mes) => cantidad(mes.metrosCubicos, "m³") },
                    { titulo: "Cargas", clase: "numero", valor: (mes) => numero(mes.cargas) }
                  ]} />
              </Panel>
              <Panel titulo="Eficiencia por mes"
                descripcion="Km recorridos y lo consumido en ellos. Consumido ÷ km × 100 da la eficiencia de cada fila.">
                <Tabla filas={meses} clave={(mes) => mes.mes} destino={(mes) => `/combustible/${mes.mes}`}
                  textoEnlace="Ver unidades"
                  columnas={[
                    { titulo: "Mes", valor: (mes) => nombreMes(mes.mes) },
                    { titulo: "Km gasoil", clase: "numero", valor: (mes) => kilometros(mes.kmLitros) },
                    { titulo: "Gasoil consumido", clase: "numero", valor: (mes) => cantidad(mes.litrosConsumidos, "L") },
                    { titulo: "Gasoil c/100 km", clase: "numero", valor: (mes) => eficiencia(mes.eficienciaLitros, "L") },
                    { titulo: "Km GNC", clase: "numero", valor: (mes) => kilometros(mes.kmMetrosCubicos) },
                    { titulo: "GNC consumido", clase: "numero", valor: (mes) => cantidad(mes.metrosCubicosConsumidos, "m³") },
                    { titulo: "GNC c/100 km", clase: "numero", valor: (mes) => eficiencia(mes.eficienciaMetrosCubicos, "m³") },
                    { titulo: "Vs. promedio", clase: "numero", valor: vsPromedio }
                  ]} />
              </Panel>
              <p className="nota">
                Los km salen de tramos entre dos lecturas de odómetro confiables; lo consumido en un tramo es la suma de sus
                cargas. Cada tramo se reparte entre los meses que abarca según los días: uno del 20/09 al 10/10 pone 11/21
                partes en septiembre y 10/21 en octubre. Solo se cuentan los tramos válidos, así que los km son los medidos y
                pueden ser menos que los recorridos. Vs. promedio compara lo consumido en el mes con lo que se habría consumido en
                esos km con el promedio de los 12 meses, gasoil y GNC juntos: verde igual o menos, amarillo hasta 15 % más y rojo
                más de 15 % por encima.
              </p>
            </>
          );
        }}
      </Contenido>
    </>
  );
}
