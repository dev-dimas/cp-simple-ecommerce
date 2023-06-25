const mongoose = require("mongoose");
const {getHashBcrypt} = require("../utils/security/bcryptUtils");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => {
          return /^[a-z0-9_]+$/.test(value);
        },
        message:
          "Username should only contain lowercase letters, numbers, and underscores!.",
      },
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
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
    phone: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    shop: {
      type: String,
      ref: "Shop",
      default: null,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function (next) {
  try {
    this.updatedAt = new Date();
    if (!this.isModified("password")) return next();
    const hashedPassword = await getHashBcrypt(this.password);
    this.password = hashedPassword;
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
