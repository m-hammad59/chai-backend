// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"

import connectDB from "./db/index.js";



dotenv.config({
    path: './env'
})


connectDB()


















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