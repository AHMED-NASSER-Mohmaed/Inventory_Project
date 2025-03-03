// controllers/PaymentController.js
const PaymentService = require("../services/payment.service");

const catchAsync = require("../utils/catchAsync");

class PaymentController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/payment/create-session", catchAsync(this.createSession));
    this.router.get("/stripe/success", (req, res) => {
      const sessionId = req.query.session_id;
      res.render("paymentSuccess", { sessionId });
    });
  }

  async createSession(req, res) {
    const session = await PaymentService.createStripeCheckoutSession(
      req.body.orderContainerId,
      req.body.totalAmount
    );

    res.status(200).json({
      status: "success",
      checkoutSessionUrl: session.url,
    });
  }
}

module.exports = new PaymentController().router;
