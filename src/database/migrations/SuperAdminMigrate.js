const SuperAdmin = require("../../models/superAdminModel");
const {getHashBcrypt} = require("../../utils/security/bcryptUtils");

const migrateSuperAdmin = async () => {
  const superAdminData = {
    username: "Admin",
    password: await getHashBcrypt("adminishere"),
    name: "Super Admin",
    email: "admin@admin.com",
  };

  try {
    const existingSuperAdmin = await SuperAdmin.findOne({});
    if (existingSuperAdmin === null) {
      const superAdmin = new SuperAdmin(superAdminData);
      await superAdmin.save();
      console.log("Super Admin has migrated");
    }
  } catch (error) {
    console.log("Failed to perform super admin migration.");
  }
};

module.exports = migrateSuperAdmin;
