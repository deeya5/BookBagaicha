const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    //console.log("AUTH HEADER:", authHeader); 
  
    if (token == null) {
      return res.status(401).json({ message: "Authentication token required" });
    }
  
    jwt.verify(token, "bookbagaicha5", (err, user) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Token expired. Please Signin again" });
      }
      req.user = user;
      next();
    });
  };
  

module.exports = { authenticateToken};