import { Router } from "express";
import authRoutes from "./auth.routes";
import petRoutes from "./pet.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import spaRoutes from "./spa.routes";
import orderRoutes from "./order.routes";
import invoiceRoutes from "./invoice.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/spa", spaRoutes);
router.use("/orders", orderRoutes);
router.use("/invoices", invoiceRoutes);

export default router;
