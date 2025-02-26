const mongoose = require("mongoose");

const book = new mongoose.Schema({
   url: {
    type: String,
    required: true,
   },
   title: {
    type: String,
    required: true,
   },
   author: {
    type: String,
    required: true,
   },
   genre: {
    type: String,
    required: true,
   },
   desc: {
    type: String,
    required: true,
   },
    
});
module.exports = mongoose.model("book", book);