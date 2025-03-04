const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const { APP_CONFIG } = require("./config/app.config");
const { DATABASE } = require("./database/mongo/index");
const app = require("./app");
const Staff = require("./models/staff.model");

const Seller = require("./models/seller.model");

const Category = require("./models/category.model");

const Supplier = require("./models/supplier.model");
const User = require("./models/user.model");
const Product = require("./models/product.model");
const branch = require("./models/branch.model");


const { compareSync } = require("bcryptjs");
const { Brand } = require("./models/brand.model");
const port = APP_CONFIG.HTTP_PORT || 5000;


process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err);
  process.exit(1);
});

(async function () {
  await DATABASE.connectToMongo({
    dbOptions: {
      url: APP_CONFIG.MONGO_DEV_URI,
      databaseName: APP_CONFIG.MONGO_DATABASE_NAME,
    },


    callback: async () => {

      // console.log(await Product.collection.drop());
      /*******************************************************************************************/
      let superAdmin = {
        _id: APP_CONFIG.SUPPERADMIN_ID,
        firstName: "ahmed",
        lastName: "nasser",
        email: "AhmedNasser@gmail.com",
        phoneNumber: "01062303884",
        password: "onlyonewhocanregister",
        passwordConfirm: "onlyonewhocanregister",
        userType: "staff",
        SSN: "30101101206161",
        role: "super_admin",
      }
      if (!await Staff.findOne({ SSN: superAdmin.SSN })) {

        // await Staff.deleteOne({SSN:superAdmin.SSN});
        console.log("super admin created");
        await Staff.create(superAdmin);

      }
      /*******************************************************************************************/

      let mainBranch = {
        "_id": APP_CONFIG.MAIN_BRANCH_ID,
        type: "main",
        governate: 6,
        registrationNumber: "123-69",
        admin: APP_CONFIG.SUPPERADMIN_ID,
        location: "Elmasoura - Ahmed Maher Street",
        isActive:true,
      }

      await branch.findOneAndUpdate(
        { _id: APP_CONFIG.MAIN_BRANCH_ID }, // Search condition
        { $setOnInsert: mainBranch }, // Insert only if not found
        { upsert: true, new: true }
      );
      /*******************************************************************************************/
      let onlineBranch = {
        _id: APP_CONFIG.ONLINE_BRANCH_ID,
        type: "online",
        governate: 1,
        registrationNumber: "123-692",
        location: "Online",
        isActive:true,
      }

      await branch.findOneAndUpdate(

        { _id: APP_CONFIG.ONLINE_BRANCH_ID }, // Search condition
        { $setOnInsert: onlineBranch }, // Insert only if not found
        { upsert: true, new: true }
      );

      /*******************************************************************************************/


      /*******************************************************************************************/
      let seller = {
        "_id": APP_CONFIG.COMPANY_ID,
        "firstName": "ahmed",
        "lastName": "nasser",
        "email": "ahmed664422@gmail.com",
        "phoneNumber": "01118208958",

        "password": "admin123",
        "passwordConfirm": "admin123",

        "userType": "seller",
        "SSN": "30101101206152",
        "companyName": APP_CONFIG.COMPANYNAME,
        "companyRegistrationNumber": "30-10-15",
        "status": true,
      }

      if (!await Seller.findOne({ SSN: seller.SSN })) {
        await Seller.create(seller);
        console.log("our seller record inserted");
      }
      /*******************************************************************************************/
      let cat1 = {
        "_id": APP_CONFIG.MALE_CAT_ID,
        "Cname": "male",
      }
      await Category.findOneAndUpdate(
        { Cname: cat1.Cname }, // Search condition
        { $setOnInsert: cat1 }, // Insert only if not found
        { upsert: true, new: true }
      );
      /*******************************************************************************************/

      let cat2 = {
        "_id": APP_CONFIG.FEMALE_CAT_ID,
        "Cname": "female"
      }
      await Category.findOneAndUpdate(
        { Cname: cat2.Cname }, // Search condition
        { $setOnInsert: cat2 }, // Insert only if not found
        { upsert: true, new: true }
      );

      /*******************************************************************************************/



      const supplier = {
        companyRegistrationNumber: "31-21-39",
        phoneNumber: "01018208958",
        email: "mortada@gmail.com",
        companyName: "elzamalek"
      }

      const Dawoodsupplier = {
        companyRegistrationNumber: "31-21-32",
        phoneNumber: "01118208958",
        email: "perez@gmail.com",
        companyName: "Madridista"
      }

      if (!await Supplier.findOne({ email: supplier.email })) {
        console.log(await Supplier.create(supplier));
      }
      

      if (!await Supplier.findOne({ email: Dawoodsupplier.email })) {
        console.log(await Supplier.create(Dawoodsupplier));
      }

      let brand = {
        "Bname": "casio"
      }

      await Brand.findOneAndUpdate(
        { Bname: brand.Bname }, // Search condition
        { $setOnInsert: brand }, // Insert only if not found
        { upsert: true, new: true }
      );

       











      // console.log(await Seller.updateMany({ photo: APP_CONFIG.DU_IMAGE_DEFALUT_OBG }));

      console.log("App database has connected successfully");
      app.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
        console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
      });


    },
  });


})();
