const { APP_CONFIG } = require("../config/app.config");
const orderRepository = require("../repos/order.repo");
const orderContainerRepository = require("../repos/orderContainer.repo");
const onlineProductRepo = require("../repos/tempOnlineProduct.repo");
const offlineProductRepo = require("../repos/tempOfflineProducts.repo")
const AppError = require("../utils/appError");

class OrderContainerService {


  async createOnlineOrderContainerFromCart(cart) {
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new AppError("Invalid cart data");
    }

    const sellerOrders = {};

    for (const item of cart.products) {
      
      const OnlineProduct = await onlineProductRepo.getOnlineProductById(item.onlineProduct);

      // get the seller ID as a string (after populating, seller is an object)
      const sellerId = OnlineProduct.seller._id.toString();

      // group products by seller
      if (!sellerOrders[sellerId]) {
        sellerOrders[sellerId] = { seller: OnlineProduct.seller._id, products: [] }; // why is that bc it's going to be populated with the seller id
      }

      const productPrice = Number(OnlineProduct.price) || Number(OnlineProduct.product.price) ;
      // add product details to the seller's order
      sellerOrders[sellerId].products.push({
        product: OnlineProduct.product._id, // reference to the main product itself so we can retrieve the related data like images         quantity: item.requiredQty,
        price: productPrice ,
        requestedQuantity: item.requiredQty,
        totalPrice: item.requiredQty * productPrice,
        onlineProduct: OnlineProduct._id, // reference to the online product so we can retrieve the stock
      });
    }

    
    // create the orderContainer first
    const orderContainerData = {
      customer: cart.customerId, // customer ID from the cart
      orderType: "online", // order type (online/offline)
      gov: cart.gov, // government region (for online orders)
      address: cart.address, // address (for online orders)
      phone1: cart.phone1, // primary phone number
      phone2: cart.phone2 , // secondary phone number
      branch: cart.branch, // Branch (for offline orders)
      status: "pending",
    };// if it's offline, there's no need to use any other status than "Completed" as the order is already completed and delivered dircetly to the customer

    // save the orderContainer to the database
    console.log(orderContainerData)
    const orderContainer = await orderContainerRepository.createOrderContainer(orderContainerData);
    console.log(orderContainer)
    // create orders for each seller and link them to the orderContainer
    const orderPromises = Object.values(sellerOrders).map(async ({ seller, products }) => {
      // calculate total quantity and total price for whole order not for each product
      const totalQty = products.reduce((sum, p) => sum + p.requestedQuantity, 0); // Sum of all quantities in the order products
      const totalPrice = products.reduce((sum, p) => sum + p.totalPrice, 0); // Sum of all total prices in the order products
      let tempClerk = null;
      if( !seller.equals(APP_CONFIG.COMPANY_ID)) {
        tempClerk = seller; // seller would be the clerk in case of external seller (in order to process his own orders )
      }

      // prepare order data
      const orderData = {
        seller: seller, // seller ID
        products, // list of products in the order
        totalQty, // total quantity of products
        totalPrice, // total price of the order
        clerk: tempClerk, // clerk ID (for offline orders)
        cashier: null, // cashier ID (for offline orders)
        orderContainer: orderContainer._id, // Link the order to the orderContainer
        status:  "pending", 
        subOrderType: "online", // added to be able to return the suborders directly related to the online store
      };

      // save the order to the database
      return await orderRepository.createOrder(orderData);
    });

    // wait for all orders to be created
    const orders = await Promise.all(orderPromises);

    // update the orderContainer with references to the created orders
    orderContainer.sellersOrders = orders.map(order => ({ order: order._id }));
    await orderContainer.save();

    // return the created orderContainer
    return orderContainer;
  }

  async createOfflineOrderContainer(cart) {
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new AppError("Invalid cart data");
    }

    const sellerOrders = {};

    for (const item of cart.products) {
      // get offline product
      const OfflineProduct = await offlineProductRepo.findOfflineProductById(item.offlineProduct);

      // get the seller ID as a string (after populating, seller is an object)
      const sellerId = OfflineProduct.seller._id.toString();
      if( !sellerId.equals(APP_CONFIG.COMPANY_ID)) {
        throw new AppError("Invalid seller id, cannot sell products from external sellers in offline mode");
      }
      // group products by seller
      if (!sellerOrders[sellerId]) {
        sellerOrders[sellerId] = { seller: OfflineProduct.seller._id, products: [] }; // why is that bc it's going to be populated with the seller id
      }

      // add product details to the seller's order
      sellerOrders[sellerId].products.push({
        product: OfflineProduct.product._id, // reference to the main product itself so we can retrieve the related data like images         quantity: item.requiredQty,
        price: OfflineProduct.product.price,
        requestedQuantity: item.requiredQty,
        fulfilledQuantity : Math.min(item.requiredQty, OfflineProduct.stock), // fulfilled quantity is the minimum between the required quantity and the available stock
        canceledQuantity : Math.max(0, item.requiredQty - OfflineProduct.stock), // canceled quantity is the maximum between 0 and the difference between the required quantity and the available stock (if the stock is enough, canceled quantity will be 0)
        totalPrice: Math.min(item.requiredQty, OfflineProduct.stock) * OfflineProduct.product.price,
        offlineProduct: OfflineProduct._id, // reference to the online product so we can retrieve the stock
      });

      await offlineProductRepo.updateOfflineProductById(item.offlineProduct, { 
          $inc: { stock: - Math.min(item.requiredQty, OfflineProduct.stock) }  // update the stock in the database after the order is fulfilled
       });
    }

    
    // create the orderContainer first
    const orderContainerData = {
      customer: cart.customerId, // should it be deleted in offline mode?
      orderType: "offline", // order type (online/offline)
      gov: cart.gov, // government region (for online orders)
      address: cart.address, // address (for online orders)
      phone1: cart.phone1, // primary phone number
      phone2: cart.phone2 , // secondary phone number
      branch: cart.branch, // branch (for offline orders)
      status: "processing", 
    };// if it's offline, there's no need to use any other status than "Completed" as the order is already completed and delivered dircetly to the customer

    // save the orderContainer to the database
    const orderContainer = await orderContainerRepository.createOrderContainer(orderContainerData);

    // create orders for each seller and link them to the orderContainer
    const orderPromises = Object.values(sellerOrders).map(async ({ seller, products }) => {
      // calculate total quantity and total price for the order
      const totalQty = products.reduce((sum, p) => sum + p.fulfilledQuantity, 0); // sum of all quantities in the order products
      const totalPrice = products.reduce((sum, p) => sum + p.totalPrice, 0); // sum of all total prices in the order products

     /*********************** to be reviewed  */
        tempClerk = cart.clerk; // clerk here should be the one who filled the cart in case of offline
      /*********************** to be reviewed */
      // prepare order data
      const orderData = {
        seller:APP_CONFIG.COMPANY_ID, // seller ID
        products, // list of products in the order
        totalQty, // total quantity of products
        totalPrice, // total price of the order
        clerk: tempClerk, // Clerk ID (for offline orders)
        cashier: null, // Cashier ID (for offline orders)
        orderContainer: orderContainer._id, // Link the order to the orderContainer
        status:  "processing", 
      };

      // save the order to the database
      return await orderRepository.createOrder(orderData);
    });

    // wait for all orders to be created
    const orders = await Promise.all(orderPromises);

    // update the orderContainer with references to the created orders
    orderContainer.sellersOrders = orders.map(order => ({ order: order._id }));
    await orderContainer.save();

    // return the created orderContainer
    return orderContainer;
  }

  async finalizeOfflineOrderContainerForCashier({ containerOrderId, newStatus }) {
    const orderContainer = await orderContainerRepository.getOrderContainerById(containerOrderId);
    if (!orderContainer) {
      throw new AppError("Order container not found");
    }
  
    const orders = await orderRepository.getOrdersByContainerId(containerOrderId); // that function doesn't populate no worries
    if (!orders || orders.length === 0) {
      throw new AppError("No orders found within this container");
    }
  
    if (newStatus === "completed") {
      // mark all orders as completed
      await Promise.all(orders.map(order => 
        orderRepository.updateOrderStatus(order._id, "completed" )
      ));
      
      // update order container status
      orderContainer.status = "completed";
      await orderContainer.save();
      
    } else if (newStatus === "cancelled") {
      // reverse stock changes
      for (const order of orders) {
        for (const item of order.products) {
          await offlineProductRepo.updateOfflineProductById(item.offlineProduct, { 
            $inc: { stock: item.fulfilledQuantity } // return the fulfilled quantity back to stock
          });
        }
        // mark order as cancelled
        await orderRepository.updateOrderStatus(order._id, "cancelled" ) ;
      }
      
      // update order container status
      orderContainer.status = "cancelled";
      await orderContainer.save();
    } else {
      throw new AppError("Invalid status update");
    }
  
    return orderContainer;
  }
  

  async getOrderContainerById(containerId) {
    return await orderContainerRepository.getOrderContainerById(containerId);
  }
}

module.exports = new OrderContainerService();