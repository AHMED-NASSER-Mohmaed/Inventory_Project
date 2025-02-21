const CartRepository = require("../repos/cart.repo");
const Product = require("../models/product.model");
const { APP_CONFIG } = require("../config/app.config");

const { AppError } = require("../utils/appError");
const { isProductExist } = require("../repos/onlineProducts.repo");

class CartService {
  /**
   * Finds or creates a cart based on the provided parameters.
   * For online carts:
   *  - If customerId is present, looks for a cart using customerId.
   *  - Otherwise, uses sessionId for guest carts (with a 7-day expiry).
   * For offline carts:
   *  - Both clerk and cashier must be provided.
   */
  findOrCreateCart = async ({ customerId, sessionId }) => {
    let cart = null;
    if (customerId) {
      cart = await CartRepository.findCartByCustomerId(customerId);
      if (!cart) {
        cart = await CartRepository.createCart({
          customerId,
          isGuest: false,
          products: [],
        });
      }
    } else if (sessionId) {
      cart = await CartRepository.findCartBySessionId(sessionId);
      if (!cart) {
        cart = await CartRepository.createCart({
          sessionId,
          isGuest: true,
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
          products: [],
        });
      }
    }

    return cart;
  };

  /**
   * Adds a product to the cart. If no cart exists (online or offline), it will be created.
   */

  addToCart = async ({ customerId, sessionId, productId, quantity = 1 }) => {
    // find cart
    const cart = await this.findOrCreateCart({
      customerId,
      sessionId,
    });
    if (!cart) {
      throw new AppError("Error creating cart", 500);
    }

    // find if product exists
    const product = await isProductExist(productId);
    if (!product || !product.isActive || product.satus !== "approved") {
      throw new AppError("Product not found", 404);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock: Only ${product.stock} available.`,
        400
      );
    }

    const existingItem = cart.products.find((item) =>
      item.onlineProduct.equals(productId)
    );

    if (existingItem) {
      const newQuantity = existingItem.requiredQty + quantity;
      if (product.stock < newQuantity) {
        throw new AppError(
          `Insufficient stock: Only ${product.stock} available.`,
          400
        );
      }

      const updatedCart = await CartRepository.updateProductQuantity(
        cart._id,
        productId,
        newQuantity
      );
      return updatedCart;
    } else {
      const updatedCart = await CartRepository.addProduct(cart._id, {
        onlineProduct: productId,
        requiredQty: quantity,
      });
      return updatedCart;
    }
  };

  async removeProductFromCart(cartId, productId) {
    return await CartRepository.removeProduct(cartId, productId);
  }
}

module.exports = new CartService();

// module.exports.cartService = {
//   /**
//    * check if it is not a gust check if user id is in the data base or not.
//    * check if product is already exist or not.
//    * check total qty
//    * session id of user will be handeled at controller
//    */

//   //the function will return the updated cart for the user in the happy scenario

//   addToCart: async (userId, sessionId, productId, qty) => {
//     let isGuest = userId ? false : true;
//     if (isGuest) userId = sessionId;

//     try {
//       //check product existance
//       let oproduct = await Product.findById({ _id: productId });

//       if (oproduct) {
//         let totalQty = qty;

//         let cproduct = await CartRepo.carHasProduct(userId, productId);

//         if (cproduct) {
//           totalQty += cproduct.requiredQty;
//         }

//         if (oproduct.quantity >= totalQty) {
//           return await CartRepo.addToCart(userId, productId, totalQty, isGuest);
//         } else {
//           throw new AppError(
//             "required quantity is not available.",
//             APP_CONFIG.HTTP_BAD_REQUEST
//           );
//         }
//       } else {
//         throw new AppError(
//           "product is not available.",
//           APP_CONFIG.HTTP_BAD_REQUEST
//         );
//       }
//     } catch (err) {
//       throw err;
//     }
//   },

//   updateCartProduct: async (userId, sessionId, productId, qty) => {
//     return await addToCart(userId, sessionId, productId, qty);
//   },

//   deleteCartProduct: async (userId, sessionId, productId) => {
//     let isGuest = userId ? false : true;
//     userId = sessionId;

//     return await CartRepo.decCartProduct(userId, productId, isGuest);
//   },

//   getCart: async (userId) => {
//     try {
//       const cart = await CartRepo.getCart(userId);
//       // cart.products.
//     } catch (err) {
//       return err;
//     }
//   },
// };
