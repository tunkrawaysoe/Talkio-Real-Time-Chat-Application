import express from "express";
import { authenticate, isOwnMessage } from "../middlewares/auth.middleware.js";
import prisma from "../lib/prisma.js";
import { getIo } from "../lib/io.js";
const router = express.Router();

router.post("/:conversationId", authenticate, async (req, res) => {
    const senderId = req.userId;
    const conversationId = Number(req.params.conversationId);
    const { content } = req.body;

    if (isNaN(conversationId)) {
        return res.status(400).json({
            message: "conversationId must be a number",
        });
    }

    if (!content?.trim()) {
        return res.status(400).json({
            message: "Message content is required",
        });
    }

    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                participants: true,
            },
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: content.trim(),
            },
        });

        const io = getIo();

        io.to(`conversation:${conversationId}`).emit(
            "new_message",
            message
        );

        for (const participant of conversation.participants) {
            if (participant.userId === senderId) continue;

            const sockets = await io
                .in(`user:${participant.userId}`)
                .fetchSockets();

            const isInConversation = sockets.some((socket) =>
                socket.rooms.has(`conversation:${conversationId}`)
            );

            if (!isInConversation) {
                io.to(`user:${participant.userId}`).emit(
                    "new_message_notification",
                    {
                        conversationId,
                        content: message.content,
                    }
                );
            }
        }

        return res.status(201).json({
            message: "Message sent",
            data: message,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to send message",
        });
    }
});

router.delete("/:messageId", authenticate, isOwnMessage, async (req, res) => {
    const id = Number(req.params.messageId);

    try {
        await prisma.message.delete({
            where: {
                id
            }
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});
export default router;