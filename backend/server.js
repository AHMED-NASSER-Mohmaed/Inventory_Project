const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const { APP_CONFIG } = require("./config/app.config");
const app = require("./app");
const port = APP_CONFIG.HTTP_PORT || 5000;

mongoose
  .connect(APP_CONFIG.DATABASE)
  .then(async () => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.error(`Error connecting to the database: ${err}`);
  });

app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});
