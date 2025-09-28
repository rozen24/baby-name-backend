import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// ✅ Correct paths (no duplicate /routes)
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import nameRoutes from "./routes/nameRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import babyNameRoutes from "./routes/babyNameRoutes.js";
import originRoutes from "./routes/originRoutes.js";


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // Vite frontend
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/admins", adminRoutes);
// app.use("/api/names", nameRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/names", babyNameRoutes);
app.use("/api/origins", originRoutes);

app.get("/health", async (req, res) => {
  res.send({ message: "health OK!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
