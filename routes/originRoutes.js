import express from "express";
import { addOrigin, getOrigins, updateOrigin, deleteOrigin } from "../controllers/originController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addOrigin);
router.get("/", getOrigins);
router.put("/:id", protect, updateOrigin);
router.delete("/:id", protect, deleteOrigin);

export default router;
