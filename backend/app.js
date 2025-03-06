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
// const passport = require("./config/passport");
// const session = require("express-session");
/******************************************************************* */
const { IMAGEKIT_ENDPOINT_URL, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } =
  APP_CONFIG;
/********************************************************************/
const app = express();

/*
const imageKit = require("imagekit");

var imagekit = new imageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_ENDPOINT_URL,
});

// Replace with your image URL
const imageURL = "default_U8x4irZXl.jpg";

// Get file details
imagekit.listFiles({ searchQuery: `name="${imageURL}"` })
    .then(response => {
      console.log("hello");
        if (response.length > 0) {
            console.log("File ID:", response[0].fileId);
        } else {
            console.log("Image not found.");
        }
    })
    .catch(error => {
        console.error("Error fetching file details:", error);
    });
*/

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// Initialize Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

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
