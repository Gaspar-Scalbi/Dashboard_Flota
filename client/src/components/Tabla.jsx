import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SIN_DATO, SIN_TRAMO } from "../utils/formato.js";
import { precargar } from "../api/cache.js";

const VALORES_APAGADOS = new Set([SIN_DATO, SIN_TRAMO, "Sin fecha", "Sin asignación"]);

function Celda({ valor }) {
  return VALORES_APAGADOS.has(valor) ? <span className="apagado">{valor}</span> : valor;
}

export default function Tabla({
  columnas, filas, clave, destino, precarga, textoEnlace = "Ver detalle", porPagina = 12,
  vacio = "No hay registros para mostrar."
}) {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(0);

  if (filas.length === 0) return <p className="vacio">{vacio}</p>;

  const paginas = Math.ceil(filas.length / porPagina);
  const desde = pagina * porPagina;
  const visibles = filas.slice(desde, desde + porPagina);

  return (
    <>
      <div className="tablaContenedor">
        <table className="tabla">
          <thead>
            <tr>
              {columnas.map((columna) => <th key={columna.titulo} className={columna.clase}>{columna.titulo}</th>)}
              {destino && <th className="accion"><span className="oculto">Detalle</span></th>}
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => {
              const ruta = destino?.(fila);
              return (
                <tr key={clave(fila)} className={ruta ? "elegible" : undefined}
                  onClick={ruta ? () => navigate(ruta) : undefined}
                  onMouseEnter={precarga ? () => precargar(precarga(fila)) : undefined}>
                  {columnas.map((columna) => (
                    <td key={columna.titulo} className={columna.clase}><Celda valor={columna.valor(fila)} /></td>
                  ))}
                  {destino && (
                    <td className="accion">
                      {ruta && (
                        <Link to={ruta} aria-label={textoEnlace} title={textoEnlace}
                          onClick={(evento) => evento.stopPropagation()}>›</Link>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {paginas > 1 && (
        <div className="paginacion">
          <span>Mostrando {desde + 1}–{Math.min(desde + porPagina, filas.length)} de {filas.length}</span>
          <div>
            <button type="button" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
            <span>Página {pagina + 1} de {paginas}</span>
            <button type="button" disabled={pagina === paginas - 1} onClick={() => setPagina(pagina + 1)}>Siguiente →</button>
          </div>
        </div>
      )}
    </>
  );
}
