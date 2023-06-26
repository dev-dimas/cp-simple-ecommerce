const Shop = require("../models/shopModel");
const fs = require("fs").promises;
const path = require("path");
const User = require("../models/userModel");
const {deleteProduct} = require("./product.domain");
const Transaction = require("../models/transactionModel");
const {setTransactionCancelled} = require("./transaction.domain");

const editProfileShop = async (id, data) => {
  try {
    const isExist = await Shop.findOne({username: id});
    if (!isExist) throw {status: 404};
    if (id !== data.username) {
      await renameAvatarFile(id, data.username);
      await User.findOneAndUpdate({shop: id}, {$set: {shop: data.username}});
    }
    const updatedData = await Shop.findOneAndUpdate(
      {username: id},
      {$set: {...data, shop_name: data.shopName}},
      {new: true},
    );
    delete updatedData._doc.shop_avatar;
    delete updatedData._doc.products;
    delete updatedData._doc.isVerified;
    return updatedData;
  } catch (error) {
    if (error.keyPattern?.username) {
      error.message = `Username @${error.keyValue.username} is already taken!.`;
      error.status = 409;
    }
    throw error;
  }
};

const editAvatarShop = async (id, files) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    if (!files) throw {status: 400};
    const publicImagePath = path.resolve("public/shops/avatar");
    const {originalname: originalName, path: oldPath} = files[0];
    await fs.rename(
      oldPath,
      path.join(publicImagePath, `/${id}.${originalName.split(".")[1]}`),
    );
    shop.shop_avatar =
      files.length >= 1 &&
      `/shops/avatar/${id}.${files[0].originalname.split(".")[1]}`;
    await shop.save();
    return {message: "Avatar shop updated!", error: false};
  } catch (error) {
    throw error;
  }
};

const deleteAvatarShop = async (id) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    const avatarDir = path.join("public", "shops", "avatar");
    const files = await fs.readdir(avatarDir);
    const avatarFile = files.find((file) => file.startsWith(`${id}.`));
    if (avatarFile) {
      const avatarPath = path.join(avatarDir, avatarFile);
      fs.unlink(avatarPath);
    }
    shop.shop_avatar = null;
    await shop.save();
    return {message: "Avatar deleted!", error: false};
  } catch (error) {
    throw error;
  }
};

const deleteShop = async (id) => {
  try {
    const shop = await Shop.findOne({username: id});
    if (!shop) throw {status: 404};
    if (shop.shop_avatar) {
      const avatarDir = path.join("public", "shops", "avatar");
      const files = await fs.readdir(avatarDir);
      const avatarFile = files.find((file) => file.startsWith(`${id}.`));
      if (avatarFile) {
        const avatarPath = path.join(avatarDir, avatarFile);
        fs.unlink(avatarPath);
      }
    }
    shop.products.forEach(async (product) => {
      const transactions = await Transaction.find({productId: product._id});
      transactions.forEach(async (transaction) => {
        if (
          transaction.status !== "completed" &&
          transaction.status !== "canceled"
        ) {
          await setTransactionCancelled(transaction._id);
        }
        await transaction.save();
      });
      await deleteProduct(id, product._id);
    });
    await Shop.findOneAndDelete({username: id});
    await User.updateOne({shop: id}, {$set: {shop: null}});
    return {message: "OK!.", error: false};
  } catch (error) {
    throw error;
  }
};

const renameAvatarFile = async (id, newId) => {
  try {
    const shopAvatarDir = path.join("public", "shops", "avatar");
    const files = await fs.readdir(shopAvatarDir);
    const avatarFile = files.find((file) => file.startsWith(`${id}.`));
    if (!avatarFile) return;
    const oldPath = path.join(shopAvatarDir, avatarFile);
    const newPath = path.join(
      shopAvatarDir,
      `${newId}.${avatarFile.split(".")[1]}`,
    );
    await fs.rename(oldPath, newPath);
    const shop = await Shop.findOne({username: id});
    shop.shop_avatar = newPath;
    shop.save();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  editProfileShop,
  editAvatarShop,
  deleteAvatarShop,
  deleteShop,
};
