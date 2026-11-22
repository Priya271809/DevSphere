const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // 1. Check token in cookies or Authorization header (Bearer token)
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required. Please log in." });
    }

    // 2. Verify JWT token
    const secret = process.env.JWT_SECRET || "devtinder_super_secret_jwt_key_2026_secure";
    const decodedObj = jwt.verify(token, secret);

    const { _id } = decodedObj;
    if (!_id) {
      return res.status(401).json({ error: "Invalid token payload." });
    }

    // 3. Find user in database
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ error: "User session expired or user no longer exists." });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
    }
    return res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};

module.exports = {
  userAuth,
};
