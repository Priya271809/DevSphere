// console.log("Starting a new project!!")
const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signup", async (_req, _res) => {
    // creating  a new instance of the user model
    const user = new User({
        firstName : "Priya",
        lastName : "patil",
        emailId : "patilpriya@gmail.com",
        password: "priya@2718"
    });

    try{
await user.save();
   _res.send("User Added successfully");
    } catch (error){
        _res.status(400).send("Error saving the user:" + error.message);
    }
   
});


connectDB()
.then(() => {
console.log("Database connection established...");
  app.listen(7777, ()=>{
    console.log("Server is successfully listening on port 7777...");
});
})
.catch ((_error) => {
console.log("Database cannot be connected..");
});



  





