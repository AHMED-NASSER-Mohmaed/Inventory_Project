const User = require("../models/user.model");
const AppError = require("../utils/appError");
const { inboxResult, checkIfAttributeExists } = require("../utils/apiFeatures");
const { throttle } = require("lodash");
const { locales } = require("validator/lib/isIBAN");

class UserRepository {

  //checking rule if manger - > create seller , cashier , clerk , customer
  //check rule if super admin - >manager seller , cashier , clerk , customer

  //change statse

  //done -----------------------
  //return user or null , throw an exception.
  async getUser(userId) {
    try {
      return await User.findOne({ _id: userId });
    } catch (error) {
      throw error;
    }
  }

  //done ------------------
  async createUser(userData){
    try {
      return await User.create(userData);
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
          runValidators: true,
        }
      );

      if (!updatedUser)
        throw new AppError("No user found with this id", 400);

      return updatedUser;

    } catch (error) {
      throw error;
    }
  }

  /*
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
  */

  /*
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
  }*/

  //done ------------------
  async deleteUser(userId) {
    try {
      return await User.updateOne({ _id: userId }, { isActive: false });
    } catch (error) {
      throw error;
    }
  }

  //done ------------------
  async activeUser(userId) {
    try {

      //return ack.
      return await User.updateOne({ _id: userId }, { isActive: true });

    } catch (err) {
      throw err;
    }
  }


  //pagination
  async getCustomers(filters, sort, page, limit) {

    console.log(sort);


    try {

      const [results, total] = await Promise.all([
        await User.find(filters)
          .collation({ locale: 'en', strength: 1 })
          .sort(sort)
          .skip((page - 1) * limit) // (starting index = page-1)*limit
          .limit(limit).select("-__v")
        ,

        await User.countDocuments(filters).collation({ locale: 'en', strength: 1 }).exec()

      ]);

      // console.log("from repo", results);

      return inboxResult(results, total, page, limit);

    } catch (err) {
      throw err;
    }
  }


  async updateUserImage(userId, imageInfo) {

    try {

      console.log("image info : ", imageInfo, "from repo");
      return await User.updateOne({ _id: userId }, { $set:{"photo": imageInfo} });
    } catch (err) {
      throw err;
    }

  }


  async isAttributeExists(userId, name, value) {
    return await checkIfAttributeExists(User, userId, name, value);
  }

  async getUserImageId(userId) {

    try {

      return await User.findById({ _id: userId }, { "photo.fileId": 1, "_id": 0 });

    } catch (err) {
      throw err;
    }

  }



}

module.exports = new UserRepository();
