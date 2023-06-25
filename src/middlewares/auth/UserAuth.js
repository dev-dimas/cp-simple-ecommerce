const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");

const userAuth = async (req, res, next) => {
  try {
    let {id} = req.params;
    if (!id) id = req.body.id;
    if (!id) throw {status: 400};
    const user = await User.findOne({username: id});
    if (!user) throw {status: 401};
    let accessToken;
    if (!req.headers.authorization) {
      req.headers.authorization = `Bearer ${req.cookies.accessToken}`;
      accessToken = req.cookies.accessToken;
    } else {
      accessToken = req.headers.authorization;
    }
    if (!req.headers.authorization && !req.cookies.accessToken) {
      throw {status: 403};
    }
    if (!accessToken) throw {status: 401};
    const userJWT = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (userJWT._id !== user._id.toString()) throw {status: 401};
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userAuth;
