const {validationResult} = require("express-validator");
const loginDomain = require("../domain/login.domain");

const getLogged = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw {status: 400, validation_errors: errors};
    const {username, password} = req.body;
    const response = await loginDomain.getLogged(username, password);
    res.cookie("accessToken", response.token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.send(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {getLogged};
