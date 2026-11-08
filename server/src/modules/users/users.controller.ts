import type { Request, Response } from 'express'

import prisma from '../../config/prisma.js'
import { updateProfileSchema } from './users.schemas.js'

export const getProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({
            success: false,
            message: 'Требуется авторизация',
        })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
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
                updatedAt: true,
            },
        })

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Пользователь не найден',
            })
            return
        }

        res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        console.error('Get profile error:', error)

        res.status(500).json({
            success: false,
            message: 'Не удалось загрузить профиль',
        })
    }
}

export const updateProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({
            success: false,
            message: 'Требуется авторизация',
        })
        return
    }

    const validation = updateProfileSchema.safeParse(req.body)

    if (!validation.success) {
        res.status(400).json({
            success: false,
            message: 'Некорректные данные профиля',
            errors: validation.error.flatten().fieldErrors,
        })
        return
    }

    const data = validation.data

    try {
        const user = await prisma.user.update({
            where: {
                id: req.userId,
            },
            data: {
                ...(data.firstName !== undefined && {
                    firstName: data.firstName,
                }),

                ...(data.lastName !== undefined && {
                    lastName: data.lastName,
                }),

                ...(data.birthDate !== undefined && {
                    birthDate: data.birthDate === null
                        ? null
                        : new Date(`${data.birthDate}T00:00:00.000Z`),
                }),

                ...(data.city !== undefined && {
                    city: data.city,
                }),

                ...(data.phone !== undefined && {
                    phone: data.phone,
                }),
            },
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
                updatedAt: true,
            },
        })

        res.status(200).json({
            success: true,
            message: 'Профиль успешно обновлён',
            user,
        })
    } catch (error) {
        console.error('Update profile error:', error)

        res.status(500).json({
            success: false,
            message: 'Не удалось обновить профиль',
        })
    }
}