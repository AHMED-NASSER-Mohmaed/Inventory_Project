// cart.repository.js
const Cart = require("../models/cart.model");

class CartRepository {
  async createCart(cartData) {
    const cart = new Cart(cartData);
    return await cart.save();
  }

  async findCartById(cartId) {
    return await Cart.findById(cartId).populate("products.onlineProduct");
  }

  async findCartByCustomerId(customerId) {
    return await Cart.findOne({ customerId: customerId });
  }

  async findCartBySessionId(sessionId) {
    return await Cart.findOne({
      sessionId: sessionId,
      isGuest: true,
    });
  }

  async updateCart(cartId, updateData) {
    return await Cart.findByIdAndUpdate(cartId, updateData, { new: true });
  }

  async deleteCartByCustomerId(customerId) {
    return await Cart.findOneAndDelete({ customerId: customerId });
  }

  async deleteCartById(cartId) {
    return await Cart.findByIdAndDelete(cartId);
  }

  async deleteCartBySessionId(sessionId) {
    return await Cart.findOneAndDelete({ sessionId: sessionId });
  }

  async addProduct(cartId, productData) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $push: { products: productData } },
      { new: true }
    );
  }

  async updateProductQuantity(cartId, productId, quantity) {
    return await Cart.findOneAndUpdate(
      { _id: cartId, "products.onlineProduct": productId },
      { $set: { "products.$.requiredQty": quantity } },
      { new: true }
    );
  }

  async removeProduct(cartId, productId) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $pull: { products: { onlineProduct: productId } } },
      { new: true }
    );
  }

  async mergeCarts(primaryCartId, secondaryCart) {
    const primaryCart = await this.findCartById(primaryCartId);
    if (!primaryCart) throw new Error("Primary cart not found");

    // Merge products from the secondary cart into the primary cart.
    secondaryCart.products.forEach((item) => {
      const existingItem = primaryCart.products.find((p) =>
        p.onlineProduct.equals(item.onlineProduct)
      );
      if (existingItem) {
        existingItem.requiredQty += item.requiredQty;
      } else {
        primaryCart.products.push(item);
      }
    });

    return await primaryCart.save();
  }
}

module.exports = new CartRepository();

// const Cart = require("../models/cart.model");
// const { create, exists } = require("../models/product.model");
// const AppError = require("../utils/appError");
// const { APP_CONFIG } = require("../config");
// const cartModel = require("../models/cart.model");
// module.exports.CartRepo = {
//   //we assum total qty here is valid
//   //we have to check if user has a cart or not
//   addToCart: async (UserId, productId, qty, isGuest = false) => {
//     try {
//       let expiryDate;
//       if (isGuest) {
//         expiryDate = new Date() + 7;
//       }

//       const cart = await Cart.findOneAndUpdate(
//         { _id: customerId, "products.productId": productId },
//         {
//           $set: {
//             "products.$.qty": qty,
//             expireAt: expiryDate,
//             isGuest: isGuest,
//           },
//         },
//         { new: true }
//       );

//       if (!cart) {
//         const updatedCart = await Cart.findOneAndUpdate(
//           { _id: customerId },
//           { $push: { products: { productId, qty } } },
//           { $set: { expireAt: expiryDate, isGuest: isGuest } },
//           { new: true }
//         );

//         return updatedCart;
//       }

//       return cart;
//     } catch (error) {
//       throw error;
//     }
//   },

//   //this function is assume all args is valid
//   deleteFromCart: async (userId, productId, isGuest_) => {
//     let expiryDate;
//     if (isGuest_) {
//       expiryDate = new Date() + 7;
//     }
//     try {
//       await Cart.UpdateOne(
//         { customerId: userId },
//         { $pull: { products: { productId } } },
//         { $set: { expireAt: expiryDate } },
//         { new: true }
//       );
//     } catch (error) {
//       throw error;
//     }
//   },

//   carHasProduct: async (customerId, productId) => {
//     try {
//       const cart = await Cart.findOne(
//         { customerId, products: { $elemMatch: { productId } } },
//         { "products.$": 1 } // project only the matching one
//       );

//       if (!cart || !cart.products || cart.products.length === 0) {
//         return null;
//       }

//       return cart.products[0];
//     } catch (error) {
//       throw error;
//     }
//   },

//   // null || cart || throw an error
//   getCart: async (userId) => {
//     try {
//       return await Cart.findOne({ _id: userId });
//     } catch (error) {
//       throw error;
//     }
//   },
// };
