const { APP_CONFIG } = require("../config/app.config");
const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const sellerProductRepository = require("../repos/tempSellerProduct.repo");
const AppError = require("../utils/appError");

class OrderContainerService {
  async createOrderContainerFromCart(cart) {
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new Error("Invalid cart data");
    }

    const sellerOrders = {};

    for (const item of cart.products) {
      const sellerProduct = await sellerProductRepository.getSellerProductById(item.sellerProduct);

      // if (!sellerProduct || sellerProduct.satus !== "approved" || !sellerProduct.isActive) {
      //   throw new Error(`Seller product ${item.sellerProduct} is not available for ordering.`);
      // }
      // if (!sellerProduct ) {
      //   throw new Error(`Seller product ${item.sellerProduct} is not available for ordering.`);
      // }

      const sellerId = sellerProduct.seller._id.toString(); // after populating, seller is an object and i want the id as string

      if(cart.cartType == "offline" && !sellerId.equals(APP_CONFIG.COMPANY_ID))
        throw new AppError("Invalid seller Id we cannot sell products of external sellers offline", APP_CONFIG.HTTP_BAD_REQUEST);
      if(cart.cartType == "offline" && !cart.clerk) 
        throw new AppError("Clerk is required for offline orders", APP_CONFIG.HTTP_BAD_REQUEST);
      
      if(cart.cartType == "offline" && !cart.cashier) 
        throw new AppError("Cashier is required for offline orders", APP_CONFIG.HTTP_BAD_REQUEST);


      if (!sellerOrders[sellerId]) {
        sellerOrders[sellerId] = { seller: sellerProduct.seller._id, products: [] };
      }

      sellerOrders[sellerId].products.push({
        product: sellerProduct._id, // Reference to SellerProduct
        quantity: item.requiredQty,
        price: sellerProduct.price,
        totalPrice: item.requiredQty * sellerProduct.price,
      });
    }
    

    // Create orders for each seller
    const orderPromises = Object.values(sellerOrders).map(async ({ seller, products }) => {
      const totalQty = products.reduce((sum, p) => sum + p.quantity, 0); // sum of all quantities in the order products
      const totalPrice = products.reduce((sum, p) => sum + p.totalPrice, 0); // sum of all total prices in the order products
      // note those are just initial calculations, they will be updated when the order status is updated
      if(cart.cartType == "online" ){
        return await orderRepository.createOrder({
          seller: seller,
          products,
          totalQty,
          totalPrice,
          clerk: null, // first one who handle the order status will be responsible for it and its id will be saved here
          cashier: null, // same as the above
        }); // i want to set the clerk equal to seller in case if the order was from an exteranl seller so i wanna set it manually (hard coded)
      }// but in the cacheir i want the first one who handle the order status will be responsible for it
      
      return await orderRepository.createOrder({ // if it was offline and th e seller is our system
        seller: seller._id,
        products,
        totalQty,
        totalPrice,
        clerk: cart.clerk,
        cashier: cart.cashier,
        status: "Completed" // it will be compeleted directly as it is offline the order will be delivered directly
      });
    });

    const orders = await Promise.all(orderPromises);

    // Create OrderContainer
    if(cart.cartType == "online" ){
      return await orderContainerRepository.createOrderContainer({
        customer: cart.customerId,
        orderType: cart.cartType,
        gov: cart.gov,
        address: cart.address,
        phone1: cart.phone1,
        phone2: cart.phone2,
        sellersOrders: orders.map(order => ({ order: order._id })),
        branch: cart.branch,
        
      });
    }
    return await orderContainerRepository.createOrderContainer({ // in case of offline all the orders will be completed and will be for the seller of our system
      customer: cart.customerId,
      orderType: cart.cartType,
      // gov: cart.gov,
      // address: cart.address, no need they're offline
      phone1: cart.phone1,
      phone2: cart.phone2,
      sellersOrders: orders.map(order => ({ order: order._id })),
      branch: cart.branch,
      status: "Completed"
    });
  }

  
  

}
  

module.exports = new OrderContainerService();