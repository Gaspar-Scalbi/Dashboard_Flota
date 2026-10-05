import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./src/context/authContext.jsx";

export default function ProtectedRoute() {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="loading-screen" role="status">Verificando acceso…</div>;
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
}
