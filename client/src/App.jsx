import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import InicioPage from "./pages/InicioPage.jsx";
import ProtectedRoute from "../ProtectedRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/inicio" element={<InicioPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
