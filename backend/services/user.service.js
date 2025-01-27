const UserRepository = require("../repos/user.repo");

class UserService {
  async getAllUsers() {
    return await UserRepository.getAllUsers();
  }

  async getUser(userId) {
    return await UserRepository.getUser(userId);
  }

  async createUser(userData) {
    return await UserRepository.createUser(userData);
  }

  async updateUser(userId, newData) {
    return await UserRepository.updateUser(userId, newData);
  }

  async deleteUser(userId) {
    return await UserRepository.deleteUser(userId);
  }

  async updateMe(userId, newData) {
    return await UserRepository.updateMe(userId, newData);
  }

  async deleteMe(userId) {
    return await UserRepository.deleteMe(userId);
  }
}

module.exports = new UserService();
