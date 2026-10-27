import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import tableroRoutes from "./routes/tablero.routes.js";
import flotaRoutes from "./routes/flota.routes.js";
import combustibleRoutes from "./routes/combustible.routes.js";
import documentosRoutes from "./routes/documentos.routes.js";
import choferesRoutes from "./routes/choferes.routes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", tableroRoutes);
app.use("/api", flotaRoutes);
app.use("/api", combustibleRoutes);
app.use("/api", documentosRoutes);
app.use("/api", choferesRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
});

export default app;
