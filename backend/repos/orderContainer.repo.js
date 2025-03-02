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

  async  getOrderOfflineContainers(status, branch) {
    try {
      const filters = { orderType: "offline" };
  
      if (branch) {
        filters.branch = branch;
      }
      if (status) {
        filters.status = status;
      }
  
      const offlineOrders = await OrderContainer.find(filters)
        .populate({
          path: "sellersOrders.order",
          select: "products clerk cashier status totalPrice totalQty",
          populate: [
            { path: "products.product" }, 
            { path: "clerk", select: "firstName lastName  email" }, 
            { path: "cashier", select: "firstName lastName email" } 
          ]
        })
        .populate("customer", "firstName lastName email")
        .populate("branch", "name location");
  
        const flattenedOrders = await Promise.all(
          offlineOrders.map(order => this.flattenOrderContainer(order))
        );
    
        return flattenedOrders;
    } catch (error) {
      throw new Error("Error fetching offline order containers: " + error.message);
    }
  }

  async flattenOrderContainer(orderContainer) {
    if (!orderContainer || !orderContainer.sellersOrders.length) return null;
  
    const { 
      _id, 
      orderType, 
      gov, 
      address, 
      phone1, 
      phone2, 
      status, 
      branch, 
      createdAt, 
      updatedAt 
    } = orderContainer;
  
    const order = orderContainer.sellersOrders[0]?.order; // Assuming only one order per container
  
    if (!order) return null;
  
    return {
      _id,
      orderType,
      gov,
      address,
      phone1,
      phone2,
      status,
      branch,
      createdAt,
      updatedAt,
      products: order.products.map(product => ({
        productId: product.product._id,
        name: product.product.name,
        code: product.product.code,
        price: product.price,
        totalPrice: product.totalPrice,
        requestedQuantity: product.requestedQuantity,
        fulfilledQuantity: product.fulfilledQuantity,
        canceledQuantity: product.canceledQuantity,
        images: product.product.images.map(img => img.url),
      })),
      totalPrice: order.totalPrice,
      totalQty: order.totalQty,
      clerk: order.clerk ? {
        // id: order.clerk._id,
        name: `${order.clerk.firstName} ${order.clerk.lastName}`,
        // email: order.clerk.email
      } : null,
      cashier: order.cashier ? {
        // id: order.cashier._id,
        name: `${order.cashier.firstName} ${order.cashier.lastName}`,
        // email: order.cashier.email
      } : null
    };
  }
  
  
}

module.exports = new OrderContainerRepository();
