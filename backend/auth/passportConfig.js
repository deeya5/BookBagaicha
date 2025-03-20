const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); 

// Configure Local Strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user || !user.verifyPassword(password)) {
        return done(null, false, { message: 'Incorrect credentials.' });
      }
      return done(null, user);
    } catch (error) {

      return done(error);
    }
  }
));

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: 348570826422-d2e2vu9aelj6mgoes5ipcvisvl08uhva.apps.googleusercontent.com,
    clientSecret: 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,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
