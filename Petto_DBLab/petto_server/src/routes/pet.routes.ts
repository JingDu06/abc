import { Router } from "express";
import { getPets, addPet, deletePet } from "../controllers/pet.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requireRole(["customer", "admin"]), getPets);
router.post("/", requireRole(["customer"]), addPet);
router.delete("/:id", requireRole(["customer"]), deletePet);

export default router;
