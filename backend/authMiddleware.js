// authMiddleware.js
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, "jat123"); // keep secret in env
    req.userId = decoded.userId;
    next();

  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
