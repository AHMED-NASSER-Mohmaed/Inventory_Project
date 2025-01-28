const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
        required: [true, "Please provide a phone number"],
      unique: true,
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
    salt: {
      type: String,
      select: false,
      unique:true
    },
    userType: {
      type: String,
      enum: [ "staff" , "customer", "seller"],
      required: true,
      defualt: "customer"
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
     
    // otp: {
    //   type: String,
    //   select: false,
    // },
    // otpExpires: {
    //   type: Date,
    //   select: false,
    // },
    // isPhoneVerified: {
    //   type: Boolean,
    //   default: false,
    // },

  }, { discriminatorKey: "userType", timestamps: true } // 'userType' acts as a discriminator field
  ,

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, this.salt);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generateOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  this.otp = otpCode;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  return otpCode;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
