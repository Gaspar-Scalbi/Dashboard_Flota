import { PORT, TOKEN_SECRET, DB_PASSWORD } from "./config.js";
import app from "./app.js";

if (!DB_PASSWORD) {
  throw new Error("Completá DB_PASSWORD en .env.local con la contraseña de PostgreSQL.");
}

if (!TOKEN_SECRET) {
  throw new Error("Falta definir TOKEN_SECRET.");
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
