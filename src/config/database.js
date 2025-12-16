const mongoose = require("mongoose");

// this url refers to the cluster

const connectDB = async () => {

    await mongoose.connect("mongodb+srv://priya:priya%402718@namastenode.7yndxoo.mongodb.net/devTinder",

    );
};


 
module.exports = connectDB;

