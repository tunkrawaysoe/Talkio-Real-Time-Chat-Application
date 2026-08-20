
import express from "express";
import prisma from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.middleware.js";

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
            where: { id: userId },
            select: { id: true },
        });

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: { userId: req.userId },
                        },
                    },
                    {
                        participants: {
                            some: { userId },
                        },
                    },
                ],
            },
            select: {
                id: true,
                createdAt: true,
                participants: {
                    select: {
                        userId: true,
                        joinedAt: true,
                    },
                },
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
                        { userId: req.userId },
                        { userId },
                    ],
                },
            },
            select: {
                id: true,
                createdAt: true,
                participants: {
                    select: {
                        userId: true,
                        joinedAt: true,
                    },
                },
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

router.get("/", authenticate, async (req, res) => {
    const userId = req.userId;

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            select: {
                id: true,
                participants: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                messages: {
                    select: {
                        content: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedConversations = conversations.map((conversation) => ({
            ...conversation,
            participants: conversation.participants.map(participant => (
                {
                    userId: participant.user.id,
                    name: participant.user.name
                }
            )),
            messages: conversation.messages.map((message) => ({
                userId: message.sender.id,
                name: message.sender.name,
                content: message.content,
            })),
        }));

        return res.status(200).json(formattedConversations);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to get conversations",
        });
    }
});

router.get("/:conversationId", async (req, res) => {
    const id = Number(req.params.conversationId);

    if (isNaN(id)) {
        return res.status(400).json({
            message: "Conversation ID must be a number",
        });
    }

    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id,
            },
            select: {
                messages: {
                    select: {
                        content: true,
                        senderId: true,
                    },
                },
            },
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        const formattedConversation = conversation.messages.map((message) => ({
            userId: message.senderId,
            content: message.content,
        }));

        return res.status(200).json(formattedConversation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to get messages",
        });
    }
});
export default router;