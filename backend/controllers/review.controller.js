const ReviewService = require("../services/review.service");
const catchAsync = require("../utils/catchAsync");
const AuthMiddleware = require("../middlewares/auth.middleware");
const prot_rest = require("../utils/authMiddlewaresOptions");

class ReviewController {
  constructor() {
    this.router = require("express").Router({ mergeParams: true });
    this.initializeRoutes();
  }

  initializeRoutes() {
    
    this.router.route("/") 
      .get(catchAsync(this.getProductReviews))
      .post(prot_rest("customer"), catchAsync(this.createReview));

    this.router
      .route("/:reviewId")
      .patch(prot_rest("customer"), catchAsync(this.updateReview))
      .delete(
        prot_rest("customer", "admin", "super_admin"),
        catchAsync(this.deleteReview)
      );
  }

  async createReview(req, res, next) {
    const review = await ReviewService.createReview(
      req.user.id,
      req.params.productId,
      req.body.content,
      req.body.rating
    );
    res.status(201).json({
      message: "success",
      review,
    });
  }

  async getProductReviews(req, res, next) {
    const reviews = await ReviewService.getProductReviews(req.params.productId);
    res.status(200).json({
      message: "success",
      results: reviews.length,
      reviews,
    });
  }

  updateReview = async (req, res) => {
    const review = await ReviewService.updateReview(
      req.params.reviewId,
      req.user.id,
      req.params.productId,
      req.body
    );

    res.status(200).json({
      status: "success",
      data: review,
    });
  };

  deleteReview = async (req, res) => {
    await ReviewService.deleteReview(
      req.params.reviewId,
      req.user.id,
      req.params.productId,
      req.user.role === "admin" || req.user.role === "super_admin"
    );

    res.status(204).json({
      status: "success",
      data: null,
    });
  };
}

module.exports = new ReviewController().router;
