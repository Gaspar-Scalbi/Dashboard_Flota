import { Router } from "express";
import { getCombustible, getMes, getCargasDeUnidad } from "../controllers/combustible.controller.js";
import { validateToken } from "../middleware/validateToken.js";

const router = Router();

router.get("/combustible", validateToken, getCombustible);
router.get("/combustible/:mes", validateToken, getMes);
router.get("/combustible/:mes/unidades/:idUnidad", validateToken, getCargasDeUnidad);

export default router;
