const router = require("express").Router();
const User = require("./models/user");
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
        if (existingUsername){
            return res.status(400).json({message: "Username already exists!"})
        }
        //check if email already exists
        if (existingEmail){
            return res.status(400).json({message: "Username already exists!"})
        }
        //check if password length
        if (password.length <4){
            return res
            .status(400)
            .json({message: "Password too short!"})
        }
    }catch(error){
            res.status(500).json({message: "INternal server error"});
        }
    
});

module.exports = router;