const CartRepository = require("../repos/cart.repo");
const AppError = require("../utils/appError");
const { isProductExist } = require("../repos/onlineProducts.repo");
const crypto = require("crypto");

class CartService {
  generateSessionId() {
    return crypto.randomBytes(16).toString("hex");
  }

  findOrCreateCart = async ({ customerId, sessionId }) => {
    let cart = null;
    if (customerId) {
      cart = await CartRepository.findCartByCustomerId(customerId);

      if (!cart) {
        cart = await CartRepository.createCart({
          customerId,
          isGuest: false,
          products: [],
          expireAt: undefined,
        });
      }
    } else {
      if (!sessionId) {
        sessionId = this.generateSessionId();
      }

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

    if (quantity < 0) {
      throw new AppError(
        `What are you doing? Can't add negative quantity!!!!`,
        400
      );
    }

    // find cart
    const cart = await this.findOrCreateCart({
      customerId,
      sessionId,
    });
    if (!cart) {
      throw new AppError("Error creating cart", 500);
    }

    const existingItem = cart.products.find((item) =>
      item.onlineProduct.equals(productId)
    );

    let updatedCart;

    if (existingItem) {
      const newQuantity = existingItem.requiredQty + quantity;
      if (product.stock < newQuantity) {
        throw new AppError(
          `Insufficient stock: Only ${product.stock} available.`,
          400
        );
      }

      updatedCart = await CartRepository.updateProductQuantity(
        cart.id,
        productId,
        newQuantity
      );
    } else {
      updatedCart = await CartRepository.addProduct(cart.id, {
        onlineProduct: productId,
        requiredQty: quantity,
      });
    }

    // If guest cart, renew the expiry date
    if (!customerId) {
      updatedCart.expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await updatedCart.save();
    }
    return updatedCart;
  };

  getCustomerCart = async (customerId) => {
    const cart = await CartRepository.findCartByCustomerId(customerId);

    if (!cart) {
      throw new AppError("There is no cart for this user", 404);
    }

    return cart;
  };

  getGuestCart = async (sessionId) => {
    const cart = await CartRepository.findCartBySessionId(sessionId);

    if (!cart) {
      throw new AppError("There is no cart for this user", 404);
    }

    return cart;
  };

  removeProductFromCart = async (cartId, productId) => {
    return await CartRepository.removeProduct(cartId, productId);
  };

  mergeGuestCartToCustomerCart = async (customerId, sessionId) => {
    const guestCart = await CartRepository.findCartBySessionId(sessionId);
    if (!guestCart) return null;

    const customerCart = await CartRepository.findCartByCustomerId(customerId);
    if (!customerCart) {
      guestCart.customerId = customerId;
      guestCart.isGuest = false;
      guestCart.sessionId = undefined;
      guestCart.expireAt = undefined;
      return await guestCart.save();
    } else {
      await CartRepository.mergeCarts(customerCart.id, guestCart);
      await CartRepository.deleteCartById(guestCart.id);
      return await CartRepository.findCartById(customerCart.id);
    }
  };

  clearCart = async ({ customerId, sessionId }) => {
    if (customerId) {
      return await CartRepository.deleteCartByCustomerId(customerId);
    } else if (sessionId) {
      return await CartRepository.deleteCartBySessionId(sessionId);
    } else {
      throw new AppError("No identifier provided to clear cart", 400);
    }
  };

  validateCart = async (cartId) => {
    const cart = await CartRepository.findCartById(cartId);

    if (!cart) throw new AppError("Cart not found", 404);

    let messages = [];
    let cartUpdated = false;

    for (const item of cart.products) {
      const product = await isProductExist(item.onlineProduct);
      if (!product || !product.isActive || product.satus !== "approved") {
        messages.push(
          `Product (id: ${item.onlineProduct}) is no longer available.`
        );
        cartUpdated = true;
      } else if (product.stock === 0) {
        messages.push(`Product "${product}" is out of stock!`);
      } else if (product.stock < item.requiredQty) {
        messages.push(
          `Product "${product.product.name}" quantity adjusted to ${product.stock} due to limited stock.`
        );
        await CartRepository.updateProductQuantity(
          cart.id,
          product.id,
          product.stock
        );
        cartUpdated = true;
      }
    }

    const updatedCart = cartUpdated
      ? await CartRepository.findCartById(cartId)
      : cart;

    return { cart: this.flattenCart(updatedCart), messages };
  };

  flattenCart = (cart) => {
    // If cart is a Mongoose document, convert it to a plain object.
    const cartObj = cart.toObject ? cart.toObject() : { ...cart };

    if (Array.isArray(cartObj.products)) {
      cartObj.products = cartObj.products.map((item) => {
        if (item.onlineProduct) {
          const op = item.onlineProduct;
          const seller = op.seller || {};
          const product = op.product || {};

          return {
            _id: item._id,
            requiredQty: item.requiredQty,
            onlineProductId: op._id,
            stock: op.stock,
            price: op.price,
            // Flatten product details:
            productId: product._id,
            productName: product.name,
            productPrice: product.price,
            productImages: product.images,
            productDescription: product.description,
            productCategory: product.category,
            // Flatten seller details:
            sellerId: seller._id,
            sellerFirstName: seller.firstName || seller.name,
            sellerLastName: seller.lastName,
          };
        }
        // If no onlineProduct, return the item as is.
        return item;
      });
    }
    return cartObj;
  };
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
