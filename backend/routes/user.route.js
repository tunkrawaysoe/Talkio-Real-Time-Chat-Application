import express from "express";
import prisma from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({})
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
    }
})

router.get("/search", async (req, res) => {
    const { name } = req.query;

    if (!name?.trim()) {
        return res.status(400).json({
            message: "Username is required",
        });
    }

    try {
        const founduser = await prisma.user.findUnique({
            where: {
                userName: name,
            },
            select: {
                id: true,
                name: true
            }
        });

        if (!founduser) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.status(200).json(founduser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to search user",
        });
    }
});

router.get('/profile', authenticate, async (req, res) => {
    const id = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                userName: true,
                imageUrl: true,
            }
        })
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

router.patch("/profile", authenticate, async (req, res) => {
    const id = req.userId;

    const { name, userName, imageUrl } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id,
            },
            data: {
                ...(name !== undefined && { name }),
                ...(userName !== undefined && { userName }),
                ...(imageUrl !== undefined && { imageUrl }),
            },
            select: {
                id: true,
                name: true,
                userName: true,
                imageUrl: true,
                createdAt: true,
            },

        });

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        return res.status(500).json({
            message: "Failed to update profile",
        });
    }
});
export default router;