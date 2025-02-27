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
      // Lookup product details from the products collection
      {
        $lookup: {
          from: "products",
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
      // Lookup online product details from the onlineproducts collection for this seller
      {
        $lookup: {
          from: "onlineproducts",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$product", "$$productId"] },
                    { $eq: ["$seller", new mongoose.Types.ObjectId(sellerId)] },
                  ],
                },
                isActive: true,
                status: "approved",
              },
            },
            { $project: { price: 1, _id: 0 } },
            { $limit: 1 },
          ],
          as: "onlineProductDetails",
        },
      },
      {
        $unwind: {
          path: "$onlineProductDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Final projection: include only specific fields from productDetails and compute finalPrice
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalProductRevenue: 1,
          productDetails: {
            name: "$productDetails.name",
            code: "$productDetails.code",
            price: "$productDetails.price",
            category: "$productDetails.category",
            status: "$productDetails.status",
            images: "$productDetails.images",
            sellers: "$productDetails.sellers",
          },
          finalPrice: {
            $ifNull: ["$onlineProductDetails.price", "$productDetails.price"],
          },
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
}

module.exports = new SellerAnalysisRepository();
