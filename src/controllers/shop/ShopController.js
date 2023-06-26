const {validationResult} = require("express-validator");
const shopDomain = require("../../domain/shop.domain");

const editProfileShop = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {status: 400, validation_errors: errors};
    }
    const {id} = req.params;
    const {username, shopName, phone} = req.body;
    const updatedData = await shopDomain.editProfileShop(id, {
      username,
      shopName,
      phone,
    });
    res.send({updated_shop: updatedData, error: false});
  } catch (error) {
    next(error);
  }
};

const editAvatarShop = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {files} = req;
    const response = await shopDomain.editAvatarShop(id, files);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const deleteAvatarShop = async (req, res, next) => {
  try {
    const {id} = req.params;
    const response = await shopDomain.deleteAvatarShop(id);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const deleteShop = async (req, res, next) => {
  try {
    const {id} = req.params;
    const response = await shopDomain.deleteShop(id);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  editProfileShop,
  editAvatarShop,
  deleteAvatarShop,
  deleteShop,
};
