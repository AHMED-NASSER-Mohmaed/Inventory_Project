// sellerDashboardAnalytics.service.js
const SellerAnalysisRepository = require("../repos/sellerAnalysis.repo");

class SellerAnalysisService {
  async getSellerDashboardOverview(sellerId) {
    const [monthlyRevenue, topProducts, orderStats, totalProducts] =
      await Promise.all([
        SellerAnalysisRepository.getSellerMonthlyRevenue(sellerId),
        SellerAnalysisRepository.getSellerTopProducts(sellerId),
        SellerAnalysisRepository.getSellerOrderStats(sellerId),
        SellerAnalysisRepository.getSellerTotalProductsByStatus(sellerId),
      ]);

    return {
      monthlyRevenue,
      topProducts,
      orderStats,
      totalProducts,
    };
  }
}

module.exports = new SellerAnalysisService();
