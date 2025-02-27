// sellerDashboardAnalytics.service.js
const SellerAnalysisRepository = require("../repos/sellerAnalysis.repo");

class SellerAnalysisService {
  async getSellerDashboardOverview(sellerId) {
    const [monthlyRevenue, topProducts, orderStats, inventorySummary] =
      await Promise.all([
        SellerAnalysisRepository.getSellerMonthlyRevenue(sellerId),
        SellerAnalysisRepository.getSellerTopProducts(sellerId),
        SellerAnalysisRepository.getSellerOrderStats(sellerId),
        SellerAnalysisRepository.getSellerInventorySummary(sellerId),
      ]);

    return {
      monthlyRevenue,
      topProducts,
      orderStats,
      inventorySummary,
    };
  }
}

module.exports = new SellerAnalysisService();
