const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const onlineProductRepo = require("../repos/tempOnlineProduct.repo");
const AppError = require("../utils/appError");
class OrderService {
// need to check on the user comming to update the order if he is the clerk or the cashier or the external seller
// cahier is the one who takes the rate of the order from the external seller by confirming the order by status completed
// clerk is the one who processes the order and fulfill it same as the external seller who handles his own orders
    async processOnlineOrderForClerkOrExternalSeller({ orderId, newStatus, clerkId, cashierId, fulfilledQuantities }) {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) throw new AppError("Order not found");
    
        // assign clerk if it's the first time updating the order
        if (!order.clerk && clerkId) {
            order.clerk = clerkId;
        }
    
        // update cashier if provided
        if (!order.cashier && cashierId) {// the one who takes the rate of the order from the external seller
            order.cashier = cashierId;
        }
    
        let newTotalPrice = 0;
        let newTotalQty = 0;
    
        // update fulfilled and canceled quantities
        if (fulfilledQuantities) {
            await Promise.all(order.products.map(async prod => {
                if (fulfilledQuantities[prod.product._id]) { // product here refers to the id of each product within products array
                    // const OnlineProduct = await onlineProductRepo.getOnlineProductById(prod.onlineProduct); // only to check on the stock before updating and to reduce the stock after
                    let fulfilledQty = fulfilledQuantities[prod.product._id];
                    if(fulfilledQty < 0 ) throw new AppError("Invalid quantity");
                    if(prod.fulfilledQuantity > 0){
                      await onlineProductRepo.updateOnlineProduct(prod.onlineProduct._id, { // you to return the fulfilled quantity back to the stock before updating the new filfulled quantity to avoid decreasing the stock infinitely if you try to fulfill the the product more than once
                        $inc: { stock: prod.fulfilledQuantity } 
                      });
                    }
                    if(fulfilledQty > prod.onlineProduct.stock) {
                      fulfilledQty =prod.onlineProduct.stock;
                    }
                    
                    fulfilledQty = Math.min(fulfilledQty, prod.requestedQuantity); // note prod.qunatity here is the quantity requested by the customer
                    prod.fulfilledQuantity = fulfilledQty;
                    prod.canceledQuantity = prod.requestedQuantity - fulfilledQty; // Set canceled quantity
                    if(prod.canceledQuantity < 0) prod.canceledQuantity = 0;
                    prod.price = prod.onlineProduct.price;
                    prod.totalPrice = prod.price * fulfilledQty;
                    newTotalPrice += prod.totalPrice;
                    newTotalQty += fulfilledQty;
                    prod.onlineProduct.stock -= fulfilledQty;
                    // await onlineProductRepo.updateOnlineProduct(prod.onlineProduct, OnlineProduct);
                    await onlineProductRepo.updateOnlineProduct(prod.onlineProduct._id, { 
                      $inc: { stock: -fulfilledQty }  // update the stock in the database after the order is fulfilled
                    });
                }
            }));

            order.totalPrice = newTotalPrice;
            order.totalQty = newTotalQty;
        }
    

        // status handling
        let isPartiallyFulfilled = false;

        for (const prod of order.products) {
            if (prod.fulfilledQuantity < prod.requestedQuantity) {
                isPartiallyFulfilled = true;
                break; 
            }
        }

        if(newStatus){
          if (newStatus === "shipped") {
            order.status = isPartiallyFulfilled ? "partially shipped" : "shipped";
          } else if (newStatus === "delivered") {
              order.status = isPartiallyFulfilled ? "partially delivered" : "delivered";
          } else if (newStatus === "cancelled") {
            await Promise.all(order.products.map(async (prod) => {
                if (prod.fulfilledQuantity > 0) {
                    // restore fulfilled quantity back to the stock
                    await onlineProductRepo.updateOnlineProduct(prod.onlineProduct._id, { 
                        $inc: { stock: prod.fulfilledQuantity } 
                    });
    
                    // reset fulfilled quantity to 0
                    prod.fulfilledQuantity = 0;
                }
                // all requested quantity is canceled as the order is canceled
                prod.canceledQuantity = prod.requestedQuantity;
                prod.totalPrice = 0;
            }));
            order.totalPrice = 0;
            order.totalQty = 0;
            order.status = newStatus;
        } else if(newStatus === "completed") { // it will be left for the cacheir to update the status to completed after he receives the rate from the external seller or even receive the our money from the customer directly if the order belongs to the company
            order.status = order.status;
        }else {
              order.status = newStatus; 
          }
        }

    
        await orderRepository.updateOrder(orderId, order);
    
        // Now update the OrderContainer's status
        await this.updateOrderContainerStatus(order.orderContainer);
    }


    async updateOrderContainerStatus(containerId) {
        const container = await orderContainerRepository.getOrderContainerById(containerId);
        if (!container) throw new AppError("Order container not found");
    
        const orders = await orderRepository.getOrdersByContainerId(containerId);
        if (orders.length === 0) return;
    
        // prioritize statuses in this order
        const statusPriority = [
          "pending", "processing", "partially shipped", "shipped",
          "partially delivered", "delivered", "partially completed", "completed", "cancelled"
        ];

        orders.sort((a, b) => statusPriority.indexOf(a.status) - statusPriority.indexOf(b.status));

        const highestStatus = orders[orders.length - 1]?.status || "pending"; // Default to "pending"
        const secondHighestStatus = orders.length > 1 ? orders[orders.length - 2]?.status : highestStatus;


        if(highestStatus == "cancelled") { // cannot make the whole order container cannceled if only one order is canceled
          orders.forEach(order => {
            if(order.status != highestStatus) highestStatus = secondHighestStatus;
          });
        }
        if(highestStatus == "shipped" || highestStatus == "delivered" || highestStatus == "completed") {
          orders.forEach(order => { // cannot make the whole order container shipped if only one order is shipped and the rest are not, delivered and completed are the same
            if(order.status != highestStatus) highestStatus = `partially ${highestStatus}`;
          });
        }
        
        await orderContainerRepository.updateOrderContainerStatus(containerId, highestStatus);
      }

      async getOrderById(orderId) {
        return await orderRepository.getOrderById(orderId);
      }
}

module.exports = new OrderService();