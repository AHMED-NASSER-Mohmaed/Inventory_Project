const User = require("../models/user.model");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

class UserRepository {
  
  async signup(userData) {
    try {
      const { firstName, lastName, email, password, passwordConfirm } =
        userData;

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
      });

      return newUser;
    } catch (err) {
      throw err;
    }
  }

  async login(userData) {
    try {
      const { email, password } = userData;
      if (!email || !password) {
        return new AppError("Please provide email and password", 400);
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AppError("Incorrect email or password", 401);
      }
      return user;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserRepository();
