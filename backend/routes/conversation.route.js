
import express from "express";
import prisma from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            message: "userId is required",
        });
    }

    if (userId === req.userId) {
        return res.status(400).json({
            message: "You cannot create a conversation with yourself",
        });
    }

    try {
        const otherUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const existingConversation =
            await prisma.conversation.findFirst({
                where: {
                    AND: [
                        {
                            participants: {
                                some: {
                                    userId: req.userId,
                                },
                            },
                        },
                        {
                            participants: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    ],
                },
                include: {
                    participants: true,
                },
            });

        if (existingConversation) {
            return res.status(200).json({
                message: "Conversation already exists",
                conversation: existingConversation,
            });
        }

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        {
                            userId: req.userId,
                        },
                        {
                            userId,
                        },
                    ],
                },
            },
            include: {
                participants: true,
            },
        });

        return res.status(201).json({
            message: "Conversation created",
            conversation,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to create conversation",
        });
    }
});

export default router;