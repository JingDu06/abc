import { Router } from "express";
import { getPending, payMerged } from "../controllers/invoice.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { checkShiftMiddleware } from "../middlewares/shift.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/pending", requireRole(["customer", "staff", "admin"]), getPending);
router.post("/pay", requireRole(["customer", "staff", "admin"]), checkShiftMiddleware, payMerged);

export default router;
