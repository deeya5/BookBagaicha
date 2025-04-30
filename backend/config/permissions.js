const rolesPermissions = {
    superadmin: {
      users: ['create', 'read', 'update', 'delete'],
      books: ['create', 'read', 'update', 'delete'],
      genres: ['create', 'read', 'update', 'delete'],
      authors: ['create', 'read', 'update', 'delete'],
      admins: ['create', 'read', 'update', 'delete'],
    },
    admin_users: {
      users: ['create', 'read', 'update', 'delete'],
      authors: ['create', 'read', 'update', 'delete'],
    },
    admin_books: {
      books: ['create', 'read', 'update', 'delete'],
      genres: ['create', 'read', 'update', 'delete'],
    },
    user: {
      books: ['read'],
    },
  };
  
  module.exports = rolesPermissions;
  