import Category from "../models/Category.js";
import BabyName from "../models/BabyName.js";

// ➕ Add Category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Category name is required" });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ error: "Category already exists" });

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get All Categories (with count of baby names)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await BabyName.countDocuments({ category: cat._id });
        return { ...cat.toObject(), count };
      })
    );

    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Category (Super Admin only)
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can delete categories" });
    }

    const { id } = req.params;
    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
