const {body} = require("express-validator");

const userRegistValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username (req.body.username) is required"),
  body("name").notEmpty().withMessage("Name (req.body.name) is required"),
  body("email")
    .notEmpty()
    .withMessage("Email (req.body.email) is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password")
    .notEmpty()
    .withMessage("Password (req.body.password) is required")
    .isLength({min: 8})
    .withMessage("Current password must be at least 8 characters long"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number (req.body.phone) is required"),
  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of Birth (req.body.dateOfBirth) is required")
    .toDate(),
];

const userEditValidator = [
  body("username")
    .notEmpty()
    .withMessage("username (req.body.username) is required"),
  body("name").notEmpty().withMessage("Name (req.body.name) is required"),
  body("email")
    .notEmpty()
    .withMessage("Email (req.body.email) is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number (req.body.phone) is required"),
  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of Birth (req.body.dateOfBirth) is required")
    .toDate(),
];

const userChangePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password (req.body.currentPassword) is required")
    .isLength({min: 8})
    .withMessage(
      "Current password (req.body.currentPassword) must be at least 8 characters long",
    ),
  body("password")
    .notEmpty()
    .withMessage("New password (req.body.password) is required")
    .isLength({min: 8})
    .withMessage(
      "Current password (req.body.password) must be at least 8 characters long",
    ),
];

const userSetAddressValidator = [
  body("postalCode")
    .notEmpty()
    .withMessage("Postal code (req.body.postalCode) is required"),
  body("street").notEmpty().withMessage("Street (req.body.street) is required"),
  body("subdistrict")
    .notEmpty()
    .withMessage("Subdistrict (req.body.subdistrict) is required"),
  body("city").notEmpty().withMessage("City (req.body.city) is required"),
  body("province")
    .notEmpty()
    .withMessage("Province (req.body.province) is required"),
];

const shopValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username (req.body.username) is required"),
  body("shopName")
    .notEmpty()
    .withMessage("Shop name (req.body.shopName) is required"),
  body("phone").notEmpty().withMessage("Phone (req.body.phone) is required"),
];

const productValidator = [
  body("productName")
    .notEmpty()
    .withMessage("Product name (req.body.productName) is required"),
  body("description")
    .notEmpty()
    .withMessage("Description (req.body.description) is required"),
  body("price")
    .notEmpty()
    .withMessage("Price (req.body.price) is required")
    .isNumeric()
    .withMessage("Price (req.body.price) should be a number"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity (req.body.quantity) is required")
    .isInt()
    .withMessage("Quantity (req.body.quantity) must be an integer number"),
];

const loginValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username (req.body.username) is required"),
  body("password")
    .notEmpty()
    .withMessage("Password (req.body.password) is required"),
];

const cartValidator = [
  body("quantity")
    .notEmpty()
    .withMessage("Quantity (req.body.quantity) is required!")
    .isInt()
    .withMessage("Quantity (req.body.quantity) must be an integer number!"),
];

const createTransactionValidator = [
  body("id").notEmpty().withMessage("Id (req.body.id) is required!"),
  body("productId")
    .notEmpty()
    .withMessage("ProductId (req.body.productId) is required!"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity (req.body.quantity) is required!")
    .isInt()
    .withMessage("Quantity (req.body.quantity) must be an integer number!"),
  body("payAmount")
    .notEmpty()
    .withMessage("PayAmount (req.body.payAmount) is required!")
    .isInt()
    .withMessage("PayAmount (req.body.payAmount) must be an integer number!"),
];

const checkoutCartValidator = [
  body("payAmount")
    .notEmpty()
    .withMessage("PayAmount (req.body.payAmount) is required!")
    .isInt()
    .withMessage("PayAmount (req.body.payAmount) must be an integer number!"),
];

const reviewValidator = [
  body("rating")
    .notEmpty()
    .withMessage("Rating (req.body.rating) is required!")
    .isInt({min: 1, max: 5})
    .withMessage(
      "Rating (req.body.rating) must be an integer number between 1-5!",
    ),
  body("comment")
    .notEmpty()
    .withMessage("Comment (req.body.comment) is required!"),
];

module.exports = {
  userRegistValidator,
  userEditValidator,
  userChangePasswordValidator,
  userSetAddressValidator,
  shopValidator,
  productValidator,
  loginValidator,
  cartValidator,
  createTransactionValidator,
  checkoutCartValidator,
  reviewValidator,
};
