const { APP_CONFIG } = require("../config/app.config");
const { brandService } = require("../services/brand.service");
const { categoryService } = require("../services/category.service");
const onlineProductRepo = require("../repos/onlineProductSeller.repo");
const AppError = require("../utils/appError");
const { productService } = require("./product.service");

class OnlineProductService {
  v
  // ✅ Case 1:  seller adds an exist product
  async addExistProduct(sellerId, productId, stock, price) {
    try {

      if (!productId || !stock || !price)
        throw new AppError("invalid fields!", APP_CONFIG.HTTP_BAD_REQUEST);

      let existingProduct = await productService.isProductExist(productId)

      if (existingProduct.status !== "approved") {
        throw new Error("Product is not approved yet.");
      }

      return await onlineProductRepo.addExistProduct(sellerId, productId, stock, price);

    } catch (error) {
      return error;
    }
  }

  async addSellerProduct(name, code, brand, category, stock, price,) {
    try {

      const sellerProduct = await onlineProductRepo.addSellerProduct(sellerId, productId, stock, price);

      return { success: true, message: "Product listed. Waiting for approval.", data: sellerProduct };

    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  // ✅ Case 2:  seller adds new product to our system
  async addNewProduct(sellerId, productData) {
    try {

      if (!productData.name || !productData.code || !productData.category || !productData.brand || !productData.price || !productData.stock) {
        throw new AppError("invalid fields!", APP_CONFIG.HTTP_BAD_REQUEST);
      }



      console.log(!categoryService.isCategoryActive(productData.category));
      // check if category exist
      if (!categoryService.isCategoryActive(productData.category))
        throw new AppError("category dose not exist!", APP_CONFIG.HTTP_BAD_REQUEST);

      if (!brandService.isBrandActive(productData.brand))
        throw new AppError("brand dose not exist!", APP_CONFIG.HTTP_BAD_REQUEST);

      console.log(productData);

      const { newProduct, newListing } = await onlineProductRepo.addNewProduct(sellerId, productData);

      return { success: true, message: "Product submitted for review.", data: { newProduct, newListing } };

    } catch (error) {
      throw error;
    }
  }

  //actual product id  --> approve product details 
  async approveProduct(productId) {
    try {
      await productService.isProductExist(productId);
      return await onlineProductRepo.approveProduct(productId);
    } catch (error) {
      throw error;
    }
  }

  //actual product id  --> reject product details
  async rejectProduct(productId) {
    try {
      await productService.isProductExist(productId);
      return await onlineProductRepo.rejectProduct(productId);
    } catch (error) {
      throw error;
    }
  }

  parseFilters(filters) {
    let fielters = ["code", "brand", "category", "name", 'isActive']

    return Object.fromEntries(

      Object.entries(filters).map(
        ([key, value]) => {

          if (fielters.includes(key))
            return [`product.${key}`, value]

          return [`${key}`, value]
        }
      )
    )

  }

  async getSellerProduct(sellerId, { filters, sort, page, limit }) {
    try {

      filters = this.parseFilters(filters);
      filters['seller'] = sellerId;
      filters['isDeleted'] = false;

      return await onlineProductRepo.getSellerProduct(filters, sort, page, limit);

    } catch (error) {
      throw error;
    }

  }

  async deActiveProduct(onProductId) {
    try {
      let ack = await onlineProductRepo.deActiveSellerProduct(onProductId);


      if (!ack.modifiedCount && !ack.matchedCount)
        throw new AppError("product dose not exist!", APP_CONFIG.HTTP_BAD_REQUEST);
      else if (!ack.modifiedCount && ack.matchedCount)
        throw new AppError("product is already deActivated!", APP_CONFIG.HTTP_BAD_REQUEST);
      return ack;
    } catch (error) {
      throw error;
    }
  }

  async activeProduct(onProductId) {
    try {
      let ack = await onlineProductRepo.activeSellerProduct(onProductId);

      if (!ack.modifiedCount && !ack.matchedCount)
        throw new AppError("product dose not exist!", APP_CONFIG.HTTP_BAD_REQUEST);
      else if (!ack.modifiedCount && ack.matchedCount)
        throw new AppError("product is already deActivated!", APP_CONFIG.HTTP_BAD_REQUEST);
      return ack;
    } catch (error) {
      throw error;
    }
  }

  async upadateSellerProduct(onProductId, onProduct) {
    try {

      let newData = {};

      let fields = ['price', 'stock'];

      Object.keys(onProduct).forEach((element) => {
        if (fields.includes(element)) {
          newData[element] = onProduct[element];
        } else {
          throw new AppError("Invalid fields!", APP_CONFIG.HTTP_BAD_REQUEST);
        }
      });



      let ack = await onlineProductRepo.updateSellerStock(onProductId, newData);

      if (!ack.modifiedCount && !ack.matchedCount)
        throw new AppError("product dose not exist!", APP_CONFIG.HTTP_BAD_REQUEST);
      else if (!ack.modifiedCount && ack.matchedCount)
        throw new AppError("product is already has the same stock !", APP_CONFIG.HTTP_BAD_REQUEST);

    } catch (error) {
      throw error;
    }
  }


  async approveSellerListing(listingId) {
    try {
      const message = await onlineProductRepo.approveSellerListing(listingId);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }



}

module.exports = new OnlineProductService();
