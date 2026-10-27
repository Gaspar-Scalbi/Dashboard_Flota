import { Router } from "express";
import { getDocumentos, getDocumentosDelColor } from "../controllers/documentos.controller.js";
import { validateToken } from "../middleware/validateToken.js";

const router = Router();

router.get("/documentos", validateToken, getDocumentos);
router.get("/documentos/:color", validateToken, getDocumentosDelColor);

export default router;
