const Order = require("../models/order.model");

class OrderRepository {
    async createOrder(orderData) {
      return await Order.create(orderData);
    }
  
    async getOrderById(orderId) {
      return await Order.findById(orderId).populate("products.product seller");
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
    
    async  getOrdersByContainerId(containerId) {
        return await Order.find({ containerId });
    }
    
  }
  
  module.exports = new OrderRepository();