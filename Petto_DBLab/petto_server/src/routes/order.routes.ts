import { Router } from "express";
import { createOrder, updateOrderStatus, cancelOrder, getOrders } from "../controllers/order.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { checkShiftMiddleware } from "../middlewares/shift.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requireRole(["customer", "staff", "admin"]), getOrders);
router.post("/", requireRole(["customer"]), createOrder);
router.put("/:id/status", requireRole(["staff", "admin"]), checkShiftMiddleware, updateOrderStatus);
router.put("/:id/cancel", requireRole(["customer", "staff", "admin"]), checkShiftMiddleware, cancelOrder);

export default router;
