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
            { path: "products.offlineProduct" }, 
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
      orderId: _id,
      orderStatus: status,
      customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
      sellerName: `${order.seller?.firstName} ${order.seller?.lastName}`,
      gov: gov,
      address: address,
      phone1: phone1,
      phone2: phone2,
      branch: branch,
      createdAt: createdAt,
      updatedAt: updatedAt,
      products: order.products.map(({ product, offlineProduct, requestedQuantity, fulfilledQuantity, canceledQuantity }) => ({
        productId: product?._id,
        productName: product?.name,
        productUrlImage: product?.images?.length > 0 ? product.images[0].url : null,
        productCode: product?.code,
        productPrice: product?.price,
        productStock: offlineProduct?.stock,
        productRequestedQuantity: requestedQuantity,
        productFulfilledQuantity: fulfilledQuantity,
        productCanceledQuantity: canceledQuantity,
      })),
      orderTotalQty: order.totalQty,
      orderTotalPrice: order.totalPrice,
      clerkName: `${order?.clerk?.firstName} ${order?.clerk?.lastName}`,
      cashierName:`${order?.cashier?.firstName} ${order?.cashier?.lastName}`
    };
  }
  
  
}

module.exports = new OrderContainerRepository();
