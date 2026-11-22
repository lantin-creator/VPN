import { Request, Response } from 'express'
import prisma from '../../config/prisma.js'
import { transactionsQuerySchema } from './balance.schemas.js'
import { Prisma } from '@prisma/client'
import { topUpSchema } from './balance.schemas.js'

export const getBalance = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                balance: true,
                frozenBalance: true,
            },
        })

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            })
            return
        }

        res.json({
            success: true,
            data: {
                balance: user.balance,
                frozenBalance: user.frozenBalance,
                availableBalance: user.balance - user.frozenBalance,
            },
        })
    } catch (error) {
        console.error('Get balance error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get balance',
        })
    }
}

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        const validation = transactionsQuerySchema.safeParse(req.query)

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.error.flatten(),
            })
            return
        }

        const { page, limit } = validation.data
        const skip = (page - 1) * limit

        const [transactions, total] = await prisma.$transaction([
            prisma.balanceTransaction.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    reservationId: true,
                    createdAt: true,
                },
            }),

            prisma.balanceTransaction.count({
                where: {
                    userId,
                },
            }),
        ])

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        })
    } catch (error) {
        console.error('Get transactions error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
        })
    }
}

export const topUpBalance = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const validation = topUpSchema.safeParse(req.body)

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid top-up data',
                errors: validation.error.flatten(),
            })
            return
        }

        const { amount, idempotencyKey } = validation.data

        const existingTransaction = await prisma.balanceTransaction.findUnique({
            where: { idempotencyKey },
        })

        if (existingTransaction) {
            if (
                existingTransaction.userId !== userId ||
                existingTransaction.amount !== amount ||
                existingTransaction.type !== 'TOP_UP'
            ) {
                res.status(409).json({
                    success: false,
                    message: 'Idempotency key has already been used',
                })
                return
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    balance: true,
                    frozenBalance: true,
                },
            })

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                })
                return
            }

            res.json({
                success: true,
                message: 'Top-up was already processed',
                data: {
                    balance: user.balance,
                    frozenBalance: user.frozenBalance,
                    availableBalance: user.balance - user.frozenBalance,
                    transactionId: existingTransaction.id,
                    alreadyProcessed: true,
                },
            })
            return
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
                select: {
                    balance: true,
                    frozenBalance: true,
                },
            })

            const transaction = await tx.balanceTransaction.create({
                data: {
                    userId,
                    type: 'TOP_UP',
                    amount,
                    idempotencyKey,
                    description: 'Demo balance top-up',
                },
                select: {
                    id: true,
                    amount: true,
                    type: true,
                    createdAt: true,
                },
            })

            return { user, transaction }
        })

        res.status(201).json({
            success: true,
            message: 'Balance topped up successfully',
            data: {
                balance: result.user.balance,
                frozenBalance: result.user.frozenBalance,
                availableBalance:
                    result.user.balance - result.user.frozenBalance,
                transaction: result.transaction,
                alreadyProcessed: false,
            },
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(409).json({
                success: false,
                message: 'This top-up request has already been processed',
            })
            return
        }

        console.error('Top-up balance error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to top up balance',
        })
    }
}