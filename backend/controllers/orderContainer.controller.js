const express = require("express");
const OrderContainerService = require("../services/orderContainer.service");
const SubOrderService = require("../services/order.service");
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
            "/order-container-online",
            AuthMiddleware.protect,
            catchAsync(this.createOnlineOrderContainer)
        );

        this.router.get(
            "/order-container/:id",
            // AuthMiddleware.protect,
            catchAsync(this.getOrderContainerById)
        );

        
        this.router.post(
            "/order-container-offline",
            AuthMiddleware.protect,
            catchAsync(this.createOnlineOrderContainer)
        );


        this.router.get(
            "/suborder/:id",
            // AuthMiddleware.protect,
            catchAsync(this.getSubOrderById)
        );

        this.router.patch(
            "/suborder/:id",
            // AuthMiddleware.protect,
            catchAsync(this.processOnlineOrder)
        );
      }
//   Create an order container from cart
  async createOnlineOrderContainer(req, res) {
      const cart = req.body;
        cart.customerId = req.user.id; // in case of online cart, the customer id is the user id
      const orderContainer = await OrderContainerService.createOnlineOrderContainerFromCart(cart);
      res.status(APP_CONFIG.HTTP_CREATED).json({
        message: "success",
        orderContainer,
    });
  }

  async getOrderContainerById(req, res) {    
    const orderContainer = await OrderContainerService.getOrderContainerById(req.params.id);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      orderContainer,
    });
  }

  async getSubOrderById(req, res) {
    const subOrder = await SubOrderService.getOrderById(req.params.id);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrder,
    });
  }

  async processOnlineOrder(req, res) {
    req.body.orderId = req.params.id;
    const subOrder = await SubOrderService.processOnlineOrderForClerkOrExternalSeller(req.body);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrder,
    });
  }
}

module.exports = new OrderContainerController().router;
