import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true})) // used to add in space
app.use(express.static("public")) //
app.use(cookieParser()) // to perform crud and make it secure


// routes import
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)


export { app };