module.exports.getMe = (req, res, next) => {
  req.params.userId = req.user.id;
  next();
};
