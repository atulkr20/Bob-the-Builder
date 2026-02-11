import { Router } from "express";
import { validateService } from "../middlewares/service.middleware.js";
import {
    createGeneratedRecord,
    deleteGeneratedRecord,
    getGeneratedMeta,
    getGeneratedRecordById,
    listGeneratedRecords,
    updateGeneratedRecord
} from "../controllers/generated.controller.js";

const router = Router({ mergeParams: true });

router.use(validateService);
router.get("/meta", getGeneratedMeta);
router.get("/:resource", listGeneratedRecords);
router.post("/:resource", createGeneratedRecord);
router.get("/:resource/:id", getGeneratedRecordById);
router.put("/:resource/:id", updateGeneratedRecord);
router.delete("/:resource/:id", deleteGeneratedRecord);

export default router;
