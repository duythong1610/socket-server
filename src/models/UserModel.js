const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    fullName: {
      type: String,
      // required: true,
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
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    phone: {
      type: String,
      // required: true,
    },
    // address: {
    //   type: String,
    // },
    // city: {
    //   type: String,
    // },
    // district: {
    //   type: String,
    // },
    avatar: {
      type: String,
    },
    forgotPasswordInfo: {
      token: String,
      expiry: Date,
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
