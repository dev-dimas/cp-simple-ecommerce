const Shop = require("../models/shopModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const {default: mongoose} = require("mongoose");

const getAllTransaction = async (id) => {
  try {
    let transactions = [];
    const user = await User.findOne({username: id});
    if (!user) throw {status: 404};
    for (const userTransaction of user.transactions) {
      const transaction = await Transaction.findOne({_id: userTransaction});
      if (transaction) transactions.push(transaction);
    }
    return transactions;
  } catch (error) {
    throw error;
  }
};

const createTransaction = async (id, productId, quantity, payAmount) => {
  try {
    if (!mongoose.isValidObjectId(productId)) throw {status: 404};
    const user = await User.findOne({username: id});
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: productId}},
    });
    if (!user || !shop) throw {status: 404};
    if (payAmount * quantity !== shop.products[0].price * quantity)
      throw {status: 402, message: "Payment amount is incorrect!"};
    if (shop.products[0].quantity === 0)
      throw {status: 409, message: "Product is not ready stock!"};
    if (quantity > shop.products[0].quantity)
      throw {
        status: 409,
        message: "The requested quantity exceeds the available stock!",
      };
    if (!user.address.street)
      throw {status: 400, message: "You dont have a valid shipping address!."};
    const transactionId = new mongoose.Types.ObjectId();
    const newTransaction = await Transaction.create({
      _id: transactionId,
      userId: user._id,
      address: user.address,
      productId,
      quantity,
      price: shop.products[0].price,
      totalPrice: quantity * shop.products[0].price,
      status: "pending",
    });
    user.transactions.push(transactionId);
    shop.products[0].quantity -= quantity;
    await user.save();
    await shop.save();
    return newTransaction;
  } catch (error) {
    throw error;
  }
};

const confirmProductReceived = async (transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const transaction = await Transaction.findOne({_id: transactionId});
    const user = await User.findOne({username: id});
    const isTransactionExist = user.transactions.find(
      (transaction) => transaction.toString() === transactionId,
    );
    if (!isTransactionExist) throw {status: 404};
    if (transaction.status === "completed")
      throw {
        status: 400,
        message: `Cant set transaction status to be 'completed' when the transaction status is already 'completed'`,
      };
    if (transaction.status !== "shipping")
      throw {
        status: 400,
        message:
          "Cant set transaction as 'completed' when product is not shipped by seller!",
      };
    transaction.status = "completed";
    await transaction.save();
    return;
  } catch (error) {
    throw error;
  }
};

const buyerCancelledTransaction = async (transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const user = await User.findOne({username: id});
    const transaction = await Transaction.findOne({_id: transactionId});
    if (transaction.status === "shipping")
      throw {
        status: 400,
        message: "You cant cancelled transaction when it's on shipping status",
      };
    if (!user || !transaction) throw {status: 404};
    const isAuthorized = user.transactions.find(
      (userTransaction) =>
        userTransaction._id.toString() === transaction._id.toString(),
    );
    if (!isAuthorized) throw {status: 401};
    await setTransactionCancelled(transactionId);
    return;
  } catch (error) {
    throw error;
  }
};

const setProductShipped = async (transactionId, id) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const shop = await Shop.findOne({username: id});
    const transaction = await Transaction.findOne({_id: transactionId});
    if (!shop || !transaction) throw {status: 404};
    const isAuthorized = shop.products.find(
      (product) => product._id.toString() === transaction.productId.toString(),
    );
    if (!isAuthorized) throw {status: 401};
    if (transaction.status === "completed")
      throw {
        status: 400,
        message:
          "This transaction is done/completed. You cant set to 'shipping'",
      };
    if (transaction.status === "shipping")
      throw {status: 400, message: "This transaction is already on 'shipping'"};
    transaction.status = "shipping";
    await transaction.save();
    return;
  } catch (error) {
    throw error;
  }
};

const sellerCancelledTransaction = async (transactionId, id) => {
  if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
  const shop = await Shop.findOne({username: id});
  const transaction = await Transaction.findOne({_id: transactionId});
  if (!shop || !transaction) throw {status: 404};
  const isAuthorized = shop.products.find(
    (product) => product._id.toString() === transaction.productId.toString(),
  );
  if (!isAuthorized) throw {status: 401};
  await setTransactionCancelled(transactionId);
  return;
};

const setTransactionCancelled = async (transactionId) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) throw {status: 404};
    const transaction = await Transaction.findOne({_id: transactionId});
    if (!transaction) throw {status: 404};
    if (transaction.status === "completed")
      throw {
        status: 400,
        message: `Cant set transaction status to be 'cancelled' when the transaction status is already 'completed'`,
      };
    if (transaction.status === "cancelled")
      throw {
        status: 400,
        message: `Cant set transaction status to be 'cancelled' when the transaction status is already 'cancelled'`,
      };
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: transaction.productId}},
    });
    transaction.status = "cancelled";
    shop.products[0].quantity += transaction.quantity;
    await transaction.save();
    await shop.save();
    return;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllTransaction,
  createTransaction,
  confirmProductReceived,
  buyerCancelledTransaction,
  setProductShipped,
  sellerCancelledTransaction,
  setTransactionCancelled,
};
