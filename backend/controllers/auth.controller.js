const express = require("express");
const AuthService = require("../services/auth.service");
const JWT_Manager = require("../utils/jwt.manager");
const catchAsync = require("../utils/catchAsync");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();

// Route Handlers
const signup = catchAsync( async (req, res, next) => {
  const newUser = await AuthService.signup(req.body);
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const user = await AuthService.login(req.body);
  createSendToken(user, 200, res);
});

const createSendToken = (user, statusCode, res) => {
  const token = JWT_Manager.signToken(user.id, user.role);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Routes
authRouter.post("/auth/signup", signup);
authRouter.post("/auth/login", login);

module.exports = authRouter;
