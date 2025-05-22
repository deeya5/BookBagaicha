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

module.exports = { assignPermissions };
