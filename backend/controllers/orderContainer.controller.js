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

        // offline container orders
        this.router.post(
          "/order-container-offline",
          AuthMiddleware.protect,
          catchAsync(this.createOfflineOrderContainer)
        );

        this.router.patch(
          "/finalize-order-container-offline/:containerId",
          // AuthMiddleware.protect,
          catchAsync(this.createOnlineOrderContainer)
        );


        // online container orders
        this.router.post(
            "/order-container-online",
            // AuthMiddleware.protect,
            catchAsync(this.createOnlineOrderContainer)
        );

        this.router.get(
            "/order-container/:id",
            AuthMiddleware.protect,
            catchAsync(this.getOrderContainerById)
        );

        
        

        // online suborders

        this.router.get(
            "/suborder/:id",
            // AuthMiddleware.protect,
            catchAsync(this.getSubOrderById)
        );

        this.router.patch( // update
            "/processSuborder/:orderId",
           pro_res('clerk','seller'),
            catchAsync(this.processOnlineOrderForClerkOrExternalSeller)
        );

        this.router.patch( // update
            "/finilizeSuborder/:orderId",
           pro_res('cashier'),
            catchAsync(this.cashierFinalisOnlineOrderByCompleteStatus)
        );

        this.router.get(
            "/AllSubOrdersForClerk", // same as the cashier below but it will process the suborders that are related to our company only
            // AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForClerk)
        );

        this.router.get( // in order to change the status into compelete after the order is delivered or partially delivered
            "/AllSubOrdersForCashier", // he will get all suborders that has a cashier null so he can choose to handle that suboder if he wants
            // AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForCashier) // cashier will get all suborders that has his id or null even if the suborder was not related to our company (because we need to take our rate from the external seller)
        );

        this.router.get(
            "/AllSubOrdersForExternalSeller",
            // AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForSeller)
        );

      }
//   Create an order container from cart
  async createOnlineOrderContainer(req, res) {
      const cart = req.body;
        // cart.customerId = req.user._id; // in case of online cart, the customer id is the user id
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

  async processOnlineOrderForClerkOrExternalSeller(req, res) {
    if(req.user.role == "clerk" ){ // becasue  admin can process the order too but it has to be admin of that branch
        // but once that order is assigned to someone the other cannot handle it (the order will be dedicated to only one person)
        if(!req.user.branch.equals(APP_CONFIG.ONLINE_BRANCH_ID)){
            throw new AppError("You are not authorized to process this order since you are not employed in this branch.");
        }
      req.body.clerkId = req.user.id;
    }
    else if(req.user.userType == "seller"){
        req.body.clerkId = req.user.id;
    }
    req.body.orderId = req.params.orderId;
    const subOrder = await SubOrderService.processOnlineOrderForClerkOrExternalSeller(req.body);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrder,
    });
  }

  async cashierFinalisOnlineOrderByCompleteStatus(req, res) {
    if(req.user.role == "cashier" ){ // becasue  admin can process the order too but it has to be admin of that branch
        // but once that order is assigned to someone the other cannot handle it (the order will be dedicated to only one person)
        if(!req.user.branch.equals(APP_CONFIG.ONLINE_BRANCH_ID)){
            throw new AppError("You are not authorized to process this order since you are not employed in this branch.");
        }
    }
    let orderId = req.params.orderId;
    let cashierId = req.user.id;
    const subOrder = await SubOrderService.cashierFinalisOnlineOrderByCompleteStatus({orderId, cashierId});
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrder,
    });
  }


  async getAllOnlineOrdersForClerk(req, res){

    if(!req.user.branch.equals(APP_CONFIG.ONLINE_BRANCH_ID) || req.user.role != "clerk"){
        throw new AppError("You are not authorized to get those orders since you are not employed in this branch.");
    }

    let clerkId = req.user.id; // you have to check on the online branch here which would be a static value in the app config 
    // if the clerk doesn't match that branch id then throw an error

    const subOrders = await SubOrderService.getAllOnlineOrdersForClerk(clerkId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }

  async getAllOnlineOrdersForCashier(req, res){
    if(!req.user.branch.equals(APP_CONFIG.ONLINE_BRANCH_ID) || req.user.role != "cashier"){
        throw new AppError("You are not authorized to get those orders since you are not employed in this branch.");
    }
    let cashierId = req.user.id; // you have to check on the online branch here which would be a static value in the app config
    // if the cashier doesn't match that branch id then throw an error
    const subOrders = await SubOrderService.getAllOnlineOrdersForCashier(cashierId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }

  async getAllOnlineOrdersForSeller(req, res){
    // let sellerId = req.user.userId; 
    let sellerId = '67aa455d1ea026264bf6c6b4'; // for testing
    const subOrders = await SubOrderService.getAllOnlineOrdersForSeller(sellerId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }



  /* offline container orders */

  async createOfflineOrderContainer(req, res) {
    const orderContainer = await OrderContainerService.createOfflineOrderContainer(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      orderContainer,
    });
  }
  async finalizeOfflineOrderContainer(req, res) {
    const containerOrderId = req.params.containerId;
    const newStatus = req.body.status;
    const data = { containerOrderId, newStatus } 
    const orderContainer = await OrderContainerService.finalizeOfflineOrderContainerForCashier(data);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      orderContainer,
    });
  }
}

module.exports = new OrderContainerController().router;
