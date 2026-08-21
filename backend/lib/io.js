import { Server } from "socket.io";

let io;

export const startSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        console.log("Client has been connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client has been disconnected:", socket.id);
        });
    });
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};