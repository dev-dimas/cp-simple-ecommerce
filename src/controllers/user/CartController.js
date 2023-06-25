const {validationResult} = require("express-validator");
const cartDomain = require("../../domain/cart.domain");

const getAllFromCart = async (req, res, next) => {
  try {
    const {id} = req.params;
    const carts = await cartDomain.getAllFromCart(id);
    res.send({carts, error: false});
  } catch (error) {
    next(error);
  }
};

const addProductToCart = async (req, res, next) => {
  try {
    const {id, productId} = req.params;
    const addedProduct = await cartDomain.addProductToCart(id, productId);
    res.send({inserted_cart: addedProduct, error: false});
  } catch (error) {
    next(error);
  }
};

const editProductQuantity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {id, productId} = req.params;
    const {quantity} = req.body;
    const updateProductQuantity = await cartDomain.editProductQuantity(
      id,
      productId,
      quantity,
    );
    res.send({updated_product: updateProductQuantity, error: false});
  } catch (error) {
    next(error);
  }
};

const deleteProductFromCart = async (req, res, next) => {
  try {
    const {id, productId} = req.params;
    await cartDomain.deleteProductFromCart(id, productId);
    res.send({message: "OK!.", status: 200, error: false});
  } catch (error) {
    next(error);
  }
};

const checkoutFromCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {payAmount} = req.body;
    const {id, productId} = req.params;
    const response = await cartDomain.checkoutFromCart(
      id,
      productId,
      payAmount,
    );
    res.send({transaction: response, error: false});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFromCart,
  addProductToCart,
  editProductQuantity,
  deleteProductFromCart,
  checkoutFromCart,
};
