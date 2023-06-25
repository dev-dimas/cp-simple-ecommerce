const User = require("../models/userModel");
const Shop = require("../models/shopModel");

const checkProductOwnership = async (req, res, next) => {
  try {
    let {id, productId} = req.params;
    if (!id) id = req.body.id;
    if (!productId) productId = req.body.productId;
    if (!id || !productId) throw {status: 400};
    const user = await User.findOne({username: id});
    const product = await Shop.findOne({
      products: {$elemMatch: {_id: productId}},
    });
    if (user.shop === product.username) throw {status: 403};
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkProductOwnership;
