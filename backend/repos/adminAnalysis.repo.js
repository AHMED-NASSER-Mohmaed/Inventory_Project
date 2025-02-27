// dashboard.repository.js
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OnlineProducts = require("../models/onlineProducts.model");
const mongoose = require("mongoose");

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

  // Revenue Stats: revenue breakdown by seller (with populated seller details)
  // Revenue Stats: revenue breakdown by seller with populated seller details and restricted fields
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
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: { path: "$sellerDetails", preserveNullAndEmptyArrays: true } },
      // Project only specific seller fields (adjust as needed)
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          orderCount: 1,
          sellerDetails: {
            firstName: "$sellerDetails.firstName",
            lastName: "$sellerDetails.lastName",
            companyName: "$sellerDetails.companyName",
            status: "$sellerDetails.status",
            email: "$sellerDetails.email",
          },
        },
      },
    ]);
  }
  // Popular Products: aggregate orders by product with populated product details
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
      { $limit: 10 },
      {
        $lookup: {
          from: "products", // collection name for Product model
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "onlineproducts",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] },
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
      {
        $project: {
          _id: 1,
          totalSoldQty: 1,
          totalRevenue: 1,
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
    ]);
  }

  // Top Sellers: aggregate orders by seller and populate seller details
  // Top Sellers: aggregate orders by seller and populate seller details with a restricted projection
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
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: { path: "$sellerDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          orderCount: 1,
          sellerDetails: {
            firstName: "$sellerDetails.firstName",
            lastName: "$sellerDetails.lastName",
            companyName: "$sellerDetails.companyName",
            status: "$sellerDetails.status",
            email: "$sellerDetails.email",
          },
        },
      },
    ]);
  }
}

module.exports = new DashboardRepository();
