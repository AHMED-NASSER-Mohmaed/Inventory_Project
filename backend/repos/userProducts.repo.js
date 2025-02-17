const UserProduct = require("../models/rel_product_user.model");

class UserProductRepository {
  async findAll() {
    try {
      return await UserProduct.find();
    } catch (err) {
      throw err;
    }
  }

  async findOne(customerId, productId) {
    try {
      return await UserProduct.findOne({
        customerId: customerId,
        productIds: { $in: [productId] },
      });
    } catch (err) {
      throw err;
    }
  }

  // New create method
  async create(data) {
    try {
      return await UserProduct.create(data);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserProductRepository();
