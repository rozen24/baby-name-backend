// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//   let token = req.headers.authorization;

//   if (token && token.startsWith("Bearer ")) {
//     token = token.split(" ")[1]; // Remove "Bearer"
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.admin = decoded; // attach admin info
//       next();
//     } catch (err) {
//       return res.status(401).json({ error: "Invalid or expired token" });
//     }
//   } else {
//     return res.status(401).json({ error: "No token provided" });
//   }
// };
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
};

export const superadminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

