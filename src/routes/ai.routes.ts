import { Router } from "express";
import { buildInfrastructure } from "../controllers/ai.controller.js";
import { createRateLimiter } from "../middlewares/rate-limit.middleware.js";
const router = Router();

router.post('/build', createRateLimiter(10, 60 * 1000), buildInfrastructure);

export default router;
