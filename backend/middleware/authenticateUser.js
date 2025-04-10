const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check if token is provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract token
  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "bookbagaicha5");
    req.user = { id: decoded.id };  // Attach user information to request

    // Log for debugging (optional)
    // console.log("Token valid for user ID:", decoded.id);

    next(); // Pass control to the next middleware/route handler
  } catch (err) {
    // Handle token errors (expired or invalid)
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateUser;
