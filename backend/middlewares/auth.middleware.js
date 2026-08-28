import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

export const isOwnMessage = async (req, res, next) => {
    const messageId = Number(req.params.messageId);
    const userId = req.userId;

    if (isNaN(messageId)) {
        return res.sendStatus(400);
    }

    try {
        const message = await prisma.message.findUnique({
            where: {
                id: messageId
            },
            select: {
                senderId: true
            }
        });

        if (!message) {
            return res.sendStatus(404);
        }

        if (message.senderId !== userId) {
            return res.sendStatus(403);
        }

        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};