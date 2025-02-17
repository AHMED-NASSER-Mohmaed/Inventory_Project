const UserProductRepository = require("../repos/userProducts.repo");

class UserProductController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Route to retrieve all user products
    this.router.get("/user_products", this.getAll);
    this.router.post("/user_products", this.create);

    // Route to retrieve a specific user product by customerId and productId
    this.router.get("/user_products/:customerId/:productId", this.getOne);
  }
  // GET /user-products
  async getAll(req, res, next) {
    try {
      const products = await UserProductRepository.findAll();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  // GET /user-products/:customerId/:productId
  async getOne(req, res, next) {
    try {
      const { customerId, productId } = req.params;
      const product = await UserProductRepository.findOne(
        customerId,
        productId
      );

      if (!product) {
        return res.status(404).json({ message: "User product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  // POST /user-products
  async create(req, res, next) {
    try {
      // Assumes req.body contains the necessary data
      const newUserProduct = await UserProductRepository.create(req.body);
      res.status(201).json(newUserProduct);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserProductController().router;
