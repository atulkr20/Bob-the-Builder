import { Router } from "express";
import { sendMessage, getMessage } from "../controllers/message.controllers.js";
import { validateService } from "../middlewares/service.middleware.js";

const router = Router({ mergeParams: true });
// mergeParams is critical here because serviceId is in the Parent URL

router.use(validateService);

router.post("/message", sendMessage);
router.get("/messages", getMessage);

export default router;