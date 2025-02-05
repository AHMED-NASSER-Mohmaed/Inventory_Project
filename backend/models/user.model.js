const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
      required: [true, "Please provide a phone number"],
      unique: true,
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
    salt: {
      type: String,
      select: false,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["staff", "customer", "seller"],
      required: true,
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    changedPasswordAt: Date,
    passwordResetCode: Number,
    passwordResetCodeExpires: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
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
  },
  { discriminatorKey: "kind", timestamps: true }, // 'kind' acts as a discriminator field
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

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changedTimestamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.correctPassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.createPasswordResetCode = function () {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits code

  this.passwordResetCode = resetCode;
  this.passwordResetCodeExpires = Date.now() + 2 * 60 * 1000;
  return resetCode;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours

  return verificationToken;
};

userSchema.methods.generateOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  this.otp = otpCode;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  return otpCode;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
