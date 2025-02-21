const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const sellerProductRepository = require("../repos/tempSellerProduct.repo");

class OrderService {

    /**
         * Updates an order's status and recalculates its total price based on fulfilled quantity.
         * Also updates the OrderContainer's status.
         */
    async updateOrderStatus({ orderId, newStatus, clerkId, cashierId, fulfilledQuantities }) {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) throw new Error("Order not found");
    
        // Assign clerk if it's the first time updating the order
        if (!order.clerk && clerkId) {
            order.clerk = clerkId;
        }
    
        // Update cashier if provided
        if (!order.cashier && cashierId) {// the one who takes the rate of the order from the external seller
            order.cashier = cashierId;
        }
    
        let newTotalPrice = 0;
    
        // Update fulfilled and canceled quantities
        if (fulfilledQuantities) {
            order.products.forEach(prod => {
                if (fulfilledQuantities[prod.product]) { // product here refers to the id of each product within products array
                    let fulfilledQty = fulfilledQuantities[prod.product];
    
                    // Ensure fulfilledQuantity does not exceed ordered quantity
                    fulfilledQty = Math.min(fulfilledQty, prod.quantity);
    
                    prod.fulfilledQuantity = fulfilledQty;
                    prod.canceledQuantity = prod.quantity - fulfilledQty; // Set canceled quantity
    
                    prod.totalPrice = prod.price * fulfilledQty;
                    newTotalPrice += prod.totalPrice;
                }
            });
        }
    
        order.totalPrice = newTotalPrice;
        order.status = newStatus;
    
        await orderRepository.updateOrder(orderId, order);
    
        // Now update the OrderContainer's status
        await this.updateOrderContainerStatus(order.containerId);
    }


    async updateOrderContainerStatus(containerId) {
        const container = await orderContainerRepository.getOrderContainerById(containerId);
        if (!container) throw new Error("Order container not found");
    
        const orders = await orderRepository.getOrdersByContainerId(containerId);
        if (orders.length === 0) return;
    
        // Prioritize statuses in this order
        const statusPriority = [
          "pending", "processing", "partially shipped", "shipped",
          "partially delivered", "delivered", "Completed", "canceled"
        ];
    
        let highestStatus = "pending"; // Default
        orders.forEach(order => {
          if (statusPriority.indexOf(order.status) > statusPriority.indexOf(highestStatus)) {
            highestStatus = order.status;
          }
        });
    
        // container.status = highestStatus;
        await orderContainerRepository.updateOrderContainerStatus(containerId, highestStatus);
      }
}

module.exports = new OrderService();