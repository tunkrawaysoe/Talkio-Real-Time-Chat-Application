import express from "express";
import prisma from "../lib/prisma.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, userName, password } = req.body;

    if (!name || !userName || !password) {
        return res.status(400).json({
            message: "Name, username and password are required",
        });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                userName,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                userName,
                password: hashedPassword,
            },
        });

        return res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/login", async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({
            message: "Username and password are required",
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                userName,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const accessToken = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                userName: user.userName,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
});
export default router;