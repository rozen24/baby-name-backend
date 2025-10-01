import BabyName from "../models/BabyName.js";
import Category from "../models/Category.js";
import Alphabet from "../models/Alphabet.js";
import fs from "fs";
import csv from "csv-parser";
import { Parser } from '@json2csv/plainjs';

// ➕ Add Name
export const addBabyName = async (req, res) => {
  try {
    let { name, gender, category, alphabet, meaning, description } = req.body;

    // If category/alphabet is empty string, set to null
    category = category || null;
    alphabet = alphabet || null;

    const babyName = new BabyName({
      name,
      gender,
      category,
      alphabet,
      meaning,
      description,
      createdBy: req.user.id
    });
    await babyName.save();
    res.status(201).json(babyName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get All Names (with filters + search)
export const getBabyNames = async (req, res) => {
  try {
    const { search, gender, category, alphabet, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    if (alphabet) filter.alphabet = alphabet;

    const skip = (page - 1) * limit;

    const [names, total] = await Promise.all([
      BabyName.find(filter)
        .populate("category", "name")
        .populate("alphabet", "name")
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(Number(limit)),
      BabyName.countDocuments(filter),
    ]);

    res.json({ names, total });
  } catch (err) {
    res.status(500).json({ message: "Error fetching names", error: err.message });
  }
};

// ✏️ Update Name
export const updateBabyName = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const babyName = await BabyName.findByIdAndUpdate(id, updates, { new: true });

    if (!babyName) return res.status(404).json({ error: "Name not found" });

    res.json(babyName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Name (Super Admin only)
export const deleteBabyName = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can delete names" });
    }
    await BabyName.findByIdAndDelete(id);
    res.json({ message: "Name deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkImportNames = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() })) // normalize headers
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        try {
          const seenInFile = new Set();
          const newNames = [];
          let skippedDuplicateInFile = 0;
          let skippedExistingInDB = 0;

          for (const r of results) {
            if (!r.name) continue;

            const name = r.name.trim();
            const key = name.toLowerCase();

            // 🔹 Skip duplicates inside the same CSV
            if (seenInFile.has(key)) {
              skippedDuplicateInFile++;
              continue;
            }
            seenInFile.add(key);

            // 🔹 Gender normalization for CSV input
            let gender = "";
            if (r.gender) {
              const g = r.gender.trim().toLowerCase();
              if (["boy", "ছেলে"].includes(g)) {
                gender = "boy";
              } else if (["girl", "মেয়ে", "মেয়"].includes(g)) {
                gender = "girl";
              }
            }

            // 🔹 Skip if already exists in DB
            const exists = await BabyName.findOne({ name: new RegExp(`^${name}$`, "i") });
            if (exists) {
              skippedExistingInDB++;
              continue;
            }

            // 🔹 Resolve category & alphabet
            const categoryDoc = r.category
              ? await Category.findOne({ name: new RegExp(`^${r.category}$`, "i") })
              : null;

            const alphabetDoc = r.alphabet
              ? await Alphabet.findOne({ name: new RegExp(`^${r.alphabet}$`, "i") })
              : null;

            newNames.push({
              name,
              gender : gender ? gender : null, // normalized
              category: categoryDoc ? categoryDoc._id : null,
              alphabet: alphabetDoc ? alphabetDoc._id : null,
              meaning: r.meaning?.trim() || "",
              description: r.description?.trim() || "",
            });
          }

          if (newNames.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `No new names imported. Skipped ${skippedDuplicateInFile} duplicate(s) in file and ${skippedExistingInDB} existing in DB.`,
            });
          }

          await BabyName.insertMany(newNames);

          fs.unlinkSync(filePath);

          res.status(201).json({
            message: `✅ Imported ${newNames.length} baby names. Skipped ${skippedDuplicateInFile} duplicate(s) in file and ${skippedExistingInDB} existing in DB.`,
          });
        } catch (error) {
          // console.error("❌ Error while importing CSV:", error);
          res.status(500).json({ message: "Error importing names", error: error.message });
        }
      });
  } catch (error) {
    // console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportNames = async (req, res) => {
  try {
    const names = await BabyName.find({})
      .populate("category", "name")
      .populate("alphabet", "name");

    // Map DB -> Bengali gender
    const formatted = names.map((n) => ({
      name: n.name,
      gender: n.gender === "boy" ? "ছেলে" : n.gender === "girl" ? "মেয়ে" : "",
      category: n.category?.name || "",
      alphabet: n.alphabet?.name || "",
      meaning: n.meaning || "",
      description: n.description || "",
    }));

    const fields = ["name", "gender", "category", "alphabet", "meaning", "description"];
    const parser = new Parser({ fields });
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("baby-names.csv");
    return res.send(csv);
  } catch (error) {
    // console.error("❌ Error exporting CSV:", error);
    res.status(500).json({ message: "Error exporting CSV", error: error.message });
  }
};