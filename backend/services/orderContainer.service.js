const { APP_CONFIG } = require("../config/app.config");
const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const sellerProductRepository = require("../repos/tempSellerProduct.repo");
const AppError = require("../utils/appError");

class OrderContainerService {
  async createOrderContainerFromCart(cart) {
    // Validate cart data
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new Error("Invalid cart data");
    }

    // Object to group products by seller
    const sellerOrders = {};

    // Loop through each product in the cart
    for (const item of cart.products) {
      // Fetch the seller product details
      const sellerProduct = await sellerProductRepository.getSellerProductById(item.sellerProduct);

      // Get the seller ID as a string (after populating, seller is an object)
      const sellerId = sellerProduct.seller._id.toString();

      // Validate seller for offline orders
      if (cart.cartType == "offline" && !sellerId.equals(APP_CONFIG.COMPANY_ID)) {
        throw new AppError("Invalid seller Id: we cannot sell products of external sellers offline", APP_CONFIG.HTTP_BAD_REQUEST);
      } // we only deal with the external seller in case of online 

      // Validate clerk and cashier for offline orders
      if (cart.cartType == "offline" && !cart.clerk) {
        throw new AppError("Clerk is required for offline orders", APP_CONFIG.HTTP_BAD_REQUEST);
      }
      if (cart.cartType == "offline" && !cart.cashier) {
        throw new AppError("Cashier is required for offline orders", APP_CONFIG.HTTP_BAD_REQUEST);
      }

      // Group products by seller
      if (!sellerOrders[sellerId]) {
        sellerOrders[sellerId] = { seller: sellerProduct.seller._id, products: [] }; // why is that bc it's going to be populated with the seller id
      }

      // Add product details to the seller's order
      sellerOrders[sellerId].products.push({
        product: sellerProduct._id, // Reference to SellerProduct
        quantity: item.requiredQty,
        price: sellerProduct.price,
        totalPrice: item.requiredQty * sellerProduct.price,
      });
    }

    // Create the orderContainer first
    const orderContainerData = {
      customer: cart.customerId, // Customer ID from the cart
      orderType: cart.cartType, // Order type (online/offline)
      gov: cart.gov, // Government region (for online orders)
      address: cart.address, // Address (for online orders)
      phone1: cart.phone1, // Primary phone number
      phone2: cart.phone2, // Secondary phone number
      branch: cart.branch, // Branch (for offline orders)
      status: cart.cartType === "offline" ? "completed" : "pending", // Set status based on cart type
    };// if it's offline, there's no need to use any other status than "Completed" as the order is already completed and delivered dircetly to the customer

    // Save the orderContainer to the database
    const orderContainer = await orderContainerRepository.createOrderContainer(orderContainerData);

    // Create orders for each seller and link them to the orderContainer
    const orderPromises = Object.values(sellerOrders).map(async ({ seller, products }) => {
      // Calculate total quantity and total price for the order
      const totalQty = products.reduce((sum, p) => sum + p.quantity, 0); // Sum of all quantities in the order products
      const totalPrice = products.reduce((sum, p) => sum + p.totalPrice, 0); // Sum of all total prices in the order products

      let tempClerk = null;
      if(cart.cartType == 'online' && !seller.equals(APP_CONFIG.COMPANY_ID)) {
        tempClerk = seller; // seller would be the clerk in case of external seller (in order to process his own orders )
      }

      // Prepare order data
      const orderData = {
        seller: seller, // Seller ID
        products, // List of products in the order
        totalQty, // Total quantity of products
        totalPrice, // Total price of the order
        clerk: cart.cartType === "offline" ? cart.clerk : tempClerk, // Clerk ID (for offline orders)
        cashier: cart.cartType === "offline" ? cart.cashier : null, // Cashier ID (for offline orders)
        orderContainer: orderContainer._id, // Link the order to the orderContainer
        status: cart.cartType === "offline" ? "completed" : "pending", // Set status based on cart type
      };

      // Save the order to the database
      return await orderRepository.createOrder(orderData);
    });

    // Wait for all orders to be created
    const orders = await Promise.all(orderPromises);

    // Update the orderContainer with references to the created orders
    orderContainer.sellersOrders = orders.map(order => ({ order: order._id }));
    await orderContainer.save();

    // Return the created orderContainer
    return orderContainer;
  }
}

module.exports = new OrderContainerService();