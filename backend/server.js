import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import userRoute from "./routes/auth.route.js"
import conversationRoute from './routes/conversation.route.js'
import messageRoute from './routes/message.route.js';
import cors from "cors";
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);


app.use(express.json());
app.use('/api/auth', userRoute)
app.use('/api/conversation', conversationRoute)
app.use('/api/message', messageRoute)
httpServer.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})