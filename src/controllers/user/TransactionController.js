const transactionDomain = require("../../domain/transaction.domain");
const {validationResult} = require("express-validator");

const getAllTransaction = async (req, res, next) => {
  try {
    const {id} = req.params;
    const transactions = await transactionDomain.getAllTransaction(id);
    res.send({transactions, error: false});
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {id, productId, quantity, payAmount} = req.body;
    const new_transaction = await transactionDomain.createTransaction(
      id,
      productId,
      quantity,
      payAmount,
    );
    res.send({new_transaction, error: false});
  } catch (error) {
    next(error);
  }
};

const confirmProductReceived = async (req, res, next) => {
  try {
    const {transactionId, id} = req.params;
    await transactionDomain.confirmProductReceived(transactionId, id);
    res.send({
      message: `Transaction with id ${transactionId} marked as done`,
      error: false,
    });
  } catch (error) {
    next(error);
  }
};

const buyerCancelledTransaction = async (req, res, next) => {
  try {
    const {transactionId, id} = req.params;
    await transactionDomain.buyerCancelledTransaction(transactionId, id);
    res.send({
      message: `Transaction with id ${transactionId} has been set as 'cancelled'`,
      error: false,
    });
  } catch (error) {
    next(error);
  }
};

const setProductShipped = async (req, res, next) => {
  try {
    const {transactionId, id} = req.params;
    await transactionDomain.setProductShipped(transactionId, id);
    res.send({
      message: `Transaction with id ${transactionId} has been set as 'shipping'`,
      error: false,
    });
  } catch (error) {
    next(error);
  }
};

const sellerCancelledTransaction = async (req, res, next) => {
  try {
    const {transactionId, id} = req.params;
    await transactionDomain.sellerCancelledTransaction(transactionId, id);
    res.send({
      message: `Transaction with id ${transactionId} has been set as 'cancelled'`,
      error: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransaction,
  createTransaction,
  confirmProductReceived,
  buyerCancelledTransaction,
  setProductShipped,
  sellerCancelledTransaction,
};
