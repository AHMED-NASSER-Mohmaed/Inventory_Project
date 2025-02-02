// const User = require("../models/user.model");
// const AppError = require("../utils/appError");
// const Email = require("../utils/email");
// const crypto = require("crypto");

// class UserRepository {
//   async signup(userData) {
//     try {
//       const {
//         firstName,
//         lastName,
//         email,
//         phoneNumber,
//         password,
//         passwordConfirm,
//       } = userData;

//       const newUser = await User.create({
//         firstName,
//         lastName,
//         email,
//         phoneNumber,
//         password,
//         passwordConfirm,
//       });
//       await new Email(newUser, null).sendWelcome();

//       return newUser;
//     } catch (err) {
//       throw err;
//     }
//   }

//   async login(userData) {
//     try {
//       const { email, password } = userData;
//       if (!email || !password) {
//         return new AppError("Please provide email and password", 400);
//       }

//       const user = await User.findOne({ email }).select("+password");
//       if (!user || !(await user.correctPassword(password, user.password))) {
//         throw new AppError("Incorrect email or password", 401);
//       }
//       return user;
//     } catch (err) {
//       throw err;
//     }
//   }

//   async updatePassword(userId, userData) {
//     try {
//       const user = await User.findById(userId).select("+password");
//       if (!user) throw new AppError("No user found with this id", 400);

//       if (!userData.passwordCurrent)
//         throw new AppError("Current password is not provided", 400);

//       if (
//   //      !(await user.correctPassword(userData.passwordCurrent, user.password))
//       )
//         throw new AppError("Current password is incorrect", 400);

//       const isSameOldPassword = await user.correctPassword(
//         userData.password,
//         user.password
//       );

//       if (isSameOldPassword)
//         throw new AppError(
//           "Password must be different than current password!",
//           400
//         );

//       user.password = userData.password;
//       user.passwordConfirm = userData.passwordConfirm;
//       await user.validate(["passwordConfirm"]);
//       await user.save({ validateBeforeSave: false });

//       return user;
//     } catch (err) {
//       throw err;
//     }
//   }

//   async forgotPassword(email) {
//     if (!email) {
//       throw new AppError("Email is required", 400);
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       throw new AppError("No user found with this email", 400);
//     }

//     const resetCode = user.createPasswordResetCode();
//     await user.save({ validateBeforeSave: false });

//     try {
//       await new Email(user, resetCode).sendPasswordReset();
//     } catch (err) {
//       user.passwordResetCode = undefined;
//       user.passwordResetCodeExpires = undefined;
//       await userRepo.saveUser(user, { validateBeforeSave: false });

//       throw new AppError(
//         "There was an error sending the email. Try again later!",
//         500
//       );
//     }
//   }

//   async verifyResetCode(code) {
//     try {
//       if (!code) {
//         throw new AppError("Code is required", 400);
//       }

//       const user = await User.findOne({
//         passwordResetCode: code,
//         passwordResetCodeExpires: { $gt: Date.now() },
//       });

//       if (!user) {
//         throw new AppError("Code is invalid or has expired.", 400);
//       }

//       const resetToken = user.createPasswordResetToken();
//       user.passwordResetCode = undefined;
//       user.passwordResetCodeExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return resetToken;
//     } catch (err) {
//       throw err;
//     }
//   }

//   async resetPassword(token, userData) {
//     try {
//       if (!userData.password || !userData.passwordConfirm) {
//         throw new AppError("Password is required", 400);
//       }

//       const hashedToken = crypto
//         .createHash("sha256")
//         .update(token)
//         .digest("hex");

//       const user = await User.findOne({
//         passwordResetToken: hashedToken,
//         passwordResetTokenExpires: { $gt: Date.now() },
//       }).select("+password");

//       if (!user) {
//         throw new AppError("Code is invalid or has expired.", 400);
//       }

//       const isSamePassword = await user.correctPassword(
//         userData.password,
//         user.password
//       );
//       if (isSamePassword) {
//         throw new AppError(
//           "New password must be different from the current password",
//           400
//         );
//       }

//       user.password = userData.password;
//       user.passwordConfirm = userData.passwordConfirm;
//       user.passwordResetToken = undefined;
//       user.passwordResetTokenExpires = undefined;
//       user.passwordResetCode = undefined;
//       user.passwordResetCodeExpires = undefined;

//       await user.save({ validateBeforeSave: true });
//       await new Email(user, null).sendPasswordResetSuccess();
//       return user;
//     } catch (err) {
//       throw err;
//     }
//   }
// }

// module.exports = new UserRepository();

// repositories/user.repository.js
// repositories/user.repository.js
const Customer = require("../models/customer.model");
const Seller = require("../models/seller.model");
const User = require("../models/user.model");

class UserRepository {
  
  async createCustomer(userData) {
    return Customer.create(userData);
  }

  async createSeller(userData) {
      const seller=await Seller.create(userData);
      const result = await Seller.findById(seller._id).select('-salt');
      return result;
  }

  async findByEmail(email, select = "") {
     
    return User.findOne({ email }).select(select);
  }

  async findById(id, select = "") {
    return User.findById(id).select(select);
  }

  async update(id, updateData, options = {}) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async saveUser(user, options = {}) {
    return user.save(options);
  }

  async findByResetCode(code) {
    return User.findOne({
      passwordResetCode: code,
      passwordResetCodeExpires: { $gt: Date.now() },
    });
  }

  async findByResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    }).select("+password");
  }
}

module.exports = new UserRepository();
