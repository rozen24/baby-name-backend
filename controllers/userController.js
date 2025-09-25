import User from "../models/User.js";
import BabyName from "../models/BabyName.js";
import bcrypt from "bcryptjs";

// @desc   Login user
// @route  POST /api/users/login
// @access Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📖 Get all users (with count of names added by each user)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const count = await BabyName.countDocuments({ createdBy: user._id });
        return { ...user.toObject(), nameCount: count };
      })
    );

    res.json(usersWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👤 Create new user (Super Admin only)
export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can create users" });
    }

    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update user role (Super Admin only)
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can update user roles" });
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select(
      "-password"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete user (Super Admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can delete users" });
    }

    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
