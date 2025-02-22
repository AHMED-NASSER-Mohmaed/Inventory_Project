const Order = require("../models/order.model");

class OrderRepository {
    async createOrder(orderData) {
      return await Order.create(orderData);
    }
  
    async getOrderById(orderId) {
      return await Order.findById(orderId).populate("products.onlineProduct products.product  seller");
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
    
  }
  
  module.exports = new OrderRepository();