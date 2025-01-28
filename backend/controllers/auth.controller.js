const express = require("express");
const AuthService = require("../services/auth.service");
const JWT_Manager = require("../utils/jwt.manager");
const catchAsync = require("../utils/catchAsync");
const authMiddleware = require("../middlewares/auth.middleware");
const Email = require("../utils/email");

const authRouter = express.Router();

// Route Handlers
const signup = catchAsync(async (req, res, next) => {
  const newUser = await AuthService.signup(req.body);
  await new Email(newUser).sendWelcome();
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const user = await AuthService.login(req.body);
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await AuthService.updatePassword(req.user.id, req.body);
  createSendToken(user, 200, res);
});

const createSendToken = (user, statusCode, res) => {
  const token = JWT_Manager.signToken(user.id, user.userType);
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

authRouter.use(authMiddleware.protect);
authRouter.patch("/auth/updatePassword", updatePassword);

module.exports = authRouter;
