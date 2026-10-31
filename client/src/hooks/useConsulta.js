import { useEffect, useState } from "react";

export function useConsulta(pedido, dependencias) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: "" });

  useEffect(() => {
    let vigente = true;
    setEstado({ datos: null, cargando: true, error: "" });
    pedido()
      .then((respuesta) => {
        if (vigente) setEstado({ datos: respuesta.data, cargando: false, error: "" });
      })
      .catch((error) => {
        if (vigente) {
          setEstado({
            datos: null,
            cargando: false,
            error: error.response?.data?.error || "No se pudo conectar con el servidor."
          });
        }
      });
    return () => { vigente = false; };
  }, dependencias);

  return estado;
}
