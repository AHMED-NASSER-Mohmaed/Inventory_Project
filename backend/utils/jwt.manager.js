const jwt = require("jsonwebtoken");
const { APP_CONFIG } = require("../config/app.config");

module.exports.signToken = (id, userType) => {
  return jwt.sign({ id, userType }, APP_CONFIG.JWT_SECRET, {
    expiresIn: APP_CONFIG.JWT_EXPIRES_IN,
  });
};

module.exports.verifyToken = (token) => {
  return jwt.verify(token, APP_CONFIG.JWT_SECRET);
};

module.exports.decodedToken = ({ token }) => {
  return jwt.decode(token, { complete: true });
};
