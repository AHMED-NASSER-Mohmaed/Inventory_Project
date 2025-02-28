const express = require("express");
const OrderContainerService = require("../services/orderContainer.service");
const SubOrderService = require("../services/order.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");
const pro_res=require("../utils/authMiddlewaresOptions");
const AppError=require("../utils/appError");
const orderService = require("../services/order.service");
const CartService = require("../services/cart.service");

class OrderContainerController {

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
      }

      initializeRoutes() {

        // customer
        // i need here the status in query string
        this.router.get("/customerOrders", AuthMiddleware.protect, catchAsync(this.getSubOrdersForCustomerByStatus)); 
        // i need here order id as a route parameter as you see below
        this.router.patch("/customerOrders/cancelWholeOrder/:orderId", AuthMiddleware.protect, catchAsync(this.cancelSubOrderForCustomer));
        // i need here order id as a route parameter and products ids you wanna remove from the order as an array in the body request
        this.router.patch("/customerOrders/cancelSomeProductsInTheOrder/:orderId", AuthMiddleware.protect, catchAsync(this.cancelSubOrderWithProductIdsForCustomer));

        // superAdmin

        this.router.get(
          "/allSuborders/online",
          pro_res('super_admin'),
          catchAsync(this.getAllOnlineSubordersForSuperAdmin)

        )

        this.router.get(
          "/allSuborders/offline",
          pro_res('super_admin'),
          catchAsync(this.getAllOfflineSubordersForSuperAdmin)

        )

        // offline container orders
        this.router.post(
          "/order-container-offline",
          pro_res('clerk'),
          catchAsync(this.createOfflineOrderContainer)
        );

        this.router.patch(
          "/finalize-order-container-offline/:containerId",
          pro_res('cashier'),
          catchAsync(this.finalizeOfflineOrderContainer)
        );

        this.router.get(
          "order-container-offline",
          AuthMiddleware.protect,
          catchAsync(this.getOfflineOrderContainers)
        );


        // online container orders
        this.router.post(
            "/order-container-online",
            AuthMiddleware.protect,
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
            AuthMiddleware.protect,
            catchAsync(this.getSubOrderById)
        );

        this.router.patch( // update for clerk or seller
            "/processSuborder/:orderId",
           pro_res('clerk','seller'),
            catchAsync(this.processOnlineOrderForClerkOrExternalSeller)
        );

        this.router.patch( // update for cashier
            "/finilizeSuborder/:orderId",
           pro_res('cashier'),
            catchAsync(this.cashierFinalisOnlineOrderByCompleteStatus)
        );

        this.router.get(
            "/AllSubOrdersForClerk", // same as the cashier below but it will process the suborders that are related to our company only
            AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForClerk)
        );

        this.router.get( // in order to change the status into compelete after the order is delivered or partially delivered
            "/AllSubOrdersForCashier", // he will get all suborders that has a cashier null so he can choose to handle that suboder if he wants
            AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForCashier) // cashier will get all suborders that has his id or null even if the suborder was not related to our company (because we need to take our rate from the external seller)
        );

        // seller
        this.router.get(
            "/AllSubOrdersForExternalSeller",
            AuthMiddleware.protect,
            catchAsync(this.getAllOnlineOrdersForSeller)
        );

      }
//   Create an order container from cart
  async createOnlineOrderContainer(req, res) {
      const customerId = req.user.id;
      const cart = await CartService.getCustomerCart(customerId);
      // console.log(cart);
      const form = req.body.form;
      // console.log(form)
      // cart.products.forEach((product) => console.log(product.onlineProduct));
        // cart.customerId = req.user._id; // in case of online cart, the customer id is the user id
      // const  mergedCartWithFormData =  { ...cart, ...form };
      // mergedCartWithFormData.customerId = customerId;
      cart.customerId = customerId;
      cart.gov = form.gov;
      cart.phone1 = form.phone1;
      cart.phone2 = form.phone2;
      cart.address = form.address;
     const orderContainer = await OrderContainerService.createOnlineOrderContainerFromCart(cart);
      await CartService.clearCartForCustomer(customerId);
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

  

  async cashierFinalisOnlineOrderByCompleteStatus(req, res) {
    if(req.user.role == "cashier" ){ // becasue  admin can process the order too but it has to be admin of that branch
        // but once that order is assigned to someone the other cannot handle it (the order will be dedicated to only one person)
        if(req.user.branch!=APP_CONFIG.ONLINE_BRANCH_ID){
            throw new AppError("You are not authorized to process this order since you are not employed in this branch.");
        }
    }
    let orderId = req.params.orderId;
    console.log(orderId);
    let cashierId = req.user.id;
    const subOrder = await SubOrderService.cashierFinalisOnlineOrderByCompleteStatus({orderId, cashierId});
    console.log(subOrder);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrder,
    });
  }


  async getAllOnlineOrdersForClerk(req, res){

    // console.log(req.user,"clame");
    //review it ya man 

    if( req.user.branch!=APP_CONFIG.ONLINE_BRANCH_ID || req.user.role != "clerk"){
        throw new AppError("You are not authorized to get those orders since you are not employed in this branch.",APP_CONFIG.HTTP_UNAUTHORIZED);
    }

    let clerkId = req.user.id; // you have to check on the online branch here which would be a static value in the app config 
    // if the clerk doesn't match that branch id then throw an error

    let status = req.query.status; //ahmed nasser

    let userType = 'clerk';
    const subOrders = await SubOrderService.getAllOnlineOrdersForClerkOrSellerBasedOnStatus(clerkId, status, userType);
    // console.log(subOrders);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }

  async getAllOnlineOrdersForCashier(req, res){

    if(req.user.branch != APP_CONFIG.ONLINE_BRANCH_ID || req.user.role != "cashier"){
        throw new AppError("You are not authorized to get those orders since you are not employed in this branch.");
    }

    let cashierId = req.user.id; // you have to check on the online branch here which would be a static value in the app config
    // if the cashier doesn't match that branch id then throw an error

    let status = req.query.status;

    const subOrders = await SubOrderService.getAllOnlineOrdersForCashierBasedOnStatus(cashierId, status);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }


  // seller 

  async getAllOnlineOrdersForSeller(req, res){
    let sellerId = req.user.id; 
    // let sellerId = '67aa455d1ea026264bf6c6b4'; // for testing


    let status = req.params.status;

    // let userType = req.user.userType == 'seller';
    let userType = "seller"
    const subOrders = await SubOrderService.getAllOnlineOrdersForClerkOrSellerBasedOnStatus(sellerId, status, userType);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      subOrders,
    });
  }

  async processOnlineOrderForClerkOrExternalSeller(req, res) {
    if(req.user.role == "clerk" ){ // becasue  admin can process the order too but it has to be admin of that branch
        // but once that order is assigned to someone the other cannot handle it (the order will be dedicated to only one person)
        if(req.user.branch!=APP_CONFIG.ONLINE_BRANCH_ID){
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


  /* offline container orders */

  async createOfflineOrderContainer(req, res) {
    req.body.branch = req.user.branch;
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

  async getOfflineOrderContainers(req, res){
    const { status } = req.query;
    const orderContainers= await OrderContainerService.getOrderOfflineContainers(status, req.user.branch);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      orderContainers,
    });
  }

  async getAllOfflineSubordersForSuperAdmin(req, res){
    const allOfflineSuborders= await orderService.getAllOfflineSubOrdersForSuperAdmin();
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      allOfflineSuborders,
    });
  }

  async getAllOnlineSubordersForSuperAdmin(req, res){
    const allOnlineSuborders= await orderService.getAllOnlineSubOrdersForSuperAdmin();
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      allOnlineSuborders,
    });
  }



  // customer

  async  cancelSubOrderForCustomer(req, res) {
      const { orderId } = req.params; 
      const customerId = req.user.id; 
      const response = await orderService.cancelSubOrderByCustomer(customerId, orderId);
      return res.status(200).json(response);
  }

  async  cancelSubOrderWithProductIdsForCustomer(req, res) {
    const { orderId } = req.params; 
    const {  productIds } = req.body;
    const customerId = req.user.id; 

    const response = await orderService.cancelOnlineProductsFromSubOrderByCustomer(customerId, orderId, productIds);
    return res.status(200).json(response);
  }
  async  getSubOrdersForCustomerByStatus(req, res) {
      const { status } = req.query;
      const customerId = req.user.id;

      const orders = await orderService.getAllOnlineSubOrdersForCustomerByStatus(customerId, status);
      return res.status(200).json(orders);
  }



}

module.exports = new OrderContainerController().router;
