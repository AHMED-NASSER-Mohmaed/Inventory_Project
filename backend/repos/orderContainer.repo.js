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

  async  getOrderOfflineContainers(branch, status) {
    try {
      const filters = { orderType: "offline" };
  
      if (branch) {
        filters.branch = branch;
      }
      if (status) {
        filters.status = status;
      }
  
      const offlineOrders = await OrderContainer.find(filters)
        .populate("customer", "name email")
        .populate("sellersOrders.order", "status totalPrice")
        .populate("branch", "name location");
  
      return offlineOrders;
    } catch (error) {
      throw new Error("Error fetching offline order containers: " + error.message);
    }
  }
  
}

module.exports = new OrderContainerRepository();
