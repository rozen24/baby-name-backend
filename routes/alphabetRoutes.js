import express from "express";
import { addAlphabet, getAlphabets, updateAlphabet, deleteAlphabet } from "../controllers/alphabetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addAlphabet);
router.get("/", getAlphabets);
router.put("/:id", protect, updateAlphabet);
router.delete("/:id", protect, deleteAlphabet);

export default router;
