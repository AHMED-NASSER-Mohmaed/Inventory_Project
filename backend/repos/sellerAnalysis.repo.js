// sellerDashboardAnalytics.repo.js
const Order = require("../models/order.model");
const OnlineProducts = require("../models/onlineProducts.model");
const mongoose = require("mongoose");

class SellerAnalysisRepository {
  // Get monthly revenue for a seller from orders that are delivered/completed
  async getSellerMonthlyRevenue(sellerId) {
    return await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
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
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }

  // Get top selling products for the seller based on orders
  async getSellerTopProducts(sellerId) {
    return await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
          status: { $in: ["delivered", "completed"] },
        },
      },

      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.requestedQuantity" },
          totalProductRevenue: { $sum: "$products.totalPrice" },
        },
      },
      {
        $lookup: {
          from: "products", // your collection name for products
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
  }

  // Get order statistics for the seller (total orders, pending, delivered, etc.)
  async getSellerOrderStats(sellerId) {
    return await Order.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Get inventory summary from OnlineProducts for this seller
  async getSellerInventorySummary(sellerId) {
    return await OnlineProducts.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
          isActive: true,
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$product",
          totalStock: { $sum: "$stock" },
          averagePrice: { $avg: "$price" },
        },
      },
      {
        $sort: { totalStock: 1 },
      },
      {
        $lookup: {
          from: "products", // collection name of your Product model
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }
}

module.exports = new SellerAnalysisRepository();
