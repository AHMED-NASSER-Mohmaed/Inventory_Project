const Review = require("../models/review.model");

class ReviewRepository {
  async findAll() {
    try {
      return await Review.find();
    } catch (err) {
      throw err;
    }
  }

  async findById(id) {
    try {
      return await Review.findById(id);
    } catch (err) {
      throw err;
    }
  }

  async findByReviewAndProduct(reviewId, productId) {
    try {
      return await Review.findOne({ _id: reviewId, productId: productId });
    } catch (err) {
      throw err;
    }
  }

  async create(reviewData) {
    try {
      return await Review.create(reviewData);
    } catch (err) {
      throw err;
    }
  }

  async updateById(reviewId, updateData) {
    try {
      return await Review.findByIdAndUpdate(reviewId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (err) {
      throw err;
    }
  }

  async deleteById(id) {
    try {
      return await Review.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }

  async getProductReviews(productId) {
    return Review.find({ productId }).populate(
      "customerId",
      "firstName lastName photo email"
    );
  }
}

module.exports = new ReviewRepository();
