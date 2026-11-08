import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'

import prisma from '../../config/prisma.js'
import { loginSchema, registerSchema } from './auth.schemas.js'

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET

    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must contain at least 32 characters')
    }

    return secret
}

const createToken = (userId: string): string => {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

    return jwt.sign(
        { userId },
        getJwtSecret(),
        { expiresIn }
    )
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
        res.status(400).json({
            success: false,
            message: 'Некорректные данные регистрации',
            errors: validation.error.flatten().fieldErrors,
        })
        return
    }

    const email = validation.data.email.toLowerCase()
    const { password } = validation.data

    try {
        const passwordHash = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                balance: true,
                createdAt: true,
            },
        })

        const token = createToken(user.id)

        res.status(201).json({
            success: true,
            message: 'Аккаунт успешно создан',
            token,
            user,
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(409).json({
                success: false,
                message: 'Пользователь с таким email уже существует',
            })
            return
        }

        console.error('Registration error:', error)

        res.status(500).json({
            success: false,
            message: 'Не удалось создать аккаунт',
        })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
        res.status(400).json({
            success: false,
            message: 'Некорректные данные авторизации',
            errors: validation.error.flatten().fieldErrors,
        })
        return
    }

    const email = validation.data.email.toLowerCase()
    const { password } = validation.data

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Неверный email или пароль',
            })
            return
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        )

        if (!passwordMatches) {
            res.status(401).json({
                success: false,
                message: 'Неверный email или пароль',
            })
            return
        }

        const token = createToken(user.id)

        res.json({
            success: true,
            message: 'Авторизация успешна',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                balance: user.balance,
                createdAt: user.createdAt,
            },
        })
    } catch (error) {
        console.error('Login error:', error)

        res.status(500).json({
            success: false,
            message: 'Не удалось выполнить авторизацию',
        })
    }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({
            success: false,
            message: 'Требуется авторизация',
        })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                birthDate: true,
                city: true,
                phone: true,
                balance: true,
                createdAt: true,
            },
        })

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Пользователь не найден',
            })
            return
        }

        res.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error('Profile error:', error)

        res.status(500).json({
            success: false,
            message: 'Не удалось загрузить профиль',
        })
    }
}