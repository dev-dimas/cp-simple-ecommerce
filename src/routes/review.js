const express = require("express");
const userAuth = require("../middlewares/auth/UserAuth");
const reviewCtrl = require("../controllers/user/ReviewController");
const {reviewValidator} = require("../models/validators");

const app = express.Router();

app.post(
  "/review/:transactionId/user/:id",
  reviewValidator,
  userAuth,
  reviewCtrl.postReview,
);

app.put(
  "/review/:transactionId/user/:id",
  reviewValidator,
  userAuth,
  reviewCtrl.editReview,
);

app.delete(
  "/review/:transactionId/user/:id",
  userAuth,
  reviewCtrl.deleteReview,
);

module.exports = app;
