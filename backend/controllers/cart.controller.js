const {
  optionalAuth,
  protect,
  checkCustomerRole,
} = require("../middlewares/auth.middleware");
const CartService = require("../services/cart.service");
const catchAsync = require("../utils/catchAsync");
const express = require("express");

class CartController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/cart/add",
      optionalAuth,
      checkCustomerRole,
      catchAsync(this.addToCart)
    );
    this.router.get(
      "/cart",
      optionalAuth,
      checkCustomerRole,
      catchAsync(this.getCart)
    );
    this.router.delete(
      "/cart/product/:productId",
      optionalAuth,
      checkCustomerRole,
      catchAsync(this.removeProduct)
    );
    this.router.delete(
      "/cart/clear",
      optionalAuth,
      checkCustomerRole,
      catchAsync(this.clearCart)
    );
    // this.router.post(
    //   "/cart/merge",
    //   protect,
    //   checkCustomerRole,
    //   catchAsync(this.mergeGuestCartToCustomerCart)
    // );
  }

  addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;
    let customerId, sessionId;

    if (req.user) {
      customerId = req.user.id;
    } else {
      sessionId = req.body.sessionId;
    }

    const updatedCart = await CartService.addToCart({
      customerId,
      sessionId,
      productId,
      quantity,
    });

    // For guests, include the sessionId in the response so the frontend can store it.
    const responseData = { cart: updatedCart };
    if (!customerId) {
      responseData.sessionId = updatedCart.sessionId;
    }

    res.status(200).json({
      status: "success",
      data: responseData,
    });
  };

  getCart = async (req, res) => {
    let cart;

    if (req.user) {
      if (req.query.sessionId) {
        cart = await CartService.getGuestCart(req.query.sessionId);
        cart = await CartService.mergeGuestCartToCustomerCart(
          req.user.id,
          req.query.sessionId
        );
      } else cart = await CartService.getCustomerCart(req.user.id);
    } else cart = await CartService.getGuestCart(req.query.sessionId);

    const { cart: validatedCart, messages } = await CartService.validateCart(
      cart._id
    );
    res.status(200).json({
      status: "success",
      numOfCartItems: cart.products.length,
      cart: validatedCart,
      messages,
    });
  };

  removeProduct = async (req, res) => {
    const { productId } = req.params;
    let cart;

    if (req.user) {
      cart = await CartService.getCustomerCart(req.user.id);
    } else {
      cart = await CartService.getGuestCart(req.query.sessionId);
    }

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found for this user",
      });
    }
    const updatedCart = await CartService.removeProductFromCart(
      cart.id,
      productId
    );
    res.status(200).json({
      status: "success",
      data: updatedCart,
    });
  };

  clearCart = async (req, res) => {
    if (req.user) await CartService.clearCart({ customerId: req.user.id });
    else await CartService.clearCart({ sessionId: req.query.sessionId });

    res.status(200).json({
      status: "success",
      message: "Cart cleared successfully",
    });
  };

  // mergeGuestCartToCustomerCart = async (req, res) => {
  //   if (!req.user) {
  //     return res.status(400).json({
  //       status: "fail",
  //       message: "User must be logged in to merge carts",
  //     });
  //   }
  //   const customerId = req.user.id;
  //   const sessionId = req.body.sessionId;

  //   const mergedCart = await CartService.mergeGuestCartToCustomerCart(
  //     customerId,
  //     sessionId
  //   );
  //   res.status(200).json({
  //     status: "success",
  //     cart: mergedCart,
  //   });
  // };
}

module.exports = new CartController().router;
