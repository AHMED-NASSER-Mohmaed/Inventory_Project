const OnlineProducts = require("../models/OnlineProducts");
const Product = require("../models/product.model");

class OnlineProductRepository {

  // Case 1: Seller adds an already approved product
  async addSellerProduct(sellerId, productId, stock, price) {
    
    try {

    //check firstly if product exist or not 
      const existingProduct = await Product.findOne({ _id: productId });

      if (!existingProduct) {
        throw new Error("Product does not exist.");
      }

      if (existingProduct.status !== "approved") {
        throw new Error("Product is not approved yet.");
      }

      const existingListing = await OnlineProducts.findOne({ seller: sellerId, product: productId });

      if (existingListing) {
        throw new Error("You have already listed this product.");
      }

      const newListing = await OnlineProducts.create({
        seller: sellerId,
        product: productId,
        stock,
        price,
        branch,
        status: "pending",
      });

      return newListing;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // ✅ Case 2: Seller adds a new product (requires admin approval)
  async addNewProduct(sellerId, productData, stock, price, branch) {
    try {
      const existingProduct = await Product.findOne({ code: productData.code });

      if (existingProduct) {
        throw new Error("A product with this code already exists.");
      }

      const newProduct = await Product.create({
        ...productData,
        status: "pending",
      });

      const newListing = await OnlineProducts.create({
        seller: sellerId,
        product: newProduct._id,
        stock,
        price,
        branch,
        status: "pending",
      });

      return { newProduct, newListing };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // ✅ Case 3: Another seller adds a pending product
  async addPendingProduct(sellerId, productId, stock, price, branch) {
    try {
      const existingProduct = await Product.findOne({ _id: productId });

      if (!existingProduct) {
        throw new Error("Product does not exist.");
      }

      const newListing = await OnlineProducts.create({
        seller: sellerId,
        product: productId,
        stock,
        price,
        branch,
        status: "pending",
      });

      return newListing;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // ✅ Case 4: Admin approves a product and updates all pending seller listings
  async approveProduct(productId) {
    try {
      await Product.updateOne({ _id: productId }, { status: "approved" });
      await OnlineProducts.updateMany({ product: productId, status: "pending" }, { status: "approved" });

      return "Product and all related listings approved.";
    } catch (error) {
      throw new Error(error.message);
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

  // ✅ Case 6: Admin rejects a product or a seller's listing
  async rejectProductOrListing(type, id) {
    try {
      if (type === "product") {
        await Product.updateOne({ _id: id }, { status: "rejected" });
        await OnlineProducts.updateMany({ product: id }, { status: "rejected" });

        return "Product and related listings rejected.";
      } else if (type === "listing") {
        await OnlineProducts.updateOne({ _id: id }, { status: "rejected" });

        return "Seller listing rejected.";
      } else {
        throw new Error("Invalid type. Must be 'product' or 'listing'.");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new OnlineProductRepository();
