const {validationResult} = require("express-validator");
const userDomain = require("../../domain/user.domain");

const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {status: 400, validation_errors: errors};
    }
    const {username, name, email, password, phone, dateOfBirth} = req.body;
    const data = await userDomain.createUser({
      username,
      name,
      email,
      password,
      phone,
      dateOfBirth,
    });
    res.send({new_user: data, error: false});
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const {id} = req.params;
    const data = await userDomain.getUser(id);
    res.send({data, error: false});
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw {status: 400, validaton_errors: error};
    }
    const {id} = req.params;
    const {username, name, email, phone, dateOfBirth} = req.body;
    const data = await userDomain.editUser(id, {
      username,
      name,
      email,
      phone,
      dateOfBirth,
    });
    res.send({updated_user: data, error: false});
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const {id} = req.params;
    const response = await userDomain.deleteUser(id);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {status: 400, validation_errors: errors};
    }
    const {id} = req.params;
    const {currentPassword, password} = req.body;
    const response = await userDomain.changePassword(
      id,
      currentPassword,
      password,
    );
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const setAvatar = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {files} = req;
    const response = await userDomain.setAvatar(id, files);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const setAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {id} = req.params;
    const {postalCode, street, subdistrict, city, province} = req.body;
    await userDomain.setAddress(
      postalCode,
      street,
      subdistrict,
      city,
      province,
      id,
    );
    res.send({message: "Address updated!", error: false});
  } catch (error) {
    next(error);
  }
};

const deleteAvatar = async (req, res, next) => {
  try {
    const {id} = req.params;
    const response = await userDomain.deleteAvatar(id);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const createShop = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {status: 400, validation_errors: errors};
    }
    const {id} = req.params;
    const {username, shopName, phone} = req.body;
    const data = await userDomain.createShop(id, {username, shopName, phone});
    res.send({new_shop: data, error: false});
  } catch (error) {
    next(error);
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
