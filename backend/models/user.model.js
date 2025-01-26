const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: "string",
      required: [true, "Please provide your first name"],
    },
    lastName: {
      type: "string",
      required: [true, "Please provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (number) {
          return /^(010|011|012|015)[0-9]{8}$/.test(number);
        },
        message: "Please provide a valid phone number",
      },
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (field) {
          return field === this.password;
        },
        message: "Passwords do not match",
      },
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
