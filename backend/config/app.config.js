module.exports.APP_CONFIG = {
  MONGO_DEV_URI: process.env.MONGO_DEV_URI,
  MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME,
  HTTP_PORT: process.env.HTTP_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
 
  // Successful responses (2xx)
  HTTP_OK : 200 , // [delete + [returned ack  data] that is alreary  returned in the body.] + [get verb +reterned data]


  HTTP_CREATED : 201 ,  // post[create new resource] or put [update existing resource]


  HTTP_BAD_REQUEST : 400, // incorrect parameter value

  HTTP_UNAUTHENTICATED : 401, // guest user or dose not loggined 

  HTTP_UNAUTHORIZED : 403 , // you are not authorized 

  HTTP_NOT_FOUND : 404 ,// not founed

  HTTP_INTERNAL_SERVER_ERROR : 500,


};
