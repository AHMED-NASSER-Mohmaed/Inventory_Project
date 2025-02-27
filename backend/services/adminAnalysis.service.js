// dashboard.service.js
const DashboardRepository = require("../repos/adminAnalysis.repo");

class DashboardService {
  async getAnalyticsOverview() {
    const [
      monthlySignUps,
      monthlyRevenue,
      revenueBySeller,
      popularProducts,
      topSellers,
      totalCountOfProducts,
      productsStatusSummary,
    ] = await Promise.all([
      DashboardRepository.getMonthlySignUps(),
      DashboardRepository.getMonthlyRevenue(),
      DashboardRepository.getRevenueBySeller(),
      DashboardRepository.getPopularProducts(),
      DashboardRepository.getTopSellers(),
      DashboardRepository.getTotalProducts(),
      DashboardRepository.getProductStatusSummary(),
    ]);

    return {
      monthlySignUps,
      monthlyRevenue,
      revenueBySeller,
      popularProducts,
      topSellers,
      totalCountOfProducts,
      productsStatusSummary,
    };
  }
}

module.exports = new DashboardService();
