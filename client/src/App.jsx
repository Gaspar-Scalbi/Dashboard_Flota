import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import ProtectedRoute from "../ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import InicioPage from "./pages/InicioPage.jsx";
import FlotaPage from "./pages/FlotaPage.jsx";
import FlotaEstadoPage from "./pages/FlotaEstadoPage.jsx";
import UnidadPage from "./pages/UnidadPage.jsx";
import CombustiblePage from "./pages/CombustiblePage.jsx";
import CombustibleMesPage from "./pages/CombustibleMesPage.jsx";
import CombustibleUnidadPage from "./pages/CombustibleUnidadPage.jsx";
import DocumentosPage from "./pages/DocumentosPage.jsx";
import DocumentosColorPage from "./pages/DocumentosColorPage.jsx";
import ChoferesPage from "./pages/ChoferesPage.jsx";
import ChoferesColorPage from "./pages/ChoferesColorPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/inicio" element={<InicioPage />} />

              <Route path="/flota" element={<FlotaPage />} />
              <Route path="/flota/:estado" element={<FlotaEstadoPage />} />
              <Route path="/flota/:estado/unidad/:idUnidad" element={<UnidadPage />} />

              <Route path="/combustible" element={<CombustiblePage />} />
              <Route path="/combustible/:mes" element={<CombustibleMesPage />} />
              <Route path="/combustible/:mes/unidad/:idUnidad" element={<CombustibleUnidadPage />} />

              <Route path="/documentacion" element={<DocumentosPage />} />
              <Route path="/documentacion/:color" element={<DocumentosColorPage />} />
              <Route path="/documentacion/:color/unidad/:idUnidad" element={<UnidadPage />} />

              <Route path="/choferes" element={<ChoferesPage />} />
              <Route path="/choferes/:color" element={<ChoferesColorPage />} />
              <Route path="/choferes/:color/unidad/:idUnidad" element={<UnidadPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
