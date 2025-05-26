// require('dotenv').config({path:'./env'})

import { app } from "./app.js";

import dotenv from "dotenv"

import connectDB from "./db/index.js";



dotenv.config({
    path: './env'
})


connectDB()

.then(() => {
    app.on("error", (error) => {
      console.error("App encountered an error:", error);
      throw error;
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })

.catch((err) =>{
    console.log("MONGO DB connection failed !!! ", err);
    
})




















// ***********1st way to connect database with express js***************


// import mongoose, { connect } from "mongoose";
// import { DB_NAME } from "./constants"

// import express from "express"

// const app = express()

// ( async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (error) => {
//         console.log("ERROR: ", error);
//         throw error
//        })

//        app.listen(process.env.PORT, () => {
//         console.log(`app is listening at ${process.env.PORT}`);
        
//        })

//     } catch (error) {
//         console.log("ERROR: ", error);
//         throw err
//     }
// }) ()