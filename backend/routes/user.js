const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

//SignUP
router.post("/sign-up", async (req, res) => {
    try{
        const {username, email, password } = req.body;

        //check username length
        if (username.length <4){
           return res
           .status(400)
           .json({message: "Username length should be of atleast 4 characters!"}) 
        }
        //check if username already exists
        const existingUsername = await User.findOne({username: username});
        if (existingUsername){
            return res.status(400).json({message: "Username already exists!"})
        }
        //check if email already exists
        const existingEmail = await User.findOne({email: email});
        if (existingEmail){
            return res.status(400).json({message: "Username already exists!"})
        }
        //check password length
        if (password.length <4){
            return res
            .status(400)
            .json({message: "Password too short!"})
        }

        const hashPass =await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username, 
            email: email,
            password: hashPass,
        });
        await newUser.save();
        return res.status(200).json({message: "SignUP Successful"});

    }catch(error)
    {
            res.status(500).json({message: "Internal server error"});
        }
    
});

//Login or Signin
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
        const authClaims = { name: existingUser.email, role: existingUser.role };
        const token = jwt.sign(authClaims, "bookbagaicha5", { expiresIn: "30d" });

        return res.status(200).json({ id: existingUser.id, role: existingUser.role, token });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;