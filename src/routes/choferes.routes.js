import { Router } from "express";
import { getChoferes, getChoferesDelColor } from "../controllers/choferes.controller.js";
import { validateToken } from "../middleware/validateToken.js";

const router = Router();

router.get("/choferes", validateToken, getChoferes);
router.get("/choferes/:color", validateToken, getChoferesDelColor);

export default router;
