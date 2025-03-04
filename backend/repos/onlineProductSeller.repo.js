const { APP_CONFIG } = require("../config/app.config");
const OnlineProducts = require("../models/onlineProducts.model");
const AppError = require("../utils/appError");
const Product = require("../models/product.model");
const { inboxResult } = require("../utils/apiFeatures")

class OnlineProductRepository {

  // ✅ Case 1:  seller adds an exist product
  async addExistProduct(sellerId, productId, stock, price) {
    try {
      let PendingProduct = {
        "seller": sellerId,
        "product": productId,
        "stock": stock,
        "price": price,
        "status": APP_CONFIG.APPROVED_STATUS,
      }
      let sellerListProduct = await OnlineProducts.create(PendingProduct);

      await Product.updateOne({ _id: productId }, { $addToSet: { sellers: sellerListProduct._id } })

      return sellerListProduct;

    } catch (error) {
      throw error
    }
  }

  // ✅ Case 2: Seller add a new product (requires admin approval)
  async addNewProduct(sellerId, productData) {
    try {

      const existingProduct = await Product.findOne({
        code: productData.code,
        category: productData.category,
        brand: productData.brand
      });

      if (existingProduct) {
        if (existingProduct['status'] === APP_CONFIG.APPROVED_STATUS)
          throw new AppError("A product is already exists.", APP_CONFIG.HTTP_BAD_REQUEST);
        else if (existingProduct['status'] === APP_CONFIG.REJECT_STATUS)
          throw new AppError("the company dose not permmit to sell like that product", APP_CONFIG.HTTP_BAD_REQUEST);
      }

      let newProduct;

      if (!existingProduct) {

        newProduct = await Product.create({
          code: productData.code,
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          category: productData.category,
          status: APP_CONFIG.PENDING_STATUS
        });

      }
      else {

        newProduct = existingProduct;

        let sellerListProduct = await OnlineProducts.findOne({ product: newProduct._id, seller: sellerId });

        if (sellerListProduct)
          if (sellerListProduct['status'] == APP_CONFIG.PENDING_STATUS)
            throw new AppError("your product is pending")
          else if (sellerListProduct['status'] == APP_CONFIG.REJECT_STATUS)
            throw new AppError("your product is rejected");


      }

      const newListing = await OnlineProducts.create({
        seller: sellerId,
        product: newProduct._id,
        stock: productData.stock,
        price: productData.price,
        status: APP_CONFIG.PENDING_STATUS,
      });

      await Product.updateOne({_id:newProduct._id},{$addToSet:{sellers:newListing._id}})
  
      return { newProduct, newListing };


    } catch (error) {
      throw error;
    }
  }

  // ✅ Case 3: Admin approves a product and updates all pending seller listings ---> supper admin dashboard
  async approveProduct(productId) {
    try {

      await Product.updateOne({_id:productId}, {$set:{status:APP_CONFIG.APPROVED_STATUS}});

      await OnlineProducts.updateMany({product:productId},{$set:{status:APP_CONFIG.APPROVED_STATUS}});

      /*

      // ✅ Find and update all in one query using aggregation
      let updatedProducts = await OnlineProducts.find(
        { product: productId, status: APP_CONFIG.PENDING_STATUS }
      ).lean(); // ✅ Convert to plain objects (faster, avoids mongoose overhead)

      // ✅ Extract seller IDs from the returned documents
      let OnlineIds = updatedProducts.map(doc => doc._id);

      // ✅ Perform the update in one step (bulk update without fetching again)
      await OnlineProducts.updateMany(
        { product: productId, status: APP_CONFIG.PENDING_STATUS },
        { $set: { status: APP_CONFIG.APPROVED_STATUS } }
      );

      // ✅ Update the Product document and return the updated version
      return await Product.findOneAndUpdate(
        { _id: productId },
        {
          $set: { status: APP_CONFIG.APPROVED_STATUS },
          $addToSet: { sellers: { $each: OnlineIds } }
        },
        { new: true } // ✅ Returns the updated Product document
      );
*/
    } catch (error) {
      throw error;
    }
  }


  // ✅ Case 4: Admin rejects a product or a seller's listing       ---> supper admin dashboard
  async rejectProduct(id) {
    try {

      await Product.updateOne({ _id: id }, { status: APP_CONFIG.REJECT_STATUS });
      return await OnlineProducts.updateMany({ product: id }, { status: APP_CONFIG.REJECT_STATUS });

    } catch (error) {
      throw error;
    }
  }

  // ⚪ seller can get it's own product ---> filter include seller id
  async getSellerProduct(filters, sort, page, limit) {
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
            $match: {
              ...filters,
            }
          },
          { $sort: sort },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              "_id": 1, // for online product 
              "product.name": 1,
              "product.code": 1,
              "product.images": 1,
              "product.category": 1,
              "product.brand": 1,
              "status": 1,
              "isActive": 1,
              "product.description": 1,
              "price": 1,
              "stock": 1,
              "createdAt": 1
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
              ...filters,
              isDeleted: false,
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

  }

  async deActiveProduct(onProductId) {
    try {
      console.log("from reppppp");
      //here you can pull online seller id from array of seller
      return await OnlineProducts.updateOne({ _id: onProductId, isDeleted: false, status: APP_CONFIG.APPROVED_STATUS }, {$set:{ isActive: false} });
    } catch (error) {
      throw error;
    }
  }

  async activeProduct(onProductId) {
    try {
      return await OnlineProducts.updateOne({ _id: onProductId, isDeleted: false, status: APP_CONFIG.APPROVED_STATUS }, {$set:{ isActive: true} });
      
    } catch (error) {
      throw error;
    }
  }

  //for seller dashboard
  async updateSellerStock(onProductId, newData) {
    try {
      return await OnlineProducts.updateOne({ _id: onProductId }, newData);
    } catch (error) {
      throw error;
    }
  }

  async deActiveSellerProduct(onProductId) {
    try {
      console.log("idddd",onProductId);
      return await OnlineProducts.updateOne({ _id: onProductId }, { isDeleted: true });
    } catch (error) {
      throw error;
    }
  }

  async activeSellerProduct(onProductId) {
    try {
      return await OnlineProducts.updateOne({ _id: onProductId }, { isDeleted: false });
    } catch (error) {
      throw error;
    }
  }




  // ✅ Case 5: Admin approves a seller's product listing
  async approveSellerListing(listingId) {
    try {
      await OnlineProducts.updateOne({ _id: listingId }, { status: "approved" });

      return "Seller listing approved.";
    } catch (error) {
      throw new Error(error.message);
    }
  }



}

module.exports = new OnlineProductRepository();
