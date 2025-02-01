
module.exports.cartAuth = (req, res, next) => {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }


    //if he  has not a token this mean he has not userId
    if (!token) {
        let expirydate=7 * 24 * 60 * 60 * 1000;
        if (!req.cookies.sessionId) {
            // Generate a new session ID
            const sessionId = uuidv4();
            // Set the session ID in a cookie
            res.cookie('sessionId', sessionId, { maxAge:expirydate  });  
            // Initialize an empty cart for the session
        }else{
            //renew session ID
            res.cookie('sessionId', req.cookies.sessionId , { maxAge:expirydate });   
        }

    }

    next();

}