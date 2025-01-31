// const express = require("express");
// const AuthService = require("../services/auth.service");
// const JWT_Manager = require("../utils/jwt.manager");
// const catchAsync = require("../utils/catchAsync");
// const authMiddleware = require("../middlewares/auth.middleware");

// const authRouter = express.Router();

// // Route Handlers
// const signup = catchAsync(async (req, res, next) => {
//   const newUser = await AuthService.signup(req.body);
//   createSendToken(newUser, 201, res);
// });

// const login = catchAsync(async (req, res, next) => {
//   const user = await AuthService.login(req.body);
//   createSendToken(user, 200, res);
// });

// const updatePassword = catchAsync(async (req, res, next) => {
//   const user = await AuthService.updatePassword(req.user.id, req.body);
//   createSendToken(user, 200, res);
// });

// const forgotPassword = catchAsync(async (req, res, next) => {
//   await AuthService.forgotPassword(req.body.email);

//   res.status(200).json({
//     status: "success",
//     message: "Code sent to email!",
//   });
// });

// const verifyResetCode = catchAsync(async (req, res, next) => {
//   const resetToken = await AuthService.verifyResetCode(req.body.code);

//   res.status(200).json({
//     status: "success",
//     resetToken,
//   });
// });

// const resetPassword = catchAsync(async (req, res, next) => {
//   const user = await AuthService.resetPassword(req.params.token, req.body);
//   createSendToken(user, 200, res);
// });

// const createSendToken = (user, statusCode, res) => {
//   const token = JWT_Manager.signToken(user.id, user.userType);
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: "success",
//     token,
//     data: {
//       user,
//     },
//   });
// };

// // Routes
// authRouter.post("/auth/signup", signup);
// authRouter.post("/auth/login", login);
// authRouter.post("/auth/forgotPassword", forgotPassword);
// authRouter.post("/auth/verifyResetCode", verifyResetCode);
// authRouter.post("/auth/resetPassword/:token", resetPassword);

// authRouter.use(authMiddleware.protect);
// authRouter.patch("/auth/updatePassword", updatePassword);

// module.exports = authRouter;

// controllers/auth.controller.js
const catchAsync = require("../utils/catchAsync");
const AuthService = require("../services/auth.service");
const authMiddleware = require("../middlewares/auth.middleware");
const JWT_Manager = require("../utils/jwt.manager");

const express = require("express");

const authRouter = express.Router();

const signup = catchAsync(async (req, res) => {
  const newUser = await AuthService.signup(req.body);
  createSendToken(newUser, 201, res);
});
const login = catchAsync(async (req, res) => {
  const user = await AuthService.login(req.body.email, req.body.password);
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

authRouter.use(authMiddleware.protect);
authRouter.patch("/auth/updatePassword", updatePassword);

module.exports = authRouter;
