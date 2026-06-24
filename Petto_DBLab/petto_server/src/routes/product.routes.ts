import { Router } from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { checkShiftMiddleware } from "../middlewares/shift.middleware";

const router = Router();

// Public route to view products
router.get("/", getProducts);

// Protected administration routes
router.use(authMiddleware);
router.post("/", requireRole(["admin"]), createProduct);
router.put("/:id", requireRole(["admin", "staff"]), checkShiftMiddleware, updateProduct);
router.delete("/:id", requireRole(["admin"]), deleteProduct);

export default router;
