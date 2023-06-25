const migrateSuperAdmin = require("./SuperAdminMigrate");

const migrateDB = () => {
  migrateSuperAdmin();
};

module.exports = migrateDB;
