const express = require("express");
const app = express();
app.use(express.json());
require ("dotenv").config();
require("./conn/conn");
const user = require("./routes/user");
const books = require("./routes/book");
const favourite = require("./routes/favourite");

// app.get("/",(req,res) => {
//     res.send("Hello from BookBagaicha");
// })

//routes
app.use("/api/v1",user);
app.use("/api/v1",books);
app.use("/api/v1",favourite);

//creating port
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});