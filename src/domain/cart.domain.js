const {default: mongoose} = require("mongoose");
const Cart = require("../models/cartModel");
const Shop = require("../models/shopModel");
const User = require("../models/userModel");
const {createTransaction} = require("./transaction.domain");

const getAllFromCart = async (id) => {
  try {
    const cart = await Cart.findOne({user: id});
    if (cart === null) {
      return [];
    }
    const {products, totalPrice} = cart;
    return {products, totalPrice};
  } catch (error) {
    throw error;
  }
};

const addProductToCart = async (id, productId) => {
  try {
    const cart = await Cart.findOne({user: id});
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: productId}},
    });
    if (!cart) {
      const _id = new mongoose.Types.ObjectId();
      const addToCart = await Cart.create({
        _id,
        user: id,
        products: [{productId, price: shop.products[0].price, quantity: 1}],
      });
      await User.findOneAndUpdate({username: id}, {cartId: _id});
      return addToCart;
    }
    const indexCart = cart.products.findIndex(
      (product) => product.productId.toString() === productId,
    );
    if (shop.products[0].quantity === 0)
      throw {status: 400, message: "The requested product is out of stock."};
    if (cart.products[indexCart]?.quantity >= shop.products[0].quantity)
      throw {
        status: 400,
        message: "The requested quantity exceeds the available stock.",
      };
    if (indexCart !== -1) {
      const updatedCart = {
        ...cart.products[indexCart].toObject(),
        quantity: cart.products[indexCart].quantity + 1,
      };
      cart.products[indexCart] = updatedCart;
    } else {
      cart.products.push({
        productId,
        price: shop.products[0].price,
        quantity: 1,
      });
    }
    await cart.save();
    return cart;
  } catch (error) {
    throw error;
  }
};

const editProductQuantity = async (id, productId, quantity) => {
  try {
    const cart = await Cart.findOne({user: id});
    const indexCart = cart.products.findIndex(
      (product) => product.productId.toString() === productId,
    );
    const shop = await Shop.findOne({
      products: {$elemMatch: {_id: productId}},
    });
    if (!cart || indexCart === -1) {
      throw {status: 404};
    }
    if (parseInt(quantity) === 0) {
      await deleteProductFromCart(id, productId);
      return {status: 200, message: "Product removed from cart."};
    }
    if (quantity > shop.products[0].quantity)
      throw {
        status: 400,
        message: "The requested quantity exceeds the available stock.",
      };

    const updatedCart = {
      ...cart.products[indexCart].toObject(),
      quantity,
    };
    cart.products[indexCart] = updatedCart;
    await cart.save();
    return cart;
  } catch (error) {
    throw error;
  }
};

const deleteProductFromCart = async (id, productId) => {
  try {
    const cart = await Cart.findOne({user: id});
    const indexCart = cart.products.findIndex(
      (product) => product.productId.toString() === productId,
    );
    if (!cart || indexCart === -1) throw {status: 404};
    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId,
    );
    await cart.save();
  } catch (error) {
    throw error;
  }
};

const checkoutFromCart = async (id, productId, payAmount) => {
  try {
    const cart = await Cart.findOne({user: id});
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId,
    );
    if (!cart || productIndex === -1) throw {status: 404};
    const {quantity} = cart.products[productIndex];
    const response = await createTransaction(
      id,
      productId,
      quantity,
      payAmount,
    );
    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId,
    );
    await cart.save();
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllFromCart,
  addProductToCart,
  editProductQuantity,
  deleteProductFromCart,
  checkoutFromCart,
};
