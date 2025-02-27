// dashboard.controller.js
const DashboardService = require("../services/adminAnalysis.service");
const catchAsync = require("../utils/catchAsync");
const prot_rest = require("../utils/authMiddlewaresOptions");

class DashboardController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/admin-dashboard/analytics",
      // prot_rest("admin", "super_admin"),
      this.getAnalyticsOverview
    );
  }

  getAnalyticsOverview = catchAsync(async (req, res, next) => {
    const analyticsData = await DashboardService.getAnalyticsOverview();
    res.status(200).json({
      status: "success",
      data: analyticsData,
    });
  });
}

module.exports = new DashboardController().router;
