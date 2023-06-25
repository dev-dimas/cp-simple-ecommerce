const {validationResult} = require("express-validator");
const productDomain = require("../../domain/product.domain");

const getAllProduct = async (req, res, next) => {
  try {
    const {id} = req.params;
    const products = await productDomain.getAllProduct(id);
    res.send({products, error: false});
  } catch (error) {
    next(error);
  }
};

const getOneProduct = async (req, res, next) => {
  try {
    const {id, productId} = req.params;
    const product = await productDomain.getOneProduct(id, productId);
    res.send({product, error: false});
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {id} = req.params;
    const {productName, description, price, quantity} = req.body;
    const {files} = req;
    if (!files) throw {status: 400};
    const newProduct = await productDomain.createProduct(id, {
      productName,
      description,
      price,
      quantity,
      files,
    });
    res.send({newProduct, error: false});
  } catch (error) {
    next(error);
  }
};

const editProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {id, productId} = req.params;
    const {productName, description, price, quantity} = req.body;
    const {files} = req;
    const updatedProductData = {productName, description, price, quantity};
    if (files.length > 0) {
      updatedProductData.files = req.files;
    }
    const updatedProduct = await productDomain.editProduct(
      id,
      productId,
      updatedProductData,
    );
    res.send({updatedProduct, error: false});
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const {id, productId} = req.params;
    const product = await productDomain.deleteProduct(id, productId);
    res.send(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProduct,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
};
