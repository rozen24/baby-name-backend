import Alphabet from "../models/Alphabet.js";
import BabyName from "../models/BabyName.js";

// ➕ Add Alphabet
export const addAlphabet = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Alphabet name is required" });

    const existing = await Alphabet.findOne({ name });
    if (existing) return res.status(400).json({ error: "Alphabet already exists" });

    const alphabet = new Alphabet({ name });
    await alphabet.save();

    res.status(201).json(alphabet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get All Alphabets (with count of baby names)
export const getAlphabets = async (req, res) => {
  try {
    const alphabets = await Alphabet.find();

    const withCount = await Promise.all(
      alphabets.map(async (a) => {
        const count = await BabyName.countDocuments({ alphabet: a._id });
        return { ...a.toObject(), count };
      })
    );

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Alphabet
export const updateAlphabet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const alphabet = await Alphabet.findByIdAndUpdate(id, { name }, { new: true });

    if (!alphabet) return res.status(404).json({ error: "Alphabet not found" });

    res.json(alphabet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Alphabet (Super Admin only)
export const deleteAlphabet = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can delete alphabets" });
    }

    const { id } = req.params;
    await Alphabet.findByIdAndDelete(id);

    res.json({ message: "Alphabet deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
