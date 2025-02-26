
const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const onlineProductRepo = require("../repos/tempOnlineProduct.repo");
const AppError = require("../utils/appError");
const { APP_CONFIG } = require("../config/app.config");
class OrderService {
// need to check on the user comming to update the order if he is the clerk or the cashier or the external seller
// cahier is the one who takes the rate of the order from the external seller by confirming the order by status completed
// clerk is the one who processes the order and fulfill it same as the external seller who handles his own orders
    async processOnlineOrderForClerkOrExternalSeller({ orderId, newStatus, clerkId, fulfilledQuantities }) {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) throw new AppError("Order not found");
    
        // assign clerk if it's the first time updating the order
        if (!order.clerk && clerkId && order.seller==APP_CONFIG.COMPANY_ID) {
            order.clerk = clerkId;
        }

        if(order.clerk && !order.clerk.equals(clerkId)){
          if(order.seller.equals(APP_CONFIG.COMPANY_ID)) { // if the order belongs to the company and there's already a clerk assigned to it
              throw new AppError("Another clerk is already assigned to this order");
          }else{ // if the order belongs to an external seller he's already handling his own orders // cannot update the clerk here bc it's eqaul to the seller
            throw new AppError("Sorry, you are not allowed to update this order since it belongs to another seller");
          }
        }  
        
    
        let newTotalPrice = 0;
        let newTotalQty = 0;
        console.log(order);
        if(order.status == "shipped" && !fulfilledQuantities) throw new AppError("You have to fulfill the order first before updating the status to shipped");
        // update fulfilled and canceled quantities
        if (fulfilledQuantities) {
            await Promise.all(order.products.map(async prod => {
              console.log(" hahahh " + prod.onlineProduct._id);
                if (fulfilledQuantities[prod.product._id]) { // product here refers to the id of each product within products array
              console.log(" hahahh " + prod.onlineProduct._id);
                    
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
        await this.updateOnlineOrderContainerStatus(order.orderContainer);
    }

    async cashierFinalisOnlineOrderByCompleteStatus({orderId, cashierId}) {

        // update cashier if provided
        if (!order.cashier && cashierId) {// the one who takes the rate of the order from the external seller
          order.cashier = cashierId;
        }

        if(order.cashier && !cashierId.equals(order.cashier)){
          throw new AppError("Another cashier is already assigned to this order");
        }
      
        const order = await orderRepository.getOrderById(orderId);
        if (!order) throw new AppError("Order not found");
        
        if(order.status == "completed") throw new AppError("Order is already completed");

        if (order.status != "delivered" || order.status != "partially delivered") throw new AppError("Cannot finalize order if it wasn't delivered or partially delivered yet!");
    
        order.status = "completed";
        await orderRepository.updateOrder(orderId, order);
    
        // Now update the OrderContainer's status
        await this.updateOnlineOrderContainerStatus(order.orderContainer);
    }

    async updateOnlineOrderContainerStatus(containerId) {
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
            if(order.status != highestStatus){ highestStatus = secondHighestStatus;
              return;
            }
          });
        }
        if(highestStatus == "shipped" || highestStatus == "delivered" || highestStatus == "completed") {
          orders.forEach(order => { // cannot make the whole order container shipped if only one order is shipped and the rest are not, delivered and completed are the same
            if(order.status != highestStatus){ highestStatus = `partially ${highestStatus}`; return;}
          });
        }
        
        await orderContainerRepository.updateOrderContainerStatus(containerId, highestStatus);
      }

      async mapOrderData(orderData) { // helper function
        console.log(orderData.products);
        const { _id: orderId, products, updatedAt, createdAt } = orderData;
        return {
            orderId,
            orderStatus: orderData.status,
            customerName: `${orderData.orderContainer?.customer?.firstName} ${orderData.orderContainer?.customer?.lastName}`,
            sellerName: `${orderData.seller.firstName} ${orderData.seller.lastName}`,
            products: products.map(({ product, onlineProduct, requestedQuantity: productRequestedQuantity, fulfilledQuantity: productFulfilledQuantity, canceledQuantity: productCanceledQuantity }) => ({
                productId: product?._id,
                productName: product?.name,
                productUrlImage: product?.images?.length > 0 ? product.images[0].url : null,
                productCode: product?.code,
                productPrice: onlineProduct?.price,
                productStock: onlineProduct?.stock,
                productRequestedQuantity,
                productFulfilledQuantity,
                productCanceledQuantity,
            })),
            orderTotalQty: orderData.totalQty,
            orderTotalPrice: orderData.totalPrice,
            createdAt,
            updatedAt,
        };
    }
      async getOrderById(orderId) {
        const returnedOrder = await orderRepository.getOrderById(orderId);

        return this.mapOrderData(returnedOrder);
      }

      async getAllOnlineOrdersForClerkOrSellerBasedOnStatus(clerkId, status, userType) {
        // return await orderRepository.getAllOnlineOrdersForSeller(sellerId);
        console.log("from pending and clerk",status);
        if(status == "pending" && userType == "seller") {
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForSellerPendingState(clerkId);
          const mappedOrders = await Promise.all(returnedOrders.map(order => {this.mapOrderData(order); console.log(order._id)}));
          return mappedOrders;
        }
        else if(status == "pending" && userType == "clerk") {
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForOurCompanyForClerkPendingState(clerkId);
          const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
          
          

          
          return mappedOrders;
        }
        else if(status == "processing"){
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForClerkOrSellerProcessingState(clerkId, userType);
          const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
          return mappedOrders;
        }
        else if(status == "cancelled"){
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForClerkOrSellerCancelledState(clerkId, userType);
          const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
          return mappedOrders;
        }
        else if(status == "shipped"){
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForClerkOrSellerShippedState(clerkId, userType);
          const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
          return mappedOrders;
        }
        else if(status == "delivered"){
          const returnedOrders =  await orderRepository.getAllOnlineOrdersForClerkOrSellerDeliveredState(clerkId, userType);
          const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
          return mappedOrders;
        }
      }

      async getAllOnlineOrdersForCashierBasedOnStatus(cashierId, status) {
        if(status == "completed") {
          const returnedOrders =  await orderRepository.getAllOnlineOrdersByStatusCompletedForCashier(cashierId);
          const mappedOrders = await Promise.all(returnedOrders.map(order => mapOrderData(order)));
          return mappedOrders;
        }
        const returnedOrders =  await orderRepository.getAllOnlineOrdersByStatusForCashierInDeliverStateToHandleTheDeliveredOrders(cashierId);
        const mappedOrders = await Promise.all(returnedOrders.map(order => mapOrderData(order)));
        return mappedOrders;
    }

    async getAllOnlineSubOrdersForSuperAdmin(){
      const returnedOrders = await orderRepository.getAllOnlineSubOrdersForSuperAdmin();
      // return returnedOrders;
      // console.log(returnedOrders)
      const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
      return mappedOrders;
    }
    async getAllOfflineSubOrdersForSuperAdmin(){
      const returnedOrders = await orderRepository.getAllOfflineSubOrdersForSuperAdmin();
      const mappedOrders = await Promise.all(returnedOrders.map(order => this.mapOrderData(order)));
      return mappedOrders;
    }
}

module.exports = new OrderService();