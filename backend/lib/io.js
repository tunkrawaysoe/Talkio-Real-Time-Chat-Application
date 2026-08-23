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
            io.emit('online', Array.from(onlineUserIds));
            socket.join(`user:${userId}`)
        })
        socket.on('join_conversation', (id) => {
            socket.join(`conversation:${id}`)
        })
        socket.on('leave_conversation', (id) => {
            socket.leave(`conversation:${id}`)
        })
        socket.on("typing", (conversationId) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit("typing", socket.userId);
        });

        socket.on("stop_typing", (conversationId) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit("stop_typing", socket.userId);
        });

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