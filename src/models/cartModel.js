const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        subTotal: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

cartSchema.pre("save", function (next) {
  let totalPrice = 0;
  for (let index = 0; index < this.products.length; index++) {
    const product = this.products[index];
    const subTotal = product.quantity * product.price;
    totalPrice += subTotal;
    this.products[index].subTotal = subTotal;
  }
  this.totalPrice = totalPrice;
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
