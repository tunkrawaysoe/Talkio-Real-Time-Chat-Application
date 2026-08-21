import { Server } from "socket.io";

let io;

const onlineUserIds = new Set();
export const startSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        console.log("Client has been connected:", socket.id);
        socket.on('online', (userId) => {
            socket.userId = userId
            onlineUserIds.add(userId)
            console.log(Array.from(onlineUserIds))
            io.emit('online', Array.from(onlineUserIds));
        })

        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUserIds.delete(socket.userId)
                io.emit("online", Array.from(onlineUserIds));
            }
        });
    });
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};