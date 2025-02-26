const express = require("express");
const app = express();
require ("dotenv").config();
require("./conn/conn");

// app.get("/",(req,res) => {
//     res.send("Hello from BookBagaicha");
// })

//creating port
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});