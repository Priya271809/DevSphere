// console.log("Starting a new project!!")
const express = require('express');
const app = express();

// this is a "/" route
app.use("/", (req, res) => {
    res.send("Namaste akshay!");
})

// this is a "/hello" route
app.use("/hello", (req, res) => {
    res.send("Hello  hello hello!!!");
})

// request handler kehte h 
// this is a "/test" route
app.use("/test", (req,res) => {
   res.send("Hello from the server!!")
})


app.listen(3000, ()=>{
    console.log("Server is successfully listening on port 3000...");
});

