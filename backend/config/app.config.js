module.exports.APP_CONFIG = {
  MONGO_DEV_URI: process.env.MONGO_DEV_URI,
  MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME,
  HTTP_PORT: process.env.HTTP_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  // FOR TESTING -> MAILTRAP
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_NAME: process.env.EMAIL_NAME,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // REAL EMAILS -> BREVO
  BREVO_HOST: process.env.BREVO_HOST,
  BREVO_PORT: process.env.BREVO_PORT,
  BREVO_USERNAME: process.env.BREVO_USERNAME,
  BREVO_PASSWORD: process.env.BREVO_PASSWORD,

  //ImageKit
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_ENDPOINT_URL: process.env.IMAGEKIT_ENDPOINT_URL,
  // Successful responses (2xx)
  HTTP_OK: 200, // [delete + [returned ack  data] that is already  returned in the body.] + [get verb + returned data]

  HTTP_CREATED: 201, // post[create new resource] or put [update existing resource]

  HTTP_BAD_REQUEST: 400, // incorrect parameter value

  HTTP_UNAUTHENTICATED: 401, // guest user or is not logged in

  HTTP_UNAUTHORIZED: 403, // you are not authorized

  HTTP_NOT_FOUND: 404, // not found

  HTTP_INTERNAL_SERVER_ERROR: 500,

  SUPPERADMIN: "super_admin",
  ADMIN: "admin",
  CLERK: "clerk",
  CASHIER: "cashier",
  CUSTOMER: "customer",
  SELLER: "seller",

  MAIN_BRANCH_ID:19777,

  COMPANY_ID: "67aa438c2823142f438539c4",
  COMPANY_NAME: "inventory system",

  ONLINE_BRANCH_ID: 10,


  SUPPERADMIN_ID:"67aa438c2823142f438539c1",

  SUCCESS_MESSAGE: "success",

 


  MAX_FILE_SIZE: 2 * 1024 * 1024, // 5KB in bytes 

  UDIAMGE_ID_KEY: "fileId",
  UDIMAGE_URL_KEY: "url",

  UDIAMGE_ID_VALUE: "67a63846432c47641653594a",
  UDIMAGE_URL_VALUE: "https://ik.imagekit.io/ysypur5vc/default_n6o_4prV6.jpg",


  DU_IMAGE_DEFALUT_OBG: {
    "fileId": "67a63846432c47641653594a",
    "url": "https://ik.imagekit.io/ysypur5vc/default_n6o_4prV6.jpg"
  },
  PROFILE_IMAGE_FOLDER: "users",

  /**********************************************************************************************/

  PDIAMGE_ID_KEY: "fileId",
  PDIMAGE_URL_KEY: "url",

  PDIAMGE_ID_KEY: "67a79f83432c47641634dffc",
  PDIAMGE_URL_VALUE: "https://ik.imagekit.io/ysypur5vc/Untitled_azZLiI3tg.jpg",


  DP_IMAGE_DEFALUT_OBG: {
    "fileId": "67a79f83432c47641634dffc",
    "url": "https://ik.imagekit.io/ysypur5vc/Untitled_azZLiI3tg.jpg"
  },

  PRODUCT_IMAGE_FOLDER: "products",

  MAX_IMAGE_COUNT:4,
  /************************************************************************************************/


  COMPANYNAME:"Watchly"
};
