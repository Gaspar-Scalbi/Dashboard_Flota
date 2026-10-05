import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, isAuth, errors: loginError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) navigate("/inicio");
  }, [isAuth, navigate]);

  const onSubmit = handleSubmit(async (datos) => {
    await signin(datos);
  });

  return (
    <main className="bodyLogin">
      <div className="contenedorLogin">
        <header className="marcaLogin">
          <img src="/assets/LogoAnzano.png" alt="" />
          <div className="nombreMarca"><strong>ANZANO</strong><span>LOGÍSTICA</span></div>
          <p>DASHBOARD DE FLOTA</p>
        </header>

        <section className="zonaLogin">
          <h1>Inicio de sesión</h1>
          <p className="descripcionLogin">Ingresá para acceder al dashboard de flota.</p>
          <form className="formLogin" onSubmit={onSubmit}>
            <div className="divLabel">
              <label className="labelForm" htmlFor="nombreUsuario">Nombre de usuario</label>
              <input className="inputForm" id="nombreUsuario" type="text"
                autoComplete="username" {...register("nombreUsuario", { required: true })} />
              {errors.nombreUsuario && <span className="spanLogin">Ingresá tu usuario.</span>}
            </div>
            <div className="divLabel">
              <label className="labelForm" htmlFor="contrasena">Contraseña</label>
              <input className="inputForm" id="contrasena" type="password"
                autoComplete="current-password" {...register("contrasena", { required: true })} />
              {errors.contrasena && <span className="spanLogin">Ingresá tu contraseña.</span>}
            </div>
            {loginError && <p className="spanLogin errorGeneral" role="alert">{loginError}</p>}
            <button className="btn" type="submit">Ingresar</button>
          </form>
        </section>
        <footer className="pieLogin"><span>Anzano Logística</span><span>Novomilog S.A.</span></footer>
      </div>
    </main>
  );
}
