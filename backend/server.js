import express from "express";
import http from "http";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js"
import conversationRoute from './routes/conversation.route.js'
import messageRoute from './routes/message.route.js';
import userRoute from './routes/user.route.js'
import cors from "cors";
import { startSocketServer } from "./lib/io.js";
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;
startSocketServer(httpServer);


app.use(
    cors({
        origin: "http://localhost:5173",
    })
);
app.use(express.json());
app.use('/api/auth', authRoute)
app.use('/api/conversation', conversationRoute)
app.use('/api/message', messageRoute)
app.use('/api/users', userRoute)

httpServer.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})