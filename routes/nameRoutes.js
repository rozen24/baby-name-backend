import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNames,
  createName,
  updateName,
  deleteName,
} from "../controllers/nameController.js";

const router = express.Router();

router.route("/")
  .get(protect, getNames)
  .post(protect, createName);

router.route("/:id")
  .put(protect, updateName)
  .delete(protect, deleteName);

export default router;
