import express, { urlencoded } from "express";
import dotenv from "dotenv"
import {connectPassport} from "./utils/Provider.js"
import session from "express-session"
import passport from "passport"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user.js"
import orderRoute from "./routes/order.js"
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cors from "cors"

const app = express();
export default app


dotenv.config({
    path:"./config/config.env",
});
dotenv.config()
connectPassport();
// Using Middleware
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure: process.env.NODE_ENV === 'development' ? true : false,
        httpOnly:process.env.NODE_ENV === 'development' ? true : false,
        sameSite:process.env.NODE_ENV === 'development' ? true : "none", 
    }
}))

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    method: ['GET','POST','PUT','DELETE'],
}));

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.enable("trust proxy")


app.use(express.json())
app.use(urlencoded({ 
    extended: true
}))

app.use(cookieParser())


// Importing Routes

app.use("/api/v1",userRoute);

app.use("/api/v1",orderRoute);
//Using ErrorMiddleware

app.use(errorMiddleware);