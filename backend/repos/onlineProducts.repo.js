const { APP_CONFIG } = require("../config/app.config");
const OnlineProducts = require("../models/onlineProducts.model");

const productRepo = require("../repos/product.repo");

const OnlineProductsRepository = {

  isProductExist: async (productId) => {
    try {
      return await OnlineProducts.findById(productId);
    } catch (err) {
      throw err;
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
          $setOnInsert: { product: productId, seller: APP_CONFIG.COMPANY_ID, branch: APP_CONFIG.ONLINE_BRANCH_ID, price: newPrice } // Ensure new document can be created without conflicting stock updates
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


  //fix that 
  //isActive + deactive products
  //filters may contain [catergory,brand] 
  // getONProducts: async (filters, sort, page, limit) => {

  //   try {

  //     const [result, total] = await Promise.all([

  //       await OnlineProducts.aggregate([
  //         {
  //           $lookup: {
  //             from: "products",
  //             localField: "product",
  //             foreignField: "_id",
  //             as: "product"
  //           }
  //         },
  //         { $unwind: "$product" },
  //         {
  //           $match: {
  //             ...filters
  //           }

  //         },
  //         { $sort: sort },
  //         { $skip: (page - 1) * limit },
  //         { $limit: limit },
  //         { $project: { __v: 0, kind: 0, "product.satus": 0, "product.isActive": 0 } }
  //       ]),
  //       await OnlineProducts.aggregate([
  //         {
  //           $lookup: {
  //             from: "products",
  //             localField: "product",
  //             foreignField: "_id",
  //             as: "product"
  //           }
  //         },
  //         { $unwind: "$product" },
  //         {
  //           $match: {
  //             ...filters
  //           }
  //         },
  //         {
  //           $count: "total"
  //         }])


  //     ])
  //     return inboxResult(result, total[0]?.total || 0, page, limit);
  //   } catch (error) {
  //     throw error;
  //   }

  // },


  //for youmna
  getONProducts: async (filters, sort, page, limit) => {

    try {

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
              from: "sellers",  // Lookup from the sellers collection
              localField: "seller", // Reference field in OnlineProducts
              foreignField: "_id",
              as: "seller"
            }
          },
          { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } }, // Unwind but keep nulls
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
              __v: 0,
              kind: 0,
              "product.status": 0,
              "product.isActive": 0,
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
