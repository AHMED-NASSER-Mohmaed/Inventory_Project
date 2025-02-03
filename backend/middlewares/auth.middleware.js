const UserService = require("../services/user.service");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const JWT_Manager = require("../utils/jwt.manager");

module.exports.
protect = catchAsync(async (req, res, next) => {
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
  const currentUser = await UserService.getUser(decoded.payload.id);
  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does not longer exist",
        401
      )
    );

  if (currentUser.changedPasswordAfter(decoded.payload.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});


 
module.exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    //userType , role  
    userTypes = userTypes.flat();
    console.log(userTypes);
    if ( !userTypes.includes(req.user.userType) && !userTypes.includes(req.user.role) ) { // to be reviewed
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

};
