const SellerAnalysis = require("../services/sellerAnalysis.service");
const catchAsync = require("../utils/catchAsync");
const prot_rest = require("../utils/authMiddlewaresOptions");

class SellerAnalysisController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/seller-dashboard/analytics",
      prot_rest("seller"),
      this.getSellerDashboardOverview
    );
  }

  getSellerDashboardOverview = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const dashboardData = await SellerAnalysis.getSellerDashboardOverview(
      sellerId
    );
    res.status(200).json({
      status: "success",
      data: dashboardData,
    });
  });
}

module.exports = new SellerAnalysisController().router;
