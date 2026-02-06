import { Router } from "express";
import { createService } from "../controllers/service.controller.js";

const router = Router();

router.post('/', createService);

export default router;