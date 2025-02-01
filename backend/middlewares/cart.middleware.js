/*
module.exports.cartAuth = catchAsync(async (req, res, next) => {

    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
        JWT_Manager.verifyToken(token);
        const decoded = JWT_Manager.decodedToken({ token });
        const currentUser = await UserService.getUser(decoded.payload.id);

        if (!currentUser)
            return next(
                new AppError(
                    "The user belonging to this token does not longer exist",
                    401
                )
            );

        if (currentUser.changedPasswordAfter(decoded.payload.iat)) {
            return next(
                new AppError("User recently changed password! Please log in again.", 401)
            );
        }

        req.user = currentUser;
        res.locals.user = currentUser;

    }


    
    if ( !req.user ) {

        let expirydate = 7 * 24 * 60 * 60 * 1000;

        if (!req.cookies.sessionId) {

            // Generate a new session ID
            const sessionId = uuidv4();


            // Set the session ID in a cookie
            res.cookie('sessionId', sessionId, { maxAge: expirydate });

             
        } else {

            //renew session ID
            res.cookie('sessionId', req.cookies.sessionId, { maxAge: expirydate });
        }

    }

    next();
});*/