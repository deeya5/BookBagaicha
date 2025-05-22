const jwt = require('jsonwebtoken');

function assignPermissions(role) {
  switch (role) {
    case "super_admin":
      return ["dashboard", "user", "author", "book", "genre", "review", "original"];
    case "admin_user":
      return ["dashboard", "user", "author"];
    case "admin_book":
      return ["dashboard", "book", "genre", "review", "original"];
    default:
      return [];
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.user.permissions = assignPermissions(user.role); //Assign permissions here

    next();
  });
}

module.exports = authenticateToken;
