const express = require("express");
const userService = require("../services/user.service");
const UserMiddleware = require("../middlewares/user.middleware");
const AuthMiddleware = require("../middlewares/auth.middleware");
const catchAsync = require("../utils/catchAsync");
const prot_rest = require("../utils/authMiddlewaresOptions");

const userRouter = express.Router();

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    message: "success",
    results: users.length,
    users,
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUser(req.params.userId);
  res.status(200).json({
    message: "success",
    user,
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const newUser = await userService.createUser(req.body);
  res.status(201).json({
    message: "success",
    newUser,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await userService.updateUser(req.params.userId, req.body);
  res.status(200).json({
    message: "success",
    updatedUser,
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  await userService.deleteUser(req.params.userId);
  res.status(200).json({
    message: "success",
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const updatedUser = await userService.updateMe(req.user.id, req.body);
  res.status(200).json({
    message: "success",
    updatedUser,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await userService.deleteUser(req.user.id);
  res.status(204).json({
    message: "success",
  });
});

// Routes


userRouter.get(
  "/users/me",
  AuthMiddleware.protect,
  UserMiddleware.getMe,
  getUser
);
userRouter.patch("/users/updateMe", AuthMiddleware.protect, updateMe);
userRouter.delete("/users/deleteMe", AuthMiddleware.protect, deleteMe);

userRouter.get("/users", prot_rest("admin", "super_admin"), getAllUsers);
userRouter.post("/users", prot_rest("admin", "super_admin"), createUser);

userRouter
  .route("/users/:userId")
  .get(getUser)
  .patch(prot_rest("admin", "super_admin"), updateUser)
  .delete(prot_rest("admin", "super_admin"), deleteUser);

module.exports = userRouter;
