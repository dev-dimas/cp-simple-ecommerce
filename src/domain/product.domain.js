const {default: mongoose} = require("mongoose");
const Shop = require("../models/shopModel");
const path = require("path");
const fs = require("fs").promises;

const getAllProduct = async (id) => {
  try {
    const shop = await Shop.findOne({username: id}, {products: 1, _id: false});
    if (!shop) throw {status: 404};
    const {products} = shop;
    return products;
  } catch (error) {
    throw error;
  }
};

const getOneProduct = async (id, productId) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    const product = shop.products.find(
      (product) => product._id.toString() === productId,
    );
    if (!product) throw {status: 404};
    return product;
  } catch (error) {
    throw error;
  }
};

const createProduct = async (id, data) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    if (data.files > 5)
      throw {
        status: 400,
        message: "Image product should not more than 5 images",
      };
    const productId = new mongoose.Types.ObjectId();
    let images = [];
    const publicImagePath = path.resolve(`public/products/${productId}`);
    await fs.mkdir(publicImagePath, {recursive: true});
    for (const [index, file] of data.files.entries()) {
      const {originalname: originalName, path: oldPath} = file;
      await fs.rename(
        oldPath,
        path.join(publicImagePath, `/${index}.${originalName.split(".")[1]}`),
      );
      images.push(
        `/products/${productId}/${index}.${originalName.split(".")[1]}`,
      );
    }
    delete data.files;
    const newProduct = {
      _id: productId,
      ...data,
      images,
    };
    shop.products.push(newProduct);
    await shop.save();
    return newProduct;
  } catch (error) {
    throw error;
  }
};

const editProduct = async (id, productId, data) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    const product = shop.products.find(
      (product) => product._id.toString() === productId,
    );
    if (!product) throw {status: 404};
    let updatedProduct = {};
    let images = [];
    if (data.files !== undefined) {
      if (data.files.length > 5)
        throw {
          status: 400,
          message: "Image product should not more than 5 images",
        };
      const publicImagePath = path.resolve(`public/products/${productId}`);
      for (const [index, file] of data.files.entries()) {
        const {originalname: originalName, path: oldPath} = file;
        await fs.rename(
          oldPath,
          path.join(publicImagePath, `/${index}.${originalName.split(".")[1]}`),
        );
        images.push(
          `/products/${productId}/${index}.${originalName.split(".")[1]}`,
        );
      }
      delete data.files;
      data.images = images;
    }
    const productIndex = shop.products.findIndex(
      (product) => product._id.toString() === productId,
    );
    updatedProduct = {
      ...shop.products[productIndex].toObject(),
      ...data,
      _id: shop.products[productIndex]._id,
    };
    shop.products[productIndex] = updatedProduct;
    await shop.save();
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id, productId) => {
  const shop = await Shop.findOne({username: id});
  if (!shop) throw {status: 404};
  const product = shop.products.find(
    (product) => product._id.toString() === productId,
  );
  if (!product) throw {status: 404};
  if (product.images.length > 0) {
    await deleteFolderRecursive(path.resolve(`public/products/${productId}`));
  }
  await Shop.findOneAndUpdate(
    {username: id},
    {$pull: {products: {_id: productId}}},
  );
  return {message: "OK!", error: false};
};

const deleteFolderRecursive = async (folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
      const currentPath = path.join(folderPath, file);
      const stat = await fs.lstat(currentPath);
      if (stat.isDirectory()) {
        await deleteFolderRecursive(currentPath);
      } else {
        await fs.unlink(currentPath);
      }
    }
    await fs.rmdir(folderPath);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllProduct,
  getOneProduct,
  createProduct,
  editProduct,
  deleteProduct,
};
