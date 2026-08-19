import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import userRoute from "./routes/auth.route.js"
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;


app.use(express.json());
app.use('/api/auth', userRoute)

httpServer.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})