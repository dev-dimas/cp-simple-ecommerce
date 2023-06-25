const path = require("path");
const User = require("../models/userModel");
const {compareBcrypt} = require("../utils/security/bcryptUtils");
const Shop = require("../models/shopModel");
const Cart = require("../models/cartModel");
const {deleteShop} = require("./shop.domain");
const fs = require("fs").promises;

const createUser = async (newUser) => {
  try {
    const data = await User.create(newUser);
    return data;
  } catch (error) {
    if (error.name === "ValidationError") error.status = 400;
    if (error.keyPattern?.username) {
      error.message = `Username @${error.keyValue.username} is already taken!.`;
      error.status = 409;
    } else if (error.keyPattern?.email) {
      error.message = `Email ${error.keyValue.email} is already used!.`;
      error.status = 409;
    }
    throw error;
  }
};

const getUser = async (id) => {
  try {
    const data = await User.findOne({username: id});
    if (!data) throw {status: 404};
    delete data._doc.password;
    delete data._doc.cart;
    delete data._doc.transaction;
    return data;
  } catch (error) {
    throw error;
  }
};

const editUser = async (id, updatedUser) => {
  try {
    const isExist = await User.findOne({username: id});
    if (!isExist) throw {status: 404};
    if (id !== updatedUser.username) {
      await renameAvatarFile(id, updatedUser.username);
      const cart = await Cart.findOne({user: id});
      if (cart) {
        cart.user = updatedUser.username;
        await cart.save();
      }
    }
    const data = await User.findOneAndUpdate({username: id}, updatedUser, {
      new: true,
    });
    delete data._doc.password;
    delete data._doc.cart;
    delete data._doc.transaction;
    return data;
  } catch (error) {
    if (error.keyPattern?.username) {
      error.message = `Username @${error.keyValue.username} is already taken!.`;
      error.status = 409;
    } else if (error.keyPattern?.email) {
      error.message = `Email ${error.keyValue.email} is already used!.`;
      error.status = 409;
    }
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findOne({username: id});
    const cart = await Cart.findOne({user: id});
    if (!user) throw {status: 404};
    if (user.avatar) {
      const avatarDir = path.join("public", "users", "avatar");
      const files = await fs.readdir(avatarDir);
      const avatarFile = files.find((file) => file.startsWith(`${id}.`));
      if (avatarFile) {
        const avatarPath = path.join(avatarDir, avatarFile);
        fs.unlink(avatarPath);
      }
    }
    if (cart) await cart.deleteOne();
    if (user.shop) await deleteShop(user.shop);
    await user.deleteOne();
    return {message: "OK!.", error: false};
  } catch (error) {
    throw error;
  }
};

const changePassword = async (id, currentPassword, password) => {
  try {
    const user = await User.findOne({username: id});
    if (!user) throw {status: 404};
    const isAbleToChange = await compareBcrypt(currentPassword, user.password);
    if (!isAbleToChange) throw {status: 401};
    user.password = password;
    await user.save();
    return {message: "Password updated!.", error: false};
  } catch (error) {
    throw error;
  }
};

const setAvatar = async (id, files) => {
  try {
    const user = await User.findOne({username: id});
    if (!user) throw {status: 404};
    if (!files?.length > 0 || !files) throw {status: 400};
    const publicImagePath = path.resolve("public/users/avatar");
    const {originalname: originalName, path: oldPath} = files[0];
    await fs.rename(
      oldPath,
      path.join(publicImagePath, `/${id}.${originalName.split(".")[1]}`),
    );
    user.avatar =
      files.length >= 1 &&
      `/users/avatar/${id}.${files[0].originalname.split(".")[1]}`;
    await user.save();
    return {message: "Avatar updated!", error: false};
  } catch (error) {
    throw error;
  }
};

const setAddress = async (
  postalCode,
  street,
  subdistrict,
  city,
  province,
  id,
) => {
  try {
    const user = await User.findOne({username: id});
    user.address = {street, subdistrict, city, province, postalCode};
    await user.save();
    return;
  } catch (error) {
    throw error;
  }
};

const deleteAvatar = async (id) => {
  try {
    const user = await User.findOne({username: id});
    if (!user) throw {status: 404};
    const avatarDir = path.join("public", "users", "avatar");
    const files = await fs.readdir(avatarDir);
    const avatarFile = files.find((file) => file.startsWith(`${id}.`));
    if (avatarFile) {
      const avatarPath = path.join(avatarDir, avatarFile);
      fs.unlink(avatarPath);
    }
    user.avatar = null;
    await user.save();
    return {message: "Avatar deleted!", error: false};
  } catch (error) {
    throw error;
  }
};

const createShop = async (id, newShop) => {
  try {
    const data = await Shop.create({
      username: newShop.username,
      shop_name: newShop.shopName,
      phone: newShop.phone,
    });
    await User.findOneAndUpdate({username: id}, {shop: newShop.username});
    return data;
  } catch (error) {
    if (error.name === "ValidationError") error.status = 400;
    throw error;
  }
};

const renameAvatarFile = async (id, newId) => {
  try {
    const userAvatarDir = path.join("public", "users", "avatar");
    const files = await fs.readdir(userAvatarDir);
    const avatarFile = files.find((file) => file.startsWith(`${id}.`));
    if (!avatarFile) return;
    const oldPath = path.join(userAvatarDir, avatarFile);
    const newPath = path.join(
      userAvatarDir,
      `${newId}.${avatarFile.split(".")[1]}`,
    );
    await fs.rename(oldPath, newPath);
    const user = await User.findOne({username: id});
    user.avatar = `/users/avatar/${newId}.${oldPath.split(".")[1]}`;
    user.save();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUser,
  editUser,
  deleteUser,
  changePassword,
  setAvatar,
  setAddress,
  deleteAvatar,
  createShop,
};
