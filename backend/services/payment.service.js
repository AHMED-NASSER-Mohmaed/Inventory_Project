// services/PaymentService.js
const { APP_CONFIG } = require("../config/app.config");
const orderContainerRepository = require("../repos/orderContainer.repo");
const UserRepository = require("../repos/user.repo");
const AppError = require("../utils/appError");
const stripe = require("stripe")(APP_CONFIG.STRIPE_SECRET_KEY);

class PaymentService {
  async createStripeCheckoutSession(orderContainerId, totalAmount, totalQuantity) {
    if (!orderContainerId || !totalAmount) {
      throw new AppError("orderContainerId and totalAmount are required", 400);
    }
    console.log(totalAmount);
    const orderContainer = await orderContainerRepository.getOrderContainerById(
      orderContainerId
    );
    if (!orderContainer) {
      throw new AppError("Order container not found", 404);
    }

    const customer = await UserRepository.getUser(orderContainer.customer);
    // if (!customer) {
    //   throw new AppError("Customer not found", 404);
    // }

    const successUrl = `http://localhost:3000/stripe/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `http://127.0.0.1:3000/products`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Order Payment" },
            unit_amount: Math.round(totalAmount * 100), // amount in cents
          },
          quantity: totalQuantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: orderContainerId.toString(),
      metadata: {
        firstName: (customer) ? customer.firstName : "unknown",
        lastName: (customer) ? customer.lastName : "unknown",
        phone: orderContainer?.phone1,
        price: totalAmount,
        customer: (customer) ? customer._id.toString() : "unknown" ,
      },
    });

    orderContainer.paymentStatus = "paid";
    await orderContainer.save();

    return session;
  }
}

module.exports = new PaymentService();
