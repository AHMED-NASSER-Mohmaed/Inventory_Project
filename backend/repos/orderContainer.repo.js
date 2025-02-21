const OrderContainer = require("../models/orederContainer.model");

class OrderContainerRepository {
  async createOrderContainer(orderContainerData) {
    return await OrderContainer.create(orderContainerData);
  }

  async getOrderContainerById(containerId) {
    return await OrderContainer.findById(containerId).populate("sellersOrders.order customer");
  }

  async updateOrderContainerStatus(containerId, status) {
    return await OrderContainer.findByIdAndUpdate(containerId, { status }, { new: true });
  }

  async deleteOrderContainer(containerId) {
    return await OrderContainer.findByIdAndDelete(containerId);
  }
}

module.exports = new OrderContainerRepository();
