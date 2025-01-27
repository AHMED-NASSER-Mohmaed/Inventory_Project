const AuthRepository = require("../repos/auth.repo");

class AuthService {
  async signup(userData) {
    return await AuthRepository.signup(userData);
  }

  async login(userData) {
    return await AuthRepository.login(userData);
  }

  async updatePassword(userId, userData) {
    return await AuthRepository.updatePassword(userId, userData);
  }
}

module.exports = new AuthService();
