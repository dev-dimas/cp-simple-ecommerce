const mongoose = require("mongoose");
const Cart = require("./cartModel");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
});

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  images: {
    type: Array,
    default: [],
  },
  rating: {
    type: Number,
    default: null,
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
});

productSchema.pre("save", async function (next) {
  try {
    const reviews = this.reviews;
    let totalRating = 0;
    if (reviews.length > 0) {
      for (const review of reviews) {
        totalRating += review.rating;
      }
      const averageRating = totalRating / reviews.length;
      this.rating = averageRating;
    } else {
      this.rating = null;
    }
    if (this.isModified("quantity")) {
      const carts = await Cart.find({
        products: {$elemMatch: {productId: this._id}},
      }).exec();
      carts.forEach(async (cart) => {
        if (cart.products[0].quantity > this.quantity) {
          cart.products[0].quantity = this.quantity;
        }
        if (this.quantity === 0) {
          cart.products[0].quantity = 0;
        }
        await cart.save();
      });
    }
    if (this.isModified("price")) {
      const carts = await Cart.find({
        products: {$elemMatch: {productId: this._id}},
      }).exec();
      carts.forEach(async (cart) => {
        cart.products[0].price = this.price;
        await cart.save();
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const shopSchema = new mongoose.Schema(
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
          "Shop usernames should only contain lowercase letters, numbers, and underscores!.",
      },
    },
    shop_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    shop_avatar: {
      type: String,
      default: null,
    },
    products: {
      type: [productSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
