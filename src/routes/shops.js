const express = require("express");

const productCtrl = require("../controllers/shop/ProductController");
const shopCtrl = require("../controllers/shop/ShopController");
const sellerAuth = require("../middlewares/auth/SellerAuth");
const {shopValidator, productValidator} = require("../models/validators");

const app = express.Router();

app.get("/shops/:id/products", productCtrl.getAllProduct);
app.get("/shops/:id/products/:productId", productCtrl.getOneProduct);
app.post(
  "/shops/:id/products",
  sellerAuth,
  productValidator,
  productCtrl.createProduct,
);
app.put(
  "/shops/:id/products/:productId",
  sellerAuth,
  productValidator,
  productCtrl.editProduct,
);
app.delete(
  "/shops/:id/products/:productId",
  sellerAuth,
  productCtrl.deleteProduct,
);
app.put("/shops/:id", sellerAuth, shopValidator, shopCtrl.editProfileShop);
app.put("/shops/:id/avatar", sellerAuth, shopCtrl.editAvatarShop);
app.delete("/shops/:id/avatar", sellerAuth, shopCtrl.deleteAvatarShop);
app.delete("/shops/:id", sellerAuth, shopCtrl.deleteShop);

module.exports = app;
