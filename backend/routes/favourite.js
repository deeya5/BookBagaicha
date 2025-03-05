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
        await User.findByIdAndUpdate(id, { $push : {favourites: bookid} });
        return res.status(200).json({ message: "Book added to Favourites!"});

    } catch(error){
        res.status(500).json({message: "Internal server error"});
    }
});

//delete book from favourite
router.delete("remove-book-to-favourite", authenticateToken, async (req, res) => {
    try{
        const {bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favourites.includes(bookid);
        if(isBookFavourite){
            await User.findByIdAndUpdate(id, { $pull : {favourites: bookid} });
        }
        
        return res.status(200).json({ message: "Book removed from Favourites!"});

    } catch(error){
        res.status(500).json({message: "Internal server error"});
    }
});

//get favourite book from of a user
router.delete("/get-favourite-books", authenticateToken, async (req, res) => {
    try{
        const {bookid, id } = req.headers;
        const userData = await User.findById(id).populate("favourites");
        const favouritebooks = userData.favourites;

        return res.json({ 
            status: "Success",
            data: favouritebooks,
    
        });
    } catch(error){
        res.status(500).json({message: "Internal server error"});
    }
});

module.exports = router;
