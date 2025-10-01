// Legacy compatibility: route handler proxies to alphabet controller
import express from "express";
import { addAlphabet as addOrigin, getAlphabets as getOrigins, updateAlphabet as updateOrigin, deleteAlphabet as deleteOrigin } from "../controllers/alphabetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addOrigin);
router.get("/", getOrigins);
router.put("/:id", protect, updateOrigin);
router.delete("/:id", protect, deleteOrigin);

export default router;
