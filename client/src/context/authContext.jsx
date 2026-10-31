import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios.js";
import { loginRequest, logoutRequest, verifyTokenRequest } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyTokenRequest()
      .then((response) => {
        setUser(response.data.user);
        setIsAuth(true);
      })
      .catch(() => {
        setUser(null);
        setIsAuth(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(undefined, (error) => {
      if (error.response?.status === 401 && error.config.url !== "/login") {
        setUser(null);
        setIsAuth(false);
      }
      return Promise.reject(error);
    });
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  async function signin(datos) {
    try {
      setErrors("");
      const response = await loginRequest(datos);
      setUser(response.data);
      setIsAuth(true);
    } catch (error) {
      setErrors(error.response?.data?.error || "No se pudo conectar con el servidor.");
    }
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
    setIsAuth(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAuth, errors, loading, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requiere AuthProvider.");
  return context;
}
