
const Cart = require("../models/cart.model");
const { create, exists } = require("../models/product.model");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config");
const cartModel = require("../models/cart.model");


module.exports.CartRepo = {

  


}









//   //we assum total qty here is valid
//   //we have to check if user has a cart or not
//   addToCart: async (UserId, productId, qty, isGust_ = flase) => {
//     try {
//       let expirydate;
//       if (isGuest) {
//         expirydate = new Date() + 7;
//       }

//       const cart = await Cart.findOneAndUpdate(
//         { _id: customerId, "products.productId": productId },
//         {
//           $set: {
//             "products.$.qty": qty,
//             expireAt: expirydate,
//             isGuest: isGust_,
//           },
//         },
//         { new: true }
//       );

//       if (!cart) {
//         const updatedCart = await Cart.findOneAndUpdate(
//           { _id: customerId },
//           { $push: { products: { productId, qty } } },
//           { $set: { expireAt: expirydate, isGuest: isGust_ } },
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
//     let expirydate;
//     if (isGuest_) {
//       expirydate = new Date() + 7;
//     }
//     try {
//       await Cart.UpdateOne(
//         { customerId: userId },
//         { $pull: { products: { productId } } },
//         { $set: { expireAt: expirydate } },
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
//     } catch (err) {
//       throw error;
//     }
//   },
// };
