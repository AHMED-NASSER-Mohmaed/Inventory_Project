const express = require("express");
const OrderContainerService = require("../services/orderContainer.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res=require("../utils/authMiddlewaresOptions");


class OrderContainerController {

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
      }

      initializeRoutes() {
        this.router.post(
            "/order-container",
            AuthMiddleware.protect,
            catchAsync(this.createOrderContainer)
        );
      }
//   Create an order container from cart
  async createOrderContainer(req, res) {
      const cart = req.body;
      if(cart.cartType == "online" ) 
        cart.customerId = req.user.id; // in case of online cart, the customer id is the user id
    else if(cart.cartType == "offline" ) 
        cart.cashier = req.user.id; // note user id in case of offline would be the clerk cashier id
      const orderContainer = await OrderContainerService.createOrderContainerFromCart(cart);
      res.status(APP_CONFIG.HTTP_CREATED).json({
        message: "success",
        orderContainer,
    });
  }
}

module.exports = new OrderContainerController().router;
