import { Router } from "express";
import { getServices, createBooking, approveBooking, cancelBooking, getBookings } from "../controllers/spa.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { checkShiftMiddleware } from "../middlewares/shift.middleware";

const router = Router();

// Public route to view spa services
router.get("/services", getServices);

// Protected routes
router.use(authMiddleware);
router.get("/bookings", requireRole(["customer", "staff", "admin"]), getBookings);
router.post("/bookings", requireRole(["customer"]), createBooking);
router.put("/bookings/:id/approve", requireRole(["staff", "admin"]), checkShiftMiddleware, approveBooking);
router.put("/bookings/:id/cancel", requireRole(["customer", "staff", "admin"]), checkShiftMiddleware, cancelBooking);

export default router;
