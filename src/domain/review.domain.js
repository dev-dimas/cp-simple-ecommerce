const {default: mongoose} = require("mongoose");
const Shop = require("../models/shopModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

const postReview = async (rating, comment, transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const transaction = await Transaction.findOne({_id: transactionId});
    const user = await User.findOne({
      username: id,
    });
    const userTransaction = user.transactions.find(
      (transaction) => transaction.toString() === transactionId,
    );
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: transaction.productId}},
    });
    if (!transaction || !user || !userTransaction || !shop) throw {status: 404};
    if (transaction.status !== "completed")
      throw {
        status: 400,
        message: "Cant give review when transaction is not 'completed'",
      };
    const isReviewExist = shop.products[0].reviews.find(
      (review) => review.transactionId.toString() === transactionId,
    );
    if (isReviewExist)
      throw {
        status: 400,
        message: "You already give this transaction a review!",
      };
    const review = {
      transactionId,
      userId: user._id,
      rating,
      comment,
    };
    shop.products[0].reviews.push(review);
    await shop.save();
    return review;
  } catch (error) {
    throw error;
  }
};

const editReview = async (rating, comment, transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const transaction = await Transaction.findOne({_id: transactionId});
    const user = await User.findOne({
      username: id,
    });
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: transaction.productId}},
    });
    const indexReview = shop.products[0].reviews.findIndex(
      (review) => review.transactionId.toString() === transactionId,
    );
    if (!transaction || !user || !shop || indexReview === -1)
      throw {status: 404};
    if (transaction.status !== "completed")
      throw {
        status: 400,
        message: "Cant give review when transaction is not 'completed'",
      };
    const review = {
      transactionId,
      userId: user._id,
      rating,
      comment,
    };
    shop.products[0].reviews[indexReview] = review;
    await shop.save();
    return review;
  } catch (error) {
    throw error;
  }
};

const deleteReview = async (transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const transaction = await Transaction.findOne({_id: transactionId});
    const user = await User.findOne({username: id});
    if (!transaction || !user) throw {status: 404};
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: transaction.productId}},
    });
    if (transaction.userId.toString() !== user._id.toString())
      throw {status: 404};
    shop.products[0].reviews = shop.products[0].reviews.filter(
      (review) => review.transactionId.toString() !== transactionId,
    );
    await shop.save();
    return;
  } catch (error) {
    throw error;
  }
};

module.exports = {postReview, editReview, deleteReview};
