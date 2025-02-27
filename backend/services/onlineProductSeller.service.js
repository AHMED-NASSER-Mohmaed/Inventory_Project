const onlineProductRepo = require("../repos/onlineProductSeller.repo");

class OnlineProductService {

  async addSellerProduct(productId, stock, price,) {
    try {
      const sellerProduct = await onlineProductRepo.addSellerProduct(sellerId, productId, stock, price);
      return { success: true, message: "Product listed. Waiting for approval.", data: sellerProduct };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async addNewProduct(sellerId, productData, stock, price, branch) {
    try {
      const { newProduct, newListing } = await onlineProductRepo.addNewProduct(sellerId, productData, stock, price, branch);
      return { success: true, message: "Product submitted for review.", data: { newProduct, newListing } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async addPendingProduct(sellerId, productId, stock, price, branch) {
    try {
      const sellerProduct = await onlineProductRepo.addPendingProduct(sellerId, productId, stock, price, branch);
      return { success: true, message: "Listing created but pending approval.", data: sellerProduct };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async approveProduct(productId) {
    try {
      const message = await onlineProductRepo.approveProduct(productId);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error.message };
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

  async rejectProductOrListing(type, id) {
    try {
      const message = await onlineProductRepo.rejectProductOrListing(type, id);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new OnlineProductService();
