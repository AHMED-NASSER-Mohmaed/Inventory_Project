const ReviewRepository = require("../repos/review.repo");
const UserProductRepository = require("../repos/userProducts.repo");
const AppError = require("../utils/appError");

class ReviewService {
  async findAllReviews() {
    const reviews = await ReviewRepository.findAll();
    if (!reviews) throw new AppError("No reviews found", 404);

    return reviews;
  }

  async findById(id) {
    const review = await ReviewRepository.findById(id);
    if (!review) throw new AppError("No review found with this id", 400);
    return review;
  }

  async createReview(customerId, productId, content, rating) {
    const hasPurchased = await UserProductRepository.findOne(
      customerId,
      productId
    );

    if (!hasPurchased)
      throw new AppError("You must purchase the product before reviewing", 403);

    const newReview = await ReviewRepository.create({
      customerId,
      productId,
      content,
      rating,
    });

    return newReview;
  }

  async updateReview(reviewId, customerId, productId, updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new AppError("No update data provided", 400);
    }

    const review = await ReviewRepository.findByReviewAndProduct(
      reviewId,
      productId
    );
    if (!review) throw new AppError("No matching review found", 400);

    if (review.customerId.toString() !== customerId.toString())
      throw new AppError("You are NOT authorized to edit this review", 403);

    // Prevent rating modification after 24 hours
    if (updateData.rating && Date.now() - review.createdAt > 86400000) {
      throw new AppError("Rating cannot be modified after 24 hours", 400);
    }

    return await ReviewRepository.updateById(reviewId, updateData);
  }

  async deleteReview(reviewId, customerId, productId, isAdmin) {
    const review = await ReviewRepository.findByReviewAndProduct(
      reviewId,
      productId
    );

    if (!review) throw new AppError("Review not found", 404);
    if (!isAdmin && review.customerId.toString() !== customerId.toString()) {
      throw new AppError("Not authorized to delete this review", 403);
    }

    return ReviewRepository.deleteById(reviewId);
  }

  async getProductReviews(productId) {
    return ReviewRepository.getProductReviews(productId);
  }
}

module.exports = new ReviewService();
