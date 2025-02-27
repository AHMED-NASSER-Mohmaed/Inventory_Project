const { APP_CONFIG } = require("../config/app.config");
const OnlineProducts = require("../models/onlineProducts.model");
const { inboxResult } = require("../utils/apiFeatures");
const mongoose = require("mongoose");
const productRepo = require("../repos/product.repo");

const OnlineProductsRepository = {

  isProductExist: async (productId) => {
    try {
      return await OnlineProducts.findById(productId);
    } catch (err) {
      throw err;
    }
  },

  getProductByID:async(id)=>{
    try{
      return  await OnlineProducts.findById(id)
        .populate("seller")
        .populate("product")
        .select();
    }catch(error){
      throw error;
    }
  },

  updateOurSellerRecordQty: async (productId, sellerId, newQty) => {
    try {

      return await OnlineProducts.updateOne({ product: productId, sellerId }, { $set: { stock: newQty } })

    } catch (error) {
      throw error;
    }
  },

  //for online bracnh usage
  upsertOurSellerRecord: async (productId, newQty, newPrice) => {
    try {

      return await OnlineProducts.findOneAndUpdate(
        { _id: productId, seller: APP_CONFIG.COMPANY_ID }, // Search condition
        {
          $inc: { stock: newQty }, // Only increment stock if the document exists
          $setOnInsert: { product: productId, seller: new mongoose.Types.ObjectId(APP_CONFIG.COMPANY_ID), branch: APP_CONFIG.ONLINE_BRANCH_ID, price: newPrice,status:APP_CONFIG.APPROVED_STATUS } // Ensure new document can be created without conflicting stock updates
        },
        { upsert: true, new: true } // Ensure upsert + return updated document
      );
    } catch (error) {
      throw error;
    }
  },

  // getSellerProduct: async (productId, newQty) => {
  //   try {
  //     return OnlineProducts
  //   } catch (error) {
  //     throw error;
  //   }
  // },


  //for youmna
  getONProducts: async (filters, sort, page, limit) => {

    try {
      if (sort && sort.price) {

        let value = sort.price;
        delete sort.price;
        sort['product.price'] = value;

      }

      const [result, total] = await Promise.all([

        await OnlineProducts.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product"
            }
          },
          { $unwind: "$product" },
          {
            $lookup: {
              from: "users",
              localField: "seller",
              foreignField: "_id",
              as: "seller"
            }
          },
          { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } }, // Preserve null sellers
          {
            $match: {
              ...filters
            }
          },
          { $sort: sort },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
              $project: {
                  "_id": 1,
                  "product._id": 1,
                  "product.name":1,
                  "product.code":1,
                  "product.price": 1,
                  "product.images":1,
                  "product.description": 1,
                  "seller._id":1,
                  "seller.firstName": 1, // Ensure seller's first name is included
                  "seller.lastName":1,
              }
          }
        ]),

        await OnlineProducts.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product"
            }
          },
          { $unwind: "$product" },
          {
            $match: {
              ...filters
            }
          },
          {
            $count: "total"
          }
        ])
      ]);


      return inboxResult(result, total[0]?.total || 0, page, limit);
    } catch (error) {
      throw error;
    }
  },



  // getCount: async (filters) => {
  //   try {
  //     return await OfflineProducts.aggregate([
  //       {
  //         $lookup: {
  //           from: "products",
  //           localField: "product",
  //           foreignField: "_id",
  //           as: "product"
  //         }
  //       },
  //       { $unwind: "$product" },
  //       {
  //         $match: filters
  //       },
  //       {
  //         $count: "total"
  //       }])

  //   } catch (error) {
  //     throw error;
  //   }
  // },




}

module.exports = OnlineProductsRepository
