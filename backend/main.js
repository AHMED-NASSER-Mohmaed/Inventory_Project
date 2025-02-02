const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const { APP_CONFIG } = require("./config/app.config");
const { DATABASE } = require("./database/mongo/index");
const app = require("./app");
const Staff =require("./models/staff.model");

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

        let superAdmin={
          firstName:"ahmed",
          lastName:"nasser",
          email:"ahme664422@gmail.com",
          phoneNumber:"01018208958",
          password:"admin123",
          passwordConfirm:"admin123",
          userType:"staff",
          SSN:"30101101206152",
          role:"super_admin",
        }
      
        
        
        if( !await Staff.findOne({SSN:superAdmin.SSN}) ){
          console.log("super admin created");
          await Staff.create(superAdmin);
        }
      
      console.log("App database has connected successfully");
      app.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
        console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
      });

      
    },
  });

 
})();
