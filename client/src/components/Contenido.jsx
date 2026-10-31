export default function Contenido({ consulta, children }) {
  if (consulta.cargando) return <p className="mensajeEstado" role="status">Cargando datos…</p>;
  if (consulta.error) return <p className="mensajeEstado error" role="alert">{consulta.error}</p>;
  return children(consulta.datos);
}
