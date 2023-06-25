const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {compareBcrypt} = require("../utils/security/bcryptUtils");

const getUser = async (username, password) => {
  const user = await User.findOne({username: username});
  if (!user) throw {status: 403};
  const isPasswordMatch = await compareBcrypt(password, user.password);
  if (username === user.username && isPasswordMatch) {
    return user;
  }
  return undefined;
};

const getLogged = async (username, password) => {
  try {
    const user = await getUser(username, password);
    if (!user) throw {message: "Invalid credentials!.", status: 403};
    delete user._doc.password;
    delete user._doc.cart;
    delete user._doc.transaction;
    const accessToken = jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    return {message: "Login success.", token: accessToken, error: false};
  } catch (error) {
    throw error;
  }
};

module.exports = {getLogged};
