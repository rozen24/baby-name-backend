import express from "express";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Origin from "../models/Origin.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyRole } from "../middleware/authMiddleware.js";
import BabyName from "../models/BabyName.js";

const router = express.Router();

// ---------------- USERS ----------------
// Super Admin only
router.get("/users", protect, verifyRole(["superadmin"]), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.put("/users/:id", protect, verifyRole(["superadmin"]), async (req, res) => {
  const { role } = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json(updatedUser);
});

router.delete("/users/:id", protect, verifyRole(["superadmin"]), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// ---------------- CATEGORIES ----------------
router.post("/categories", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.json(category);
});

router.put("/categories/:id", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/categories/:id", protect, verifyRole(["superadmin"]), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

// ---------------- ORIGINS ----------------
router.post("/origins", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const origin = new Origin(req.body);
  await origin.save();
  res.json(origin);
});

router.put("/origins/:id", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const updated = await Origin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/origins/:id", protect, verifyRole(["superadmin"]), async (req, res) => {
  await Origin.findByIdAndDelete(req.params.id);
  res.json({ message: "Origin deleted" });
});

// ---------------- NAMES ----------------
router.post("/names", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const name = new Name({ ...req.body, createdBy: req.user.id });
  await BabyName.save();
  res.json(BabyName);
});

router.put("/names/:id", protect, verifyRole(["editor", "superadmin"]), async (req, res) => {
  const updated = await BabyName.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/names/:id", protect, verifyRole(["superadmin"]), async (req, res) => {
  await BabyName.findByIdAndDelete(req.params.id);
  res.json({ message: "Name deleted" });
});

export default router;
