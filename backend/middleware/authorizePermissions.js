module.exports = function authorizePermissions(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Super admin can bypass all checks
    if (user.role === "super_admin") {
      return next();
    }

    const userPermissions = user.permissions || [];

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
