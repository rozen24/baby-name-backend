import BabyName from "../models/BabyName.js";
import Category from "../models/Category.js";
import Origin from "../models/Origin.js";
import fs from "fs";
import csv from "csv-parser";

// ➕ Add Name
export const addBabyName = async (req, res) => {

  

  try {
    let { name, gender, category, origin, meaning } = req.body;

    // If category/origin is empty string, set to null
    category = category || null;
    origin = origin || null;

    const babyName = new BabyName({
      name,
      gender,
      category,
      origin,
      meaning,
      createdBy: req.user.id
    });
    await babyName.save();
    res.status(201).json(babyName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get All Names (with filters + search)
// export const getBabyNames = async (req, res) => {
//   try {
//     const { gender, category, origin, search } = req.query;

//     let filter = {};
//     if (gender) filter.gender = gender;
//     if (category) filter.category = category;
//     if (origin) filter.origin = origin;
//     if (search) filter.name = { $regex: search, $options: "i" };

//     // const names = await BabyName.find(filter)
//     //   .populate("category")
//     //   .populate("origin")
//     //   .populate("createdBy", "username email role")
//     //   .sort({ createdAt: -1 });
//     const names = await BabyName.find(filter)
//     .populate("category", "name")   // only fetch category name
//     .populate("origin", "name")     // only fetch origin name
//     .populate("createdBy", "username email role")
//     .sort({ createdAt: -1 });


//     res.json(names);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// GET /api/names
export const getBabyNames = async (req, res) => {
  try {
    const { search, gender, category, origin, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    if (origin) filter.origin = origin;

    const skip = (page - 1) * limit;

    const [names, total] = await Promise.all([
      BabyName.find(filter)
        .populate("category", "name")
        .populate("origin", "name")
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

// Bulk import names from CSV (accepts category/origin names)
// export const bulkImportNames = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const filePath = req.file.path;
//     const results = [];

//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on("data", (row) => {
//         results.push(row);
//       })
//       .on("end", async () => {
//         try {
//           const newNames = [];

//           for (const r of results) {
//             // 🔹 Find Category by name (case-insensitive)
//             const categoryDoc = await Category.findOne({
//               name: { $regex: new RegExp(`^${r.category}$`, "i") },
//             });

//             // 🔹 Find Origin by name (case-insensitive)
//             const originDoc = await Origin.findOne({
//               name: { $regex: new RegExp(`^${r.origin}$`, "i") },
//             });

//             newNames.push({
//               name: r.name?.trim(),
//               gender: r.gender?.trim(),
//               category: categoryDoc ? categoryDoc._id : null,
//               origin: originDoc ? originDoc._id : null,
//               meaning: r.meaning?.trim(),
//             });
//           }

//           await Name.insertMany(newNames);

//           // Delete temp file
//           fs.unlinkSync(filePath);

//           res.status(201).json({
//             message: `✅ Imported ${newNames.length} baby names successfully`,
//           });
//         } catch (error) {
//           console.error("❌ Error while importing CSV:", error);
//           res.status(500).json({ message: "Error importing names", error });
//         }
//       });
//   } catch (error) {
//     console.error("❌ Server error:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

export const bulkImportNames = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() })) // normalize headers
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        try {
          const newNames = [];

          for (const r of results) {
            if (!r.name) continue; // skip empty rows

            const categoryDoc = r.category
              ? await Category.findOne({
                  name: { $regex: new RegExp(`^${r.category}$`, "i") },
                })
              : null;

            const originDoc = r.origin
              ? await Origin.findOne({
                  name: { $regex: new RegExp(`^${r.origin}$`, "i") },
                })
              : null;

            newNames.push({
              name: r.name?.trim(),
              gender: r.gender?.trim() || "",
              category: categoryDoc ? categoryDoc._id : null,
              origin: originDoc ? originDoc._id : null,
              meaning: r.meaning?.trim() || "",
            });
          }

          if (newNames.length === 0) {
            return res.status(400).json({ message: "No valid names found in CSV" });
          }

          await BabyName.insertMany(newNames);

          fs.unlinkSync(filePath);

          res.status(201).json({
            message: `✅ Imported ${newNames.length} baby names successfully`,
          });
        } catch (error) {
          console.error("❌ Error while importing CSV:", error);
          res.status(500).json({ message: "Error importing names", error: error.message });
        }
      });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
