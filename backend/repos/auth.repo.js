// repositories/user.repository.js
const Customer = require("../models/customer.model");
const Seller = require("../models/seller.model");
const User = require("../models/user.model");

class UserRepository {
  async createCustomer(userData) {
    return Customer.create(userData);
  }

  async createSeller(userData) {
    const seller = await Seller.create(userData);
    const result = await Seller.findById(seller._id).select("-salt");
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

  async findByVerificationToken(token) {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });
  }
}

module.exports = new UserRepository();
