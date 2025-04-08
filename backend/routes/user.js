const express = require("express");
const router = express.Router();  // <-- Ensure you have this line
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password, role } = req.body; // ✅ Remove confirmPassword

        // Check username length
        if (username.length < 4) {
            return res.status(400).json({ message: "Username must be at least 4 characters long!" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // Check password length
        if (password.length < 4) {
            return res.status(400).json({ message: "Password too short!" });
        }

        // Hash password
        const hashPass = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashPass,
            role,  // Ensure role is set correctly
        });

        await newUser.save();
        return res.status(200).json({ message: "SignUp Successful" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// SignIn Route
router.post("/sign-in", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const authClaims = { id: existingUser.id, username: existingUser.username, role: existingUser.role };
        const token = jwt.sign(authClaims, "bookbagaicha5", { expiresIn: "30d" });

        return res.status(200).json({
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role,
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username email");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get total users
router.get("/get-total-users", async (req, res) => {
    try {
      const userCount = await User.countDocuments();
      res.status(200).json({ totalUsers: userCount });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user count" });
    }
  });

  router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "username email role"); // Fetch only necessary fields
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

  
// Route to fetch users by role
router.get('/users/role/:role', async (req, res) => {
    const { role } = req.params;
    try {
      const users = await User.find({ role });  // MongoDB query to filter users by role
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users by role' });
    }
  });

// Export the router
module.exports = router;