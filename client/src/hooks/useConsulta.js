import { useEffect, useState } from "react";
import { leer, pedir, suscribir } from "../api/cache.js";

export function useConsulta(ruta) {
  const [datos, setDatos] = useState(() => leer(ruta) ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    setDatos(leer(ruta) ?? null);
    setError("");
    const desuscribir = suscribir(ruta, setDatos);
    pedir(ruta).catch((e) => {
      if (!leer(ruta)) setError(e.response?.data?.error || "No se pudo conectar con el servidor.");
    });
    return desuscribir;
  }, [ruta]);

  return { datos, error, cargando: datos === null && !error };
}
