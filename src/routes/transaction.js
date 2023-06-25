const express = require("express");
const userAuth = require("../middlewares/auth/UserAuth");
const sellerAuth = require("../middlewares/auth/SellerAuth");
const checkProductOwnership = require("../middlewares/checkProductOwnership");
const transactionCtrl = require("../controllers/user/TransactionController");
const {createTransactionValidator} = require("../models/validators");

const app = express.Router();

app.get("/transactions/user/:id", userAuth, transactionCtrl.getAllTransaction);
app.post(
  "/transactions",
  createTransactionValidator,
  checkProductOwnership,
  userAuth,
  transactionCtrl.createTransaction,
);
app.put(
  "/transactions/:transactionId/user/:id",
  userAuth,
  transactionCtrl.confirmProductReceived,
);
app.put(
  "/transactions/:transactionId/user/:id/cancelled",
  userAuth,
  transactionCtrl.buyerCancelledTransaction,
);

app.put(
  "/transactions/:transactionId/shop/:id",
  sellerAuth,
  transactionCtrl.setProductShipped,
);
app.put(
  "/transactions/:transactionId/shop/:id/cancelled",
  sellerAuth,
  transactionCtrl.sellerCancelledTransaction,
);

module.exports = app;
