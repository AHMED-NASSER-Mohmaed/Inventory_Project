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
const counter = require("./models/counter.model");
const WorksOn = require("./models/worksOn.model");

 
const { compareSync } = require("bcryptjs");
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

      let superAdmin = {
        _id:APP_CONFIG.SUPPERADMIN_ID,
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

      let mainBranch = {
        _id: '19777',
        type: "main",
        governate: 6,
        registrationNumber: "123-69",
        location: "Elmasoura - Ahmed Maher Street"
      }

      let worksOnObj = {
        employee: APP_CONFIG.SUPPERADMIN_ID,
        type: APP_CONFIG.SUPPERADMIN,
        branch: "19777"
      }
      /*
      let onlineBranch = {
        _id: '0',
        type: "online",
        governate: 1,
        registrationNumber: "123-692",
        location: "Cairo bab-elmoneeb"
      }*/

        if (!await Staff.findOne({ SSN: superAdmin.SSN })) {

          // await Staff.deleteOne({SSN:superAdmin.SSN});
          console.log("super admin created");
          await Staff.create(superAdmin);
  
        }

      
        
      
        
        /*
      await counter.create({ _id: "branch", seq: 3 })
      await branch.create(mainBranch);
      await WorksOn.create(worksOnObj);
      await branch.updateOne({_id:mainBranch._id},{admin:APP_CONFIG.SUPPERADMIN_ID});
      await branch.updateOne({_id:mainBranch._id},{isActive:true});
      */
    

      /*      
      // console.log("delete all",await User.find({userType:"customer"}));
      // console.log("delete all",await User.find({userType:"staff"}));
      // console.log("delete all",await User.find({userType:"seller"}));

      let seller={
        "firstName": "ahmed",
        "lastName": "nasser",
        "email": "ahmed664422@gmail.com",
        "phoneNumber": "01118208958",

        "password":"admin123",
        "passwordConfirm":"admin123",

        "userType": "seller",
        "SSN": "30101101206152",
        "companyName": "inentory system",
        "companyRegistrationNumber": "30-10-15",
        "status": true,
      }

     
      cat={ 
        name:"male",
      }

      const supplier={
        companyRegistrationNumber:"31-21-39",
        phoneNumber:"01018208958",
        email:"mortada@gmail.com",
        companyName:"elzamalek"
      }

      const Dawoodsupplier={
        companyRegistrationNumber:"31-21-32",
        phoneNumber:"01118208958",
        email:"perez@gmail.com",
        companyName:"Madridista"
      }

      if(!await Supplier.findOne({email:supplier.email})){
        console.log(await Supplier.create(supplier));
      }

      if(!await Supplier.findOne({email:Dawoodsupplier.email})){
        console.log(await Supplier.create(Dawoodsupplier));
      }
         
       if(!await Category.findOne({name:cat.name})){
          console.log(await Category.create(cat));
       }
        
       

      // console.log(await Product.deleteOne({_id:"67a75405e18e6927a8c1083e"}))


      //  console.log(await Product.findOneAndUpdate({_id:"67a9225b98300b78c4cbc296"},{"category": "67a92096523f30d9de2d71ea" },{new:true}));

      //  console.log(await Category.deleteMany({"parentCatId":"67a92f7992df3a4b6957625d"}));


      // console.log(await Seller.updateMany({status:false},{$set:{status:0 }}))

      
      // console.log(await Seller.updateMany({status:true},{$set:{status:1 }}))

      // console.log(await Product.collection.drop());
*/
     
      /*
              if(!await Seller.findOne({SSN:seller.SSN})){
                await Seller.create(seller);
                console.log("our seller record inserted");
              }
      
              // console.log(await Seller.updateMany({ photo: APP_CONFIG.DU_IMAGE_DEFALUT_OBG }));
         */
      console.log("App database has connected successfully");
      app.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
        console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
      });


    },
  });


})();
