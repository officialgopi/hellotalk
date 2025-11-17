import express from "express";
import { errorMiddleware } from "./middlewares/error.middlewarre";

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Cookies
import cookieParser from "cookie-parser";

app.use(cookieParser());

//CORS
import cors from "cors";
import { corsOptions } from "./constants/cors.constant";

app.use(cors(corsOptions));

app.get('/api/v1/health',(req,res)=>{
  res.json({
    status:"ok",
    message:"The Server is healthy"
  })
})

//Apis
import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.route";
import adminRouter from "./routes/admin.route";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/admin", adminRouter);

//Error handling middleware
app.use(errorMiddleware);

export default app;
