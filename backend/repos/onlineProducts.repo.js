const OnlineProducts = require("../models/onlineProducts.model");

class OnlineProductsRepository {
  async isProductExist(productId) {
    try {
      return await OnlineProducts.findById(productId);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new OnlineProductsRepository();
