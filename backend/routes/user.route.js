import express from "express";
import prisma from "../lib/prisma.js";
import { getIo } from "../lib/io.js";
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
export default router;