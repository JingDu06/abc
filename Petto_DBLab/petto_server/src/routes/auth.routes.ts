import { Router } from "express";
import { register, login, verifyAccount, resetPassword, getProfile, updateProfile, getUserVouchers, claimVoucher } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-account", verifyAccount);
router.post("/reset-password", resetPassword);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/vouchers", authMiddleware, getUserVouchers);
router.post("/vouchers/claim", authMiddleware, claimVoucher);

export default router;

