import Origin from "../models/Origin.js";
import BabyName from "../models/BabyName.js";

// ➕ Add Origin
export const addOrigin = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Origin name is required" });

    const existing = await Origin.findOne({ name });
    if (existing) return res.status(400).json({ error: "Origin already exists" });

    const origin = new Origin({ name });
    await origin.save();

    res.status(201).json(origin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get All Origins (with count of baby names)
export const getOrigins = async (req, res) => {
  try {
    const origins = await Origin.find();

    const originsWithCount = await Promise.all(
      origins.map(async (org) => {
        const count = await BabyName.countDocuments({ origin: org._id });
        return { ...org.toObject(), count };
      })
    );

    res.json(originsWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Origin
export const updateOrigin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const origin = await Origin.findByIdAndUpdate(id, { name }, { new: true });

    if (!origin) return res.status(404).json({ error: "Origin not found" });

    res.json(origin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Origin (Super Admin only)
export const deleteOrigin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can delete origins" });
    }

    const { id } = req.params;
    await Origin.findByIdAndDelete(id);

    res.json({ message: "Origin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
