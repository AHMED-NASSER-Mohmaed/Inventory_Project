// controllers/auth.controller.js
const catchAsync = require("../utils/catchAsync");
const AuthService = require("../services/auth.service");
const authMiddleware = require("../middlewares/auth.middleware");
const JWT_Manager = require("../utils/jwt.manager");

const express = require("express");

const authRouter = express.Router();

const signup = catchAsync(async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const newUser = await AuthService.signup(req.body, baseUrl);
  createSendToken(newUser, 201, res);
});
const login = catchAsync(async (req, res) => {
  console.log("hello", req.body);
  const user = await AuthService.login(req.body.email, req.body.password);
  console.log(user);
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res) => {
  const user = await AuthService.updatePassword(
    req.user.id,
    req.body.passwordCurrent,
    req.body.password,
    req.body.passwordConfirm
  );
  createSendToken(user, 200, res);
});

const forgotPassword = catchAsync(async (req, res) => {
  await AuthService.forgotPassword(req.body.email);
  res.status(200).json({ status: "success", message: "Reset code sent" });
});

const verifyResetCode = catchAsync(async (req, res) => {
  const token = await AuthService.verifyResetCode(req.body.code);
  res.status(200).json({ status: "success", token });
});

const resetPassword = catchAsync(async (req, res) => {
  const user = await AuthService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm
  );
  createSendToken(user, 200, res);
});

const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  await AuthService.resendVerificationEmail(req.body.email, baseUrl);

  res.status(200).json({
    status: "success",
    message: "Verification email resent successfully.",
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const result = await AuthService.verifyEmail(req.params.token);

  switch (result.status) {
    case "invalid_token":
      return res.render("verifyFail");

    case "already_verified":
      return res.status(200).json({
        status: "success",
        message:
          "Your email address has already been verified. You can log in.",
      });

    case "verified":
      return res.render("verifySuccess");

    default:
      return next(new AppError("Unexpected verification result", 500));
  }
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
authRouter.post("/auth/forgotPassword", forgotPassword);
authRouter.post("/auth/verifyResetCode", verifyResetCode);
authRouter.post("/auth/resetPassword/:token", resetPassword);

authRouter.patch(
  "/auth/updatePassword",
  authMiddleware.protect,
  updatePassword
);

authRouter.get("/auth/verifyEmail/:token", verifyEmail);
authRouter.post(
  "/auth/resendVerificationEmail",
  authMiddleware.protect,
  resendVerificationEmail
);

module.exports = authRouter;
