// dashboard.repository.js
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OnlineProducts = require("../models/onlineProducts.model");

class DashboardRepository {
  // Total number of products
  async getTotalProducts() {
    return await Product.countDocuments();
  }

  // Group products by status (e.g., "pending", "approved", "rejected")
  async getProductStatusSummary() {
    return await Product.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Aggregate online stock per product (only active & approved online products)
  async getOnlineInventorySummary() {
    return await OnlineProducts.aggregate([
      {
        $match: {
          isActive: true,
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$product", // group by product id
          totalStock: { $sum: "$stock" },
          averagePrice: { $avg: "$price" },
        },
      },
    ]);
  }

  // Get low-stock products based on a threshold (aggregate online stock below threshold)
  async getLowStockProducts(threshold) {
    const stockSummary = await this.getOnlineInventorySummary();
    const lowStockProductIds = stockSummary
      .filter((item) => item.totalStock < threshold)
      .map((item) => item._id);

    return await Product.find({ _id: { $in: lowStockProductIds } });
  }

  // Get pricing and margin analysis for products (showing cost, markupPercentage, and price)
  async getPricingMarginAnalysis() {
    return await Product.find(
      {},
      { name: 1, cost: 1, markupPercentage: 1, price: 1 }
    );
  }

  // Monthly Sign-ups: count new users per month
  async getMonthlySignUps() {
    return await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }

  // Monthly Revenue: sum order totalPrice per month (only for delivered/completed orders)
  async getMonthlyRevenue() {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }

  // Revenue Stats: revenue breakdown by seller (example)
  async getRevenueBySeller() {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: "$seller",
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
  }

  // Popular Products: aggregate orders by product and sum the requested quantities or totalPrice
  async getPopularProducts() {
    return await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSoldQty: { $sum: "$products.requestedQuantity" },
          totalRevenue: { $sum: "$products.totalPrice" },
        },
      },
      { $sort: { totalSoldQty: -1 } },
      { $limit: 10 }, // top 10 popular products
    ]);
  }

  // Top Sellers: aggregate orders by seller and sum the total revenue
  async getTopSellers() {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: "$seller",
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }, // top 5 sellers
    ]);
  }
}

module.exports = new DashboardRepository();
