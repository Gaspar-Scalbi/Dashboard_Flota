import { Router } from "express";
import { getTablero, getImportacion } from "../controllers/tablero.controller.js";
import { validateToken } from "../middleware/validateToken.js";

const router = Router();

router.get("/tablero", validateToken, getTablero);
router.get("/importacion", validateToken, getImportacion);

export default router;
