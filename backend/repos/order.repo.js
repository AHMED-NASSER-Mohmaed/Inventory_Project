const { APP_CONFIG } = require("../config/app.config");
const Order = require("../models/order.model");
const OnlineProductsSchema = require("../models/onlineProducts.model");
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

    // seller
   async getAllOnlineOrdersForSellerPendingState(sellerId) {
    return await Order.find({ seller: sellerId, clerk: sellerId, status: "pending" }).populate("products.onlineProduct products.product seller")
    .populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  // clerk
   async getAllOnlineOrdersForOurCompanyForClerkPendingState(clerkId) {
    return await Order.find({
      subOrderType: "online",
      status: "pending",
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
  
  // clerk or seller
  async getAllOnlineOrdersForClerkOrSellerProcessingState(clerkId, userType) {
    let tempSeller = clerkId;
    if(userType == "clerk")  tempSeller = APP_CONFIG.COMPANY_ID;
    return await Order.find({
      subOrderType: "online",
      seller: tempSeller,
      status: "processing",
      clerk: clerkId ,
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }
  
  async getAllOnlineOrdersForClerkOrSellerCancelledState(clerkId, userType) {
    let tempSeller = clerkId;
    if(userType == "clerk")  tempSeller = APP_CONFIG.COMPANY_ID;
    return await Order.find({
      subOrderType: "online",
      seller: tempSeller,
      status: "cancelled",
      clerk: clerkId ,
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  async getAllOnlineOrdersForClerkOrSellerShippedState(clerkId, userType) {
    let tempSeller = clerkId;
    if(userType == "clerk")  tempSeller = APP_CONFIG.COMPANY_ID;
    return await Order.find({
      subOrderType: "online",
      status: { $in: ["shipped", "partially shipped"] },
      seller: tempSeller,
        clerk: clerkId ,
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  async getAllOnlineOrdersForClerkOrSellerDeliveredState(clerkId, userType) { // will be read only
    let tempSeller = clerkId;
    if(userType == "clerk")  tempSeller = APP_CONFIG.COMPANY_ID;
    return await Order.find({
      subOrderType: "online",
      status: { $in: ["delivered", "partially delivered"] },
      seller: tempSeller,
        clerk: clerkId ,
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  // cashier
   async getAllOnlineOrdersByStatusForCashierInDeliverStateToHandleTheDeliveredOrders(cashierId) {
    return await Order.find({
      subOrderType: "online",
      status: { $in: ["delivered", "partially delivered"] },
      $or: [{ cashier: null }, { cashier: cashierId }],
    }).populate("products.onlineProduct products.product  seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  async getAllOnlineOrdersByStatusCompletedForCashier(cashierId) { // read only in frontend won't be modified
    return await Order.find({
      subOrderType: "online",
      status: "completed",
       cashier: cashierId ,
    }).populate("products.onlineProduct products.product  seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  async getAllOnlineSubOrdersForSuperAdmin() {
    return await Order.find({
      subOrderType: "online",
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", // Populate the orderContainer field
      populate: {
        path: "customer", // Nested population: populate the customer inside orderContainer
      },
    })
    .exec();
  }

  async getAllOfflineSubOrdersForSuperAdmin() {
    return await Order.find({
      $or: [{ subOrderType: null }, { subOrderType: "offline" }]
    }).populate("products.onlineProduct products.product seller").populate({
      path: "orderContainer", 
      populate: {
        path: "customer", 
      },
    })
    .exec();
  }


  async  cancelOrderByCustomer(customerId, orderId) {
    const order = await Order.findById(orderId)
      .populate("products.onlineProduct products.product seller")
      .populate({
        path: "orderContainer",
        populate: {
          path: "customer", 
        },
      })
      .exec();

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!order.orderContainer || !order.orderContainer.customer._id.equals(customerId)) {
      throw new Error("Unauthorized: This order does not belong to the customer.");
    }
    

    if (["cancelled", "completed", "delivered"].includes(order.status)) {
      throw new Error("Order cannot be cancelled at this stage.");
    }

    for (const product of order.products) {
      if (product.fulfilledQuantity > 0 && product.onlineProduct) {
        await OnlineProductsSchema.findByIdAndUpdate(
          product.onlineProduct._id, 
          { $inc: { stock: product.fulfilledQuantity } } 
        );
      }

      product.canceledQuantity = product.requestedQuantity;
    }

    order.status = "cancelled";
    await order.save();

    return { message: "Order has been successfully cancelled, and online stock has been updated." };
  }


  async  cancelOnlineProductsFromOrderByCustomer(customerId, orderId, onlineProductIds) {
    const order = await Order.findById(orderId)
      .populate("products.onlineProduct products.product seller")
      .populate({
        path: "orderContainer",
        populate: {
          path: "customer", 
        },
      })
      .exec();

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!order.orderContainer || !order.orderContainer.customer._id.equals(customerId)) {
      throw new Error("Unauthorized: This order does not belong to the customer.");
    }

    if (["cancelled", "completed"].includes(order.status)) {
      throw new Error("Order cannot be modified at this stage.");
    }

    let allProductsCancelled = true;
    let someProductsCancelled = false;

    for (const product of order.products) {
      if (product.onlineProduct && onlineProductIds.includes(product.onlineProduct._id.toString())) {
        if (product.canceledQuantity < product.requestedQuantity) {
          const cancelableQty = product.requestedQuantity - product.canceledQuantity;

          if (product.fulfilledQuantity > 0) {
            await OnlineProduct.findByIdAndUpdate(
              product.onlineProduct._id,
              { $inc: { stock: product.fulfilledQuantity } }
            );
          }

          product.canceledQuantity = cancelableQty;
          someProductsCancelled = true;
        }
      } else {
        allProductsCancelled = false; 
      }
    }

    if (allProductsCancelled) {
      order.status = "cancelled";
    } else if (order.status === "delivered") {
      order.status = "partially delivered";
    } else if (order.status === "shipped") {
      order.status = "partially shipped";
    }

    await order.save();

    return { 
      message: someProductsCancelled
        ? "Selected online products have been cancelled successfully."
        : "No valid online products to cancel.",
      newStatus: order.status
    };
  }

  async  getAllOnlineSubOrdersForCustomer(customerId, status) {
    return await Order.find({
      subOrderType: "online",
      status: status, // Filter by status
    })
      .populate("products.onlineProduct products.product seller")
      .populate({
        path: "orderContainer",
        match: { customer: customerId }, // Filter by customer ID
        populate: {
          path: "customer", // Nested population to get customer details
        },
      })
      .exec();
  }
  
    
}
  
  module.exports = new OrderRepository();