import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useConsulta } from "../hooks/useConsulta.js";
import { getImportacionRequest } from "../api/tablero.js";
import { instante } from "../utils/formato.js";

const ICONOS = {
  inicio: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  flota: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01",
  choferes: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  combustible: "M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M8 7h4M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3",
  documentacion: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"
};

const SECCIONES = [
  { a: "/inicio", texto: "Inicio", icono: "inicio" },
  { a: "/flota", texto: "Flota", icono: "flota" },
  { a: "/choferes", texto: "Choferes", icono: "choferes" },
  { a: "/combustible", texto: "Combustible", icono: "combustible" },
  { a: "/documentacion", texto: "Documentación", icono: "documentacion" }
];

function Icono({ nombre }) {
  return (
    <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONOS[nombre]} />
    </svg>
  );
}

function EstadoDatos({ consulta }) {
  const datos = consulta.datos;
  if (!datos) return <span>Consultando la última importación…</span>;
  if (!datos.ultimaCargaExitosa) return <span className="aviso">Todavía no se importaron datos del SGU.</span>;
  return (
    <span>
      Datos del SGU al {instante(datos.datosAl)}
      {datos.resultadoUltimoIntento === "error" && (
        <span className="aviso" title={datos.mensajeUltimoIntento}> · La última actualización falló</span>
      )}
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const importacion = useConsulta(getImportacionRequest, [pathname]);

  return (
    <div className="app">
      <aside className="lateral">
        <div className="marcaLateral">
          <img src="/assets/LogoAnzano.png" alt="" />
          <div><strong>ANZANO</strong><span>LOGÍSTICA</span></div>
        </div>
        <p className="seccionLateral">CONSULTAS</p>
        <nav className="menu">
          {SECCIONES.map((seccion) => (
            <NavLink key={seccion.a} to={seccion.a}>
              <Icono nombre={seccion.icono} />
              {seccion.texto}
            </NavLink>
          ))}
        </nav>
        <div className="pieLateral"><strong>Novomilog S.A.</strong><span>Dashboard de Flota</span></div>
      </aside>

      <div className="principal">
        <header className="barraSuperior">
          <span className="tituloApp">Dashboard de Flota</span>
          <div className="usuario">
            <span>{user?.nombre}</span>
            <button className="btn btnSalir" type="button" onClick={() => logout().catch(() => {})}>Cerrar sesión</button>
          </div>
        </header>
        <main className="contenido">
          <Outlet />
        </main>
        <footer className="pie">
          <span>Anzano Logística</span>
          <EstadoDatos consulta={importacion} />
        </footer>
      </div>
    </div>
  );
}
