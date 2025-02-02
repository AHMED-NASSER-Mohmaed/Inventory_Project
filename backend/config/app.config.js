module.exports.APP_CONFIG = {
  MONGO_DEV_URI: process.env.MONGO_DEV_URI,
  MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME,
  HTTP_PORT: process.env.HTTP_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_NAME: process.env.EMAIL_NAME,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Successful responses (2xx)
  HTTP_OK: 200, // [delete + [returned ack  data] that is already  returned in the body.] + [get verb + returned data]

  HTTP_CREATED: 201, // post[create new resource] or put [update existing resource]

  HTTP_BAD_REQUEST: 400, // incorrect parameter value

  HTTP_UNAUTHENTICATED: 401, // guest user or is not logged in

  HTTP_UNAUTHORIZED: 403, // you are not authorized

  HTTP_NOT_FOUND: 404, // not found

  HTTP_INTERNAL_SERVER_ERROR: 500,

  SUPPERADMIN:"supper_admin",
  ADMIN:"admin",
  CLERK:"clerk",
  CASHIER:"cashier",
  CUSTOMER:"customer",
  SELLER:"seller",

  COMPANY_ID:"679fb5a90cb8f1f8fca97990",
  COMPANY_NAME:"inentory system"
  
};
