const authService = require("../services/auth.service");

class AuthController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }
  initializeRoutes() {}
}

module.exports = new AuthController().router;
