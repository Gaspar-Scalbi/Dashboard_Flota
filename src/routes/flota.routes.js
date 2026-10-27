import { Router } from "express";
import { getFlota, getUnidadesDelEstado, getUnidad } from "../controllers/flota.controller.js";
import { validateToken } from "../middleware/validateToken.js";

const router = Router();

router.get("/flota", validateToken, getFlota);
router.get("/flota/:estado", validateToken, getUnidadesDelEstado);
router.get("/unidades/:idUnidad", validateToken, getUnidad);

export default router;
