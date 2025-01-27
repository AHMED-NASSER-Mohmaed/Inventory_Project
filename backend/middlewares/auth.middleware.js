const UserService = require("../services/user.service");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const JWT_Manager = require("../utils/jwt.manager");

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to get access!")
    );
  }

  JWT_Manager.verifyToken(token);
  const decoded = JWT_Manager.decodedToken({ token });
  console.log(decoded);
  const currentUser = await UserService.getUser(decoded.payload.id);
  console.log(currentUser);
  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does not longer exist",
        401
      )
    );

  req.user = currentUser;
  res.locals = currentUser;

  next();
});

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
