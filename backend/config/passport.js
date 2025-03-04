/*const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const crypto = require("crypto");
const UserRepository = require("../repos/user.repo");
const { APP_CONFIG } = require("./app.config");

passport.use(
  new GoogleStrategy(
    {
      clientID: APP_CONFIG.GOOGLE_CLIENT_ID,
      clientSecret: APP_CONFIG.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, profile, done) => {
      try {
        // Extract the email from the profile payload
        const email = profile.emails[0].value;
        // Look for an existing user with the same email
        let user = await UserRepository.findByEmail(email);
        if (user) {
          return done(null, user);
        } else {
          // Create a new user if none exists
          user = await UserRepository.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: email,
            // Generate a random password since login is via Google
            password: crypto.randomBytes(16).toString("hex"),
            passwordConfirm: password,
            userType: "customer",
            isEmailVerified: true,
          });

          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserRepository.getUser(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
*/