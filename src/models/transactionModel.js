const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: {
        type: String,
        default: null,
      },
      subdistrict: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      province: {
        type: String,
        default: null,
      },
      postalCode: {
        type: String,
        default: null,
      },
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipping", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
