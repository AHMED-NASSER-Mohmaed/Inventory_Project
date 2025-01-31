// const AuthRepository = require("../repos/auth.repo");

// class AuthService {
//   async signup(userData) {
//     return await AuthRepository.signup(userData);
//   }

//   async login(userData) {
//     return await AuthRepository.login(userData);
//   }

//   async updatePassword(userId, userData) {
//     return await AuthRepository.updatePassword(userId, userData);
//   }

//   async forgotPassword(email) {
//     return await AuthRepository.forgotPassword(email);
//   }
//   async verifyResetCode(code) {
//     return await AuthRepository.verifyResetCode(code);
//   }
//   async resetPassword(token, userData) {
//     return await AuthRepository.resetPassword(token, userData);
//   }
// }

// module.exports = new AuthService();

// services/auth.service.js
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const AuthRepository = require("../repos/auth.repo");
const crypto = require("crypto");

class AuthService {
  async signup(userData) {
    if (await AuthRepository.findByEmail(userData.email)) {
      throw new AppError("Email already exists", 400);
    }

    const newUser = await AuthRepository.createUser(userData);
    await new Email(newUser).sendWelcome();
    return newUser;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await AuthRepository.findByEmail(email, "+password");
    if (!user || !(await user.correctPassword(password))) {
      throw new AppError("Incorrect email or password", 401);
    }

    return user;
  }

  async updatePassword(userId, currentPassword, newPassword, passwordConfirm) {
    const user = await AuthRepository.findById(userId, "+password");
    if (!user) throw new AppError("User not found", 404);

    if (!(await user.correctPassword(currentPassword))) {
      throw new AppError("Current password is incorrect", 401);
    }

    if (await user.correctPassword(newPassword)) {
      throw new AppError("New password must be different", 400);
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await AuthRepository.saveUser(user);
    return user;
  }

  async forgotPassword(email) {
    if (!email) throw new AppError("Email is required", 400);

    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    const resetCode = user.createPasswordResetCode();
    await AuthRepository.saveUser(user, { validateBeforeSave: false });

    try {
      await new Email(user, resetCode).sendPasswordReset();
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpires = undefined;
      await AuthRepository.saveUser(user, { validateBeforeSave: false });
      throw new AppError("Error sending email. Try again later!", 500);
    }
  }

  async verifyResetCode(code) {
    if (!code) throw new AppError("Reset code required", 400);

    const user = await AuthRepository.findByResetCode(code);
    if (!user) throw new AppError("Invalid or expired code", 400);

    const resetToken = user.createPasswordResetToken();
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    await AuthRepository.saveUser(user, { validateBeforeSave: false });

    return resetToken;
  }

  async resetPassword(token, password, passwordConfirm) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await AuthRepository.findByResetToken(hashedToken);

    if (!user) throw new AppError("Invalid or expired token", 400);
    if (await user.correctPassword(password)) {
      throw new AppError("New password must be different", 400);
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await AuthRepository.saveUser(user);
    await new Email(user).sendPasswordResetSuccess();
    return user;
  }
}

module.exports = new AuthService();
