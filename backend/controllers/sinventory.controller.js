const express = require("express");
const sInventoryService = require("../services/sinventory.service");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const { APP_CONFIG } = require("../config/app.config");

class SInventoryController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    
    // protected routes: there's a need for authentication
    this.router.use(AuthMiddleware.protect); // token verification
    this.router.get(
      "/sinventories",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.getAllInventories)
    );

    this.router.get(
      "/sinventories/:inventoryId",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.getInventory)
    );

    this.router.post(
      "/sinventories",
      AuthMiddleware.restrictTo("super_admin", "manager"),
      catchAsync(this.createInventory)
    );

    this.router
      .route("/sinventories/:inventoryId")
      .patch(
        AuthMiddleware.restrictTo("super_admin", "manager"),
        catchAsync(this.updateInventory)
      )
      .delete(
        AuthMiddleware.restrictTo("super_admin", "manager"),
        catchAsync(this.deleteInventory)
      );
  }

  async getAllInventories(req, res, next) {
    const inventories = await sInventoryService.getAllInventories();
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      results: inventories.length,
      inventories,
    });
  }

  async getInventory(req, res, next) {
    const inventory = await sInventoryService.getInventoryById(req.params.inventoryId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      inventory,
    });
  }

  async createInventory(req, res, next) {
    const newInventory = await sInventoryService.createInventory(req.body);
    res.status(APP_CONFIG.HTTP_CREATED).json({
      message: "success",
      newInventory,
    });
  }

  async updateInventory(req, res, next) {
    const updatedInventory = await sInventoryService.updateInventoryById(
      req.params.inventoryId,
      req.body
    );
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
      updatedInventory,
    });
  }

  async deleteInventory(req, res, next) {
    await sInventoryService.deleteInventoryById(req.params.inventoryId);
    res.status(APP_CONFIG.HTTP_OK).json({
      message: "success",
    });
  }
}

module.exports = new SInventoryController().router;