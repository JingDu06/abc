import { Router } from "express";
import { getCart, addToCart, updateCartQty, removeFromCart } from "../controllers/cart.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(requireRole(["customer"]));

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:ma_sp", updateCartQty);
router.delete("/:ma_sp", removeFromCart);

export default router;
