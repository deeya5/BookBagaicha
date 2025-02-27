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

    }catch(error){
            res.status(500).json({message: "Internal server error"});
        }
    
});

//Login or Signin
router.post("/sign-in", async (req, res) => {
    try{
        const {username, password}= req.body;

        const existingUser = await User.findOne({username});
        if (!existingUser){
            res.status(400).json({message: "Invalid credentials"});
        }

        await bcrypt.compare(password,existingUser.password, (err, data) => {
            if (data){
                const authClaims = [
                    {name:existingUser.username},
                    {role:existingUser.role },
                ]

                const token = jwt.sign({authClaims},"bookbagaicha5",{
                    expiresIn: "30d",})
                res.status(200).json({
                    id:existingUser.id, 
                    role: existingUser.role, 
                    token: token, });
            }
            else{
                res.status(400).json({message: "Invalid credentials"});
            }
        });

    }catch(error){
            res.status(500).json({message: "Internal server error"});
        }
    
});

//get user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try{
        const { id } = req.headers;
        const data = await User.findById(id).select('-password');
        return res.status(200).json(data);
    } catch(error){
        res.status(500).json({ message: "Internal server error"});
    }
});

module.exports = router;