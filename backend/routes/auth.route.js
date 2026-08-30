import express from "express";
import prisma from "../lib/prisma.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate } from "../middlewares/auth.middleware.js";
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

        const refreshToken = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            {
                expiresIn: '7d'
            }

        )

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
            },
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                userName: user.userName,
                imageUrl: user.imageUrl
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken)

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found",
        });
    }

    try {
        const refreshTokenRecord = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken,
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        userName: true,
                        imageUrl: true
                    }
                }
            },
        });

        if (!refreshTokenRecord) {
            return res.status(403).json({
                message: "Invalid refresh token",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_TOKEN_SECRET
        );

        if (decoded.userId !== refreshTokenRecord.user.id) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return res.status(200).json({
            accessToken,
            user: refreshTokenRecord.user
        });

    } catch (error) {
        console.error(error);

        return res.status(403).json({
            message: "Invalid or expired refresh token",
        });
    }
});

router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    try {
        if (refreshToken) {
            await prisma.refreshToken.delete({
                where: {
                    token: refreshToken,
                },
            });
        }

        res.clearCookie("refreshToken");

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
export default router;