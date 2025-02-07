const APP_CONFIG = require("../config/app.config");
const AppError = require("../utils/appError");
const userRepo = require("../repos/user.repo");

class UserService {
  
  //done ----------------
  async getUser(userId) {

    try {
      const user = await userRepo.getUser(userId);
      console.log("i'm the logined one :", user)
      if (!user) {
        throw new AppError("No user found with this id", APP_CONFIG.HTTP_BAD_REQUEST);
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  //done ------------------
  async createUser(userData) {
    try {
       return await userRepo.createUser(userData);
    } catch (err) {
      throw err;
    }
  }

  async updateUser(userId, newData) {
    return await userRepo.updateUser(userId, newData);
  }

  async updateUserImage(userId, imageInfo){
    try{
      console.log("from service : ",imageInfo)
      if(userId && imageInfo)
        return await userRepo.updateUserImage(userId,imageInfo);
      
    }catch(err){
      throw err;
    }
  }

  //done ------------------
  async deleteUser(userId) {
    try {
      const ack = await userRepo.deleteUser(userId);
      if (!ack.acknowledged) {
        throw new AppError("No user found with this id", APP_CONFIG.HTTP_BAD_REQUEST);
      }
    } catch (err) {
      throw err;
    }
  }


  //done ------------------
  async activeUser(userId) {
    try {
      const ack = await userRepo.activeUser(userId);
      if (!ack.acknowledged) {
        throw new AppError("No user found with this id", APP_CONFIG.HTTP_BAD_REQUEST);
      }
    } catch (err) {
      throw err;
    }
  }

  //pagination
  async getUsers(data) {
    try {
      return await userRepo.getCustomers(data.filters, data.sort, data.page, data.limit);
    } catch (err) {
      throw err;
    }
  }


  async isAttributeExist(userId,name,value){
    try{
      return await userRepo.isAttributeExists(userId,name,value);
    }catch(err){
      throw err;
    }
  }


  async getUserImageId(userId){
    try{
      const imageId= await userRepo.getUserImageId(userId);

      if(!imageId)
        throw new AppError("User Not Found",APP_CONFIG.HTTP_NOT_FOUND);

      return imageId;
      
    }catch(err){
      throw err;
    }
  }

  
}

module.exports = new UserService();
