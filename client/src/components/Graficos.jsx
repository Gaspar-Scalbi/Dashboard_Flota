import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cantidad, compacto, mesCorto, nombreMes, numero } from "../utils/formato.js";

export const COLOR = {
  rojo: "#F86F60",
  amarillo: "#EBB144",
  verde: "#39C285",
  gris: "#7690B0",
  azul: "#5498F5",
  violeta: "#BA85D4"
};

export const COLOR_ESTADO = {
  Operativa: COLOR.verde,
  "En taller": COLOR.amarillo,
  Parada: COLOR.rojo,
  Alquilada: COLOR.violeta,
  Baja: COLOR.gris
};

const MONO = "IBM Plex Mono, monospace";
const EJE = { stroke: "rgba(146,186,250,.16)", tick: { fill: "#8AA3C4", fontSize: 12, fontFamily: MONO } };
const ETIQUETA = { fill: "#AFC5E2", fontSize: 12, fontFamily: MONO, fontWeight: 700 };
const TOOLTIP = {
  contentStyle: { background: "#0B2449", border: "1px solid rgba(146,186,250,.32)", borderRadius: 14, color: "#F4F8FE" },
  itemStyle: { color: "#F4F8FE" },
  labelStyle: { color: "#AFC5E2" },
  cursor: { fill: "rgba(255,255,255,.06)" }
};

// El último mes es el que está en curso: se pinta atenuado para que no se lea como una caída del consumo.
export function BarrasMensuales({ datos, clave, unidad, color, alElegir }) {
  const ultimo = datos.length - 1;
  return (
    <>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={datos} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(146,186,250,.10)" />
          <XAxis dataKey="mes" tickFormatter={mesCorto} {...EJE} />
          <YAxis tickFormatter={numero} width={64} {...EJE} />
          <Tooltip {...TOOLTIP} labelFormatter={nombreMes} formatter={(valor) => [cantidad(valor, unidad), "Consumo"]} />
          <Bar dataKey={clave} radius={[5, 5, 0, 0]} animationDuration={500} cursor="pointer" onClick={(barra) => alElegir(barra.payload.mes)}>
            {datos.map((fila, indice) => (
              <Cell key={fila.mes} fill={color} fillOpacity={indice === ultimo ? 0.45 : 1} />
            ))}
            <LabelList dataKey={clave} position="top" formatter={compacto} {...ETIQUETA} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="nota">La última barra es el mes en curso, todavía incompleto.</p>
    </>
  );
}

export function BarrasCategorias({ datos, categoria, colorDe, alElegir, nombreValor = "Cantidad" }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(170, datos.length * 46)}>
      <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(146,186,250,.10)" />
        <XAxis type="number" allowDecimals={false} {...EJE} />
        <YAxis type="category" dataKey={categoria} width={100} {...EJE} />
        <Tooltip {...TOOLTIP} formatter={(valor) => [numero(valor), nombreValor]} />
        <Bar dataKey="cantidad" barSize={24} animationDuration={500} radius={[0, 5, 5, 0]} cursor="pointer" onClick={(barra) => alElegir(barra.payload)}>
          {datos.map((fila) => <Cell key={fila[categoria]} fill={colorDe(fila)} />)}
          <LabelList dataKey="cantidad" position="right" formatter={numero} {...ETIQUETA} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarrasApiladas({ datos, categoria, series, alElegir }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(190, datos.length * 52)}>
      <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(146,186,250,.10)" />
        <XAxis type="number" allowDecimals={false} {...EJE} />
        <YAxis type="category" dataKey={categoria} width={130} {...EJE} />
        <Tooltip {...TOOLTIP} />
        {series.map((serie) => (
          <Bar key={serie.clave} dataKey={serie.clave} name={serie.nombre} stackId="total" fill={serie.color}
            barSize={24} cursor="pointer" onClick={() => alElegir(serie.clave)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
