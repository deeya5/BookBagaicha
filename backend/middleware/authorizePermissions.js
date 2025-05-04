module.exports = function authorizePermissions(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Super admin bypasses checks
    if (user.role === "super_admin") {
      // console.log("Super admin access granted");
      return next();
    }

    const userPermissions = user.permissions || [];

    console.log("User permissions:", userPermissions);
    console.log("Required permissions:", requiredPermissions);

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      console.log("Permission denied");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("Permission granted");
    next();
  };
};
