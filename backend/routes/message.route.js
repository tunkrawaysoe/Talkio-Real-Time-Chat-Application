import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import prisma from "../lib/prisma.js";

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
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: content.trim(),
            }
        });

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

export default router;