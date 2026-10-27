import {
  PORT,
  TOKEN_SECRET,
  DB_PASSWORD,
  MIRROR_URL,
  MIRROR_PUBLISHABLE_KEY,
  MIRROR_EMAIL,
  MIRROR_PASSWORD
} from "./config.js";
import app from "./app.js";
import { programarImportacion } from "./importador/programador.js";

if (!DB_PASSWORD) {
  throw new Error("Completá DB_PASSWORD en .env.local con la contraseña de PostgreSQL.");
}

if (!TOKEN_SECRET) {
  throw new Error("Falta definir TOKEN_SECRET.");
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

if (MIRROR_URL && MIRROR_PUBLISHABLE_KEY && MIRROR_EMAIL && MIRROR_PASSWORD) {
  programarImportacion();
} else {
  console.warn("Faltan las variables MIRROR_* en .env.local: la importación desde la réplica está desactivada.");
}
