const express = require("express");
const userAuth = require("../middlewares/auth/UserAuth");
const cartCtrl = require("../controllers/user/CartController");
const {cartValidator, checkoutCartValidator} = require("../models/validators");
const checkProductOwnership = require("../middlewares/checkProductOwnership");

const app = express.Router();

app.get("/carts/:id", userAuth, cartCtrl.getAllFromCart);
app.post(
  "/carts/:id/product/:productId",
  userAuth,
  checkProductOwnership,
  cartCtrl.addProductToCart,
);
app.put(
  "/carts/:id/product/:productId",
  cartValidator,
  userAuth,
  cartCtrl.editProductQuantity,
);
app.delete(
  "/carts/:id/product/:productId",
  userAuth,
  cartCtrl.deleteProductFromCart,
);
app.post(
  "/carts/:id/checkout/product/:productId",
  checkoutCartValidator,
  userAuth,
  cartCtrl.checkoutFromCart,
);
module.exports = app;
