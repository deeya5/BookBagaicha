const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");
const logActivity = require("../controllers/activityLog");
const authorizePermissions = require("../middleware/authorizePermissions");
const assignPermissions = require("../config/permissions");

// Updated Signup Route
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
        });
        await newUser.save();

        // Generate token just like in sign-in route
        const authClaims = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        permissions: newUser.permissions
        };


        const token = jwt.sign(authClaims, "bookbagaicha5", { expiresIn: "30d" });

        await logActivity("User signed up", newUser._id, `Email: ${email}`);

        // Return the same data structure as the sign-in route
        return res.status(200).json({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            token
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/sign-in", async (req, res) => {
    try {
        console.log("Received body:", req.body); // 🟡 Add this line to debug

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials - user not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials - password mismatch" });
        }

        const authClaims = {
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role,
            permissions: existingUser.permissions
        };

        const token = jwt.sign(authClaims, "bookbagaicha5", { expiresIn: "30d" });

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

// Profile Routes
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username email");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { username, email, avatar } = req.body;

        // Log the incoming data to confirm avatar is being sent
        console.log("Updating user with data:", { username, email, avatar });

        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email, avatar },
            { new: true, runValidators: true }
        ).select("username email avatar");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Error updating user profile" });
    }
});



router.delete("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Error deleting account" });
    }
});

// Admin: Get all users
router.get("/users", authenticateToken, authorizePermissions("manageUsers"), async (req, res) => {
    try {
        const users = await User.find({}, "username email role");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin: Get total users
router.get("/get-total-users",authenticateToken, authorizePermissions("users"), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.status(200).json({ totalUsers: userCount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user count" });
    }
});

// Admin: Get users by role
router.get("/users/role/:role", authenticateToken, authorizePermissions("manageUsers"), async (req, res) => {
    const { role } = req.params;
    try {
        const users = await User.find({ role });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users by role" });
    }
});

// Route to switch user role between author and reader
router.patch("/switch-role", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      user.role = user.role === "author" ? "user" : "author";
      await user.save();
  
      res.status(200).json({ success: true, role: user.role });
    } catch (err) {
      console.error("Error switching role:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  // Promote user to author
router.put("/become-author", authenticateToken, async (req, res) => {
    try {
      const { id } = req.headers;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.role = "author";
      await user.save();
  
      res.status(200).json({ message: "Role updated to author" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  

module.exports = router;
