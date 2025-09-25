import express from "express";
import { protect, superadminOnly } from "../middleware/authMiddleware.js";
import {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);

router.route("/")
  .get(protect, superadminOnly, getUsers) // only superadmin can see all users
  .post(protect, superadminOnly, createUser);

router.route("/:id")
  .put(protect, superadminOnly, updateUserRole)
  .delete(protect, superadminOnly, deleteUser);

export default router;

