
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
                name: true,

                participants: {
                    where: {
                        userId: {
                            not: userId,
                        },
                    },
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },

                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        content: true,
                    },
                },
            },
        });

        const formattedConversations = conversations.map((conversation) => ({
            id: conversation.id,
            name: conversation.name,

            participants: conversation.participants.map((participant) => ({
                userId: participant.user.id,
                name: participant.user.name,
                imageUrl: participant.user.imageUrl,
            })),

            lastMessage: conversation.messages[0]
                ? {
                    userId: conversation.messages[0].sender.id,
                    name: conversation.messages[0].sender.name,
                    content: conversation.messages[0].content,
                }
                : null,
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
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true
                            }
                        }
                    },
                },
            },
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }
        const formattedConversations = conversation.messages.map(message => {
            return {
                content: message.content,
                senderId: message.sender.id,
                name: message.sender.name,
                imageUrl: message.sender.imageUrl
            }
        })

        return res.status(200).json(formattedConversations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to get messages",
        });
    }
});
export default router;