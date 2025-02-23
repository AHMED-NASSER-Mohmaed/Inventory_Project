const { APP_CONFIG } = require("../config/app.config");
const Order = require("../models/order.model");

class OrderRepository {
    async createOrder(orderData) {
      return await Order.create(orderData);
    }
  
    async getOrderById(orderId) {
      return await Order.findById(orderId).populate("products.onlineProduct products.product  seller").populate({
        path: "orderContainer", // Populate the orderContainer field
        populate: {
          path: "customer", // Nested population: populate the customer inside orderContainer
        },
      })
      .exec();;
    }
  
    async updateOrderStatus(orderId, status) {
      return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    }
  
    async deleteOrder(orderId) {
      return await Order.findByIdAndDelete(orderId);
    }

    async  updateOrder(orderId, updatedOrderData) {
        return await Order.findByIdAndUpdate(orderId, updatedOrderData, { new: true });
    }
    
    async  getOrdersByContainerId(orderContainer) {
        return await Order.find({ orderContainer });
    }

   async getAllOnlineOrdersForSeller(sellerId) {
    return await Order.find({ seller: sellerId, clerk: sellerId }).populate("products.onlineProduct products.product seller")
    .populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

   async getAllOnlineOrdersForOurCompanyForClerk(clerkId) {
    return await Order.find({
      subOrderType: "online",
      seller: APP_CONFIG.COMPANY_ID,
      $or: [{ clerk: null }, { clerk: clerkId }],
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

   async getAllOnlineOrdersByStatusForCashier(cashierId) {
    return await Order.find({
      subOrderType: "online",
      status: { $in: ["delivered", "partially delivered", "completed"] },
      $or: [{ cashier: null }, { cashier: cashierId }],
    }).populate("products.onlineProduct products.product  seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }
    
}
  
  module.exports = new OrderRepository();