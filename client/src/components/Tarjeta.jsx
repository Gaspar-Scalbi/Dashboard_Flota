import { Link } from "react-router-dom";

export default function Tarjeta({ titulo, valor, detalle, tono = "neutro", texto = false, a }) {
  const contenido = (
    <>
      <span className="tarjetaTitulo">{titulo}</span>
      <strong className={`tarjetaValor${texto ? " texto" : ""}`}>{valor}</strong>
      {detalle && <span className="tarjetaDetalle">{detalle}</span>}
    </>
  );
  const clase = `tarjeta ${tono}`;
  return a
    ? <Link className={`${clase} elegible`} to={a}>{contenido}</Link>
    : <div className={clase}>{contenido}</div>;
}
