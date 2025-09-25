// import express from "express";
// import Category from "../models/Category.js";

// const router = express.Router();

// // GET categories
// router.get("/", async (req, res) => {
//   const categories = await Category.find();
//   res.json(categories);
// });

// // POST add category
// router.post("/", async (req, res) => {
//   try {
//     const category = new Category(req.body);
//     await category.save();
//     res.status(201).json(category);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.route("/")
  .get(protect, getCategories)
  .post(protect, addCategory);

router.route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;

