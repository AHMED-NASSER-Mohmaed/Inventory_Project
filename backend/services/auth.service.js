// services/auth.service.js
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const AuthRepository = require("../repos/auth.repo");
const crypto = require("crypto");

class AuthService {
  async signup(userData, baseUrl) {
    if (!["customer", "seller"].includes(userData.userType)) {
      throw new AppError("Signup not allowed for this account type", 403);
    }

    //already handled in the global error
    if (await AuthRepository.findByEmail(userData.email)) {
      throw new AppError("Email already exists", 400);
    }

    let newUser;
    if (userData.userType === "seller") {
      newUser = await AuthRepository.createSeller(userData); ///here
    } else {
      newUser = await AuthRepository.createCustomer(userData);
    }

    await new Email(newUser).sendWelcome();

    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    try {
      const verificationURL = `${baseUrl}/auth/verifyEmail/${verificationToken}`;
      await new Email(newUser, verificationURL).sendVerifyEmail();

      newUser.emailVerificationToken = undefined;
      newUser.emailVerificationTokenExpires = undefined;

      return newUser;
    } catch (err) {
      newUser.emailVerificationToken = undefined;
      newUser.emailVerificationTokenExpires = undefined;
      await newUser.save({ validateBeforeSave: false });

      throw new AppError(
        "There was an error sending the verification email. Try again later!",
        500
      );
    }
  }

  async resendVerificationEmail(email, baseUrl) {
    if (!email) return new AppError("Email is required", 400);

    const user = await AuthRepository.findByEmail(email);
    if (!user) return new AppError("User not found", 400);

    if (user.isEmailVerified)
      return new AppError("Email is already verified", 400);

    const verificationToken = user.createEmailVerificationToken();
    await AuthRepository.saveUser(user, { validateBeforeSave: false });

    try {
      const verificationURL = `${baseUrl}/auth/verifyEmail/${verificationToken}`;
      await new Email(user, verificationURL).resendVerifyEmail();

      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;

      return { status: "success" };
    } catch (err) {
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      await AuthRepository.saveUser(user, { validateBeforeSave: false });

      throw new AppError(
        "There was an error sending the verification email. Try again later!",
        500
      );
    }
  }

  async verifyEmail(paramToken) {
    const token = crypto.createHash("sha256").update(paramToken).digest("hex");
    const user = await AuthRepository.findByVerificationToken(token);
    
    console.log(user);

    if (!user) {
      return { status: "invalid_token" };
    }

    if (user.isEmailVerified) {
      return { status: "already_verified" };
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await AuthRepository.saveUser(user, { validateBeforeSave: false });

    return { status: "verified" };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await AuthRepository.findByEmail(
      email,
      "+password +isActive +status"
    );
    
    if (!user || !user.isActive || !(await user.correctPassword(password))) {
      throw new AppError("Incorrect email or password", 401);
    }
    
    if ( user.userType == "seller" ) {
      if(user.status==0)
        throw new AppError("sorry, you credentials is not revised yet.", 401);
      else if(user.status==-1)
        throw new AppError("sorry, your credentials is rejected");
    } // ahmed updates
    
    // uncomment later
    // if (!user.isEmailVerified) {
    //   throw new AppError(
    //     "Please verify your email address to get access.",
    //     401
    //   );
    // }
    // console.log("user", user);
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
