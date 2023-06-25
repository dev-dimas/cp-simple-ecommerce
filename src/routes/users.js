const express = require("express");

const {
  userRegistValidator,
  userEditValidator,
  userChangePasswordValidator,
  shopValidator,
  userSetAddressValidator,
} = require("../models/validators");
const userCtrl = require("../controllers/user/UserController");
const userAuth = require("../middlewares/auth/UserAuth");

const app = express.Router();

app.post("/users", userRegistValidator, userCtrl.createUser);
app.get("/users/:id", userAuth, userCtrl.getUser);
app.put("/users/:id", userAuth, userEditValidator, userCtrl.editUser);
app.delete("/users/:id", userAuth, userCtrl.deleteUser);
app.put(
  "/users/:id/change-password",
  userAuth,
  userChangePasswordValidator,
  userCtrl.changePassword,
);
app.put("/users/:id/avatar", userAuth, userCtrl.setAvatar);
app.put(
  "/users/:id/address",
  userSetAddressValidator,
  userAuth,
  userCtrl.setAddress,
);
app.delete("/users/:id/avatar", userAuth, userCtrl.deleteAvatar);
app.post(
  "/users/:id/create-shop",
  userAuth,
  shopValidator,
  userCtrl.createShop,
);

module.exports = app;
