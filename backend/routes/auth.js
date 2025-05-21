const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const router = express.Router();

// Configure session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Initialize Passport
router.use(passport.initialize());
router.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || "http://localhost:1000"}/api/auth/google/callback`,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by Google ID or email
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (!user) {
          // Create new user if not found
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || "",
            authProvider: "google"
          });
          await user.save();
          console.log("New user created:", user.email);
        } else if (!user.googleId) {
          // If user exists with same email but no Google ID, update their profile
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          await user.save();
          console.log("Existing user updated with Google ID:", user.email);
        } else {
          console.log("Existing user logging in:", user.email);
        }
        
        return done(null, user);
      } catch (err) {
        console.error("Error in Google auth strategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET environment variable not set!");
  }
  
  return jwt.sign(
    { 
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || "your-jwt-secret",
    { expiresIn: "7d" }
  );
};

// Google Auth Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=google_auth_failed`,
    session: true
  }),
  (req, res) => {
    try {
      // Generate token
      const token = generateToken(req.user);
      
      // Ensure the user object is available
      if (!req.user) {
        console.error("User object not available in callback");
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=user_not_found`);
      }

      // Store token in a cookie as well (helpful for some frontend setups)
      res.cookie('auth_token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Encode user details for URL safety
      const encodedUsername = encodeURIComponent(req.user.username || '');
      const encodedAvatar = encodeURIComponent(req.user.avatar || '');
      const userId = req.user._id;
      
      // Redirect to frontend with token and user details
      const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
      const redirectURL = `${clientURL}?token=${token}&userId=${userId}&username=${encodedUsername}&avatar=${encodedAvatar}&auth=success`;
      
      console.log("Redirecting user to:", clientURL);
      res.redirect(redirectURL);
    } catch (error) {
      console.error("Error in Google auth callback:", error);
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=authentication_failed`);
    }
  }
);

// Verify Token and Get User Route
router.get("/verify-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  
  if (!token) {
    return res.status(401).json({ authenticated: false, message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ authenticated: false, message: "User not found" });
    }
    
    return res.status(200).json({ 
      authenticated: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ authenticated: false, message: "Invalid token" });
  }
});

// Auth Status Check
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      isLoggedIn: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role || 'user'
      }
    });
  }
  return res.status(200).json({ isLoggedIn: false });
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    
    // Clear the auth cookie
    res.clearCookie('auth_token');
    
    res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
  });
});

module.exports = router;