const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const globalErrorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(morgan("common"));
app.use(express.json());

// controller registration
const controllersDirPath = path.join(__dirname, "controllers");
const controllersDirectory = fs.readdirSync(controllersDirPath);

for (const controllerFile of controllersDirectory) {
  const controller = require(path.join(controllersDirPath, controllerFile));
  app.use(controller);
}

app.use(globalErrorHandler);

module.exports = app;
