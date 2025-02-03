const express = require("express");
const cInventoryService = require("../services/cinventory.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");

class CInventoryController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    
    // protected routes: there's a need for authentication
    // this.router.use(AuthMiddleware.protect); // token verification
    this.router.get(
      "/cinventories",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.getAllInventories)
    );

    this.router.get(
      "/cinventories/:inventoryId",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.getInventory)
    );

    this.router.post(
      "/cinventories",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.createInventory)
    );

    this.router
      .route("/cinventories/:inventoryId")
      .patch(
        AuthMiddleware.restrictTo("super_admin", "manager"),
        catchAsync(this.updateInventory)
      );
  }

  async getAllInventories(req, res, next) {
    const inventories = await cInventoryService.getAllInventories();
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      results: inventories.length,
      inventories,
    });
  }

  async getInventory(req, res, next) {
    const inventory = await cInventoryService.getInventoryById(req.params.inventoryId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      inventory,
    });
  }

  async createInventory(req, res, next) {
    const newInventory = await cInventoryService.createInventory(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      newInventory,
    });
  }

  async updateInventory(req, res, next) {
    const updatedInventory = await cInventoryService.updateInventoryById(
      req.params.inventoryId,
      req.body
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      updatedInventory,
    });
  }

  async deleteInventory(req, res, next) {
    await cInventoryService.deleteInventoryById(req.params.inventoryId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
    });
  }
}

module.exports = new CInventoryController().router;