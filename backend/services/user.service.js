const UserRepository = require("../repos/user.repo");
const APP_CONFIG = require("../config/app.config");

class UserService {
  //done ----------------
  async getAllUsers() {
    try {
      return await UserRepository.getAllUsers();
    } catch (err) {
      throw err;
    }
  }

  //done ----------------
  async getUser(userId) {
    try {
      const user = await UserRepository.getUser(userId);
      if (!user) {
        throw new AppError(
          "No user found with this id",
          APP_CONFIG.HTTP_BAD_REQUEST
        );
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  //done ------------------
  async createUser(userData) {
    try {
      return await UserRepository.createUser(userData);
    } catch (err) {
      throw err;
    }
  }

  async updateUser(userId, newData) {
    return await UserRepository.updateUser(userId, newData);
  }

  //done ------------------
  async deleteUser(userId) {
    try {
      const ack = await UserRepository.deleteUser(userId);
      if (!ack.acknowledged) {
        throw new AppError(
          "No user found with this id",
          APP_CONFIG.HTTP_BAD_REQUEST
        );
      }
    } catch (err) {
      throw err;
    }
  }

  //done ------------------
  async activeUser(userId) {
    try {
      const ack = await UserRepository.activeUser(userId);
      if (!ack.acknowledged) {
        throw new AppError(
          "No user found with this id",
          APP_CONFIG.HTTP_BAD_REQUEST
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async updateMe(userId, newData) {
    return await UserRepository.updateMe(userId, newData);
  }

  async deleteMe(userId) {
    return await UserRepository.deleteMe(userId);
  }
}

module.exports = new UserService();
