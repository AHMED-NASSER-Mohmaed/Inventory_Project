const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const globalErrorHandler = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const { APP_CONFIG } = require("./config/app.config");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");
const session = require("express-session");
/******************************************************************* */

/********************************************************************/
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views/emails"));

app.use(morgan("common"));
app.use(express.json());
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  fileUpload({
    limits: { fileSize: APP_CONFIG.MAX_FILE_SIZE },
    useTempFiles: false,
    preserveExtension: true,
  })
);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact requests per windowMs
  message: "Too many contact attempts from this IP, please try again later",
});

// app.use("/contact", contactLimiter);

// controller registration

const controllersDirPath = path.join(__dirname, "controllers");
const controllersDirectory = fs.readdirSync(controllersDirPath);

for (const controllerFile of controllersDirectory) {
  const controller = require(path.join(controllersDirPath, controllerFile));
  app.use(controller);
}

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
