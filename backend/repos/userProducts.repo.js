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

  async addProducts(customerId, productIds) {
    try {
      const userProduct = await UserProduct.findOne({ customerId });

      if (userProduct) {
        const newProducts = productIds.filter(
          (id) => !userProduct.productIds.includes(id)
        );

        if (newProducts.length > 0) {
          userProduct.productIds.push(...newProducts);
          await userProduct.save();
        }

        return userProduct;
      } else {
        return await UserProduct.create({ customerId, productIds });
      }
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserProductRepository();
