const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

//add book to favourite
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
    try{
        const {bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favourites.includes(bookid);
        if(isBookFavourite){
            return res.status(200).json({ message: "Book is already in favourites!"});
        }
        await User.findByIdAndUpdate(id, { $push: {favourites: bookid} });
        return res.status(200).json({ message: "Book added to Favourites!"});

    } catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;