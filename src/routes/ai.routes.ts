import { Router } from "express";
import { buildInfrastructure } from "../controllers/ai.controller.js";
const router = Router();

router.post('/build', buildInfrastructure);

export default router;