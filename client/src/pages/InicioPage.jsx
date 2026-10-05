import { useState } from "react";
import { useAuth } from "../context/authContext.jsx";

export default function InicioPage() {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      await logout();
    } catch {
      setError("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  return (
    <main className="paginaInicio">
      <header className="cabeceraInicio">
        <div className="cabeceraContenido">
          <div className="marcaInicio">
            <img src="/assets/LogoAnzano.png" alt="" />
            <div>
              <span>ANZANO <em>LOGÍSTICA</em></span>
              <small>Dashboard de Flota</small>
            </div>
          </div>
          <button className="btn btnSalir" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      <section className="tarjetaInicio">
        <span className="estadoInicio"><span aria-hidden="true" />Sesión activa</span>
        <h1>Hola, {user.nombre}</h1>
        <p>Iniciaste sesión correctamente.</p>
        <div className="detalleUsuario"><span>Nombre de usuario</span><strong>{user.nombreUsuario}</strong></div>
        {error && <p className="spanLogin" role="alert">{error}</p>}
      </section>
    </main>
  );
}
