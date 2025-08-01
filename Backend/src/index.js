// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config(
    {
        path: './.env'
    }
);

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server running on port ${process.env.PORT}`)
    })
    app.on("error", (err) => {
        console.log("error",err);
        throw err;
    })
})
.catch((err) => {
    console.log("MongoDB Connection Failed !!! ",err);
})




