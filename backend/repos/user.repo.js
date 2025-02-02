const User = require("../models/user.model");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");

class UserRepository {
  
  async getAllUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw error;
    }
  }

  //checking rule if manger - > create seller , cashier , clerk , customer
  //check rule if super admin - >manager seller , cashier , clerk , customer


  //change statse

  async getUser(userId) {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) throw new AppError("No user found with this id", 400);
      return user;
    } catch (error) {
      throw error;
    }
  }


  //super admin -- manager
  async createUser(userData) {
    try {
      const { firstName, lastName, email, phoneNumber, password, userType} =
        userData;
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm: password,
        userType,
        phoneNumber,
      });

      return newUser;
    } catch (error) {
      throw error;
    }
  }
  //super admin -- manager
  async updateUser(userId, newData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        { _id: userId },
        newData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) throw new AppError("No user found with this id", 400);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }


  //soft delete
  async deleteUser(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById({ _id: userId }).session(session);
      if (!user) throw new AppError("No user found with this id", 400);

      // Delete User
      await User.findByIdAndDelete({ _id: userId }).session(session);

      // Delete user related stuff

      await session.commitTransaction();
      session.endSession();

      return user;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // the one who own the account
  async updateMe(userId, newData) {
    try {
      if (newData.password || newData.passwordConfirm)
        throw new AppError(
          "This route is not for updating passwords, please use /updateMyPassword",
          400
        );

      const user = await User.findByIdAndUpdate({ _id: userId }, newData, {
        new: true,
        runValidators: true,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteMe(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { isActive: false }
      );
      if (!user) throw new AppError("No user found with this id", 400);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
