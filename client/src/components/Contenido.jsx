function Esqueleto() {
  return (
    <div className="esqueleto" aria-busy="true" aria-label="Cargando">
      <div className="tarjetas">
        {[1, 2, 3, 4].map((i) => <div key={i} className="bloque tarjetaVacia" />)}
      </div>
      <div className="grilla dos">
        <div className="bloque panelVacio" />
        <div className="bloque panelVacio" />
      </div>
    </div>
  );
}

export default function Contenido({ consulta, children }) {
  if (consulta.cargando) return <Esqueleto />;
  if (consulta.error) return <p className="mensajeEstado error" role="alert">{consulta.error}</p>;
  return children(consulta.datos);
}
