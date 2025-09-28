import express from "express";
import { addBabyName, getBabyNames, updateBabyName, deleteBabyName , bulkImportNames, exportNames} from "../controllers/babyNameController.js";
import { protect, superadminOnly } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// ✅ CRUD Routes
router.post("/", protect, addBabyName);
router.get("/", getBabyNames);
router.get("/export", exportNames);
router.put("/:id", protect, updateBabyName);
router.delete("/:id", protect, superadminOnly, deleteBabyName);

// ✅ New bulk CSV import route
router.post(
  "/bulk",
  protect,
  upload.single("file"),
  bulkImportNames
);


export default router;
