import { Router } from "express";
import { createService, renewService } from "../controllers/service.controller.js";

const router = Router();

router.post('/', createService);
router.post('/:serviceId/renew', renewService);

export default router;