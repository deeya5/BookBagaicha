const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");
const logActivity = require("../controllers/activityLog");
const authorizePermissions = require("../middleware/authorizePermissions");
const rolesPermissions = require("../config/permissions");

// Sign Up
router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (username.length < 4) {
            return res.status(400).json({ message: "Username must be at least 4 characters long!" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        if (password.length < 4) {
            return res.status(400).json({ message: "Password too short!" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashPass,
            role,
            permissions: Object.keys(rolesPermissions[role] || {}).flatMap(key => rolesPermissions[role][key])
          });
        await newUser.save();

        // Log activity
        await logActivity("User signed up", newUser._id, `Email: ${email}`);

        return res.status(200).json({ message: "SignUp Successful" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Sign In
router.post("/sign-in", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const authClaims = { id: existingUser.id, username: existingUser.username, role: existingUser.role };
        const token = jwt.sign(authClaims, "bookbagaicha5", { expiresIn: "30d" });

        // Log activity
        await logActivity("User logged in", existingUser._id, `Email: ${email}`);

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

// Profile Route
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

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "username email role");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get users by role
router.get('/users/role/:role', async (req, res) => {
    const { role } = req.params;
    try {
        const users = await User.find({ role });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users by role' });
    }
});

// Secure admin-only route with specific permissions
router.get("/users", authenticateToken, authorizePermissions("manageUsers"), async (req, res) => {
    try {
        const users = await User.find({}, "username email role");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-total-users", authenticateToken, authorizePermissions("manageUsers"), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.status(200).json({ totalUsers: userCount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user count" });
    }
});

router.get("/users/role/:role", authenticateToken, authorizePermissions("manageUsers"), async (req, res) => {
    const { role } = req.params;
    try {
        const users = await User.find({ role });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users by role' });
    }
});

module.exports = router;