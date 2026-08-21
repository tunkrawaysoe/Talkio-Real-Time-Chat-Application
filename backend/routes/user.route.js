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

export default router;