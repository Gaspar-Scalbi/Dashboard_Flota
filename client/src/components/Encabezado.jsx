import { Link } from "react-router-dom";

export default function Encabezado({ migas, titulo, descripcion }) {
  const anterior = migas.at(-2);

  return (
    <header className="encabezado">
      <nav className="migas" aria-label="Ruta de navegación">
        {migas.map((miga, indice) => (
          <span key={indice}>
            {indice > 0 && <span className="separador">›</span>}
            {indice < migas.length - 1
              ? <Link to={miga.a}>{miga.texto}</Link>
              : <span aria-current="page">{miga.texto}</span>}
          </span>
        ))}
      </nav>
      <div className="tituloFila">
        <div>
          <h1>{titulo}</h1>
          {descripcion && <p>{descripcion}</p>}
        </div>
        {anterior && <Link className="volver" to={anterior.a}>← Volver a {anterior.texto}</Link>}
      </div>
    </header>
  );
}
