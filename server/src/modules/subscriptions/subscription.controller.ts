import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { randomBytes } from 'node:crypto'

import prisma from '../../config/prisma.js'
import {
    createReservationSchema,
    reservationIdSchema,
    reservationsQuerySchema,
    subscriptionIdSchema,
} from './subscription.schemas.js'
import {
    SUBSCRIPTION_PRICES,
    SUBSCRIPTION_DURATIONS,
    RESERVATION_DURATION_MINUTES,
} from './subscription.config.js'


const generateVpnKey = () => {
    const raw = randomBytes(10).toString('hex').toUpperCase()
    const groups = raw.match(/.{1,4}/g) ?? []
    return `RVPN-${groups.join('-')}`
}

export const createReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const validation = createReservationSchema.safeParse(req.body)

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid reservation data',
                errors: validation.error.flatten(),
            })
            return
        }

        const { plan, idempotencyKey } = validation.data
        const amount = SUBSCRIPTION_PRICES[plan]

        const existingReservation = await prisma.balanceReservation.findUnique({
            where: { idempotencyKey },
        })

        if (existingReservation) {
            if (
                existingReservation.userId !== userId ||
                existingReservation.plan !== plan
            ) {
                res.status(409).json({
                    success: false,
                    message: 'Idempotency key has already been used',
                })
                return
            }

            res.json({
                success: true,
                message: 'Reservation already exists',
                data: {
                    reservation: existingReservation,
                    alreadyProcessed: true,
                },
            })
            return
        }

        const expiresAt = new Date(
            Date.now() + RESERVATION_DURATION_MINUTES * 60 * 1000,
        )

        const reservation = await prisma.$transaction(
            async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: {
                        balance: true,
                        frozenBalance: true,
                    },
                })

                if (!user) {
                    throw new Error('USER_NOT_FOUND')
                }

                const availableBalance = user.balance - user.frozenBalance

                if (availableBalance < amount) {
                    throw new Error('INSUFFICIENT_BALANCE')
                }

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        frozenBalance: {
                            increment: amount,
                        },
                    },
                })

                return tx.balanceReservation.create({
                    data: {
                        userId,
                        amount,
                        plan,
                        idempotencyKey,
                        expiresAt,
                    },
                })
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        )

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: {
                reservation,
                availableBalance: undefined,
                alreadyProcessed: false,
            },
        })
    } catch (error) {
        if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'User not found',
            })
            return
        }

        if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
            res.status(400).json({
                success: false,
                message: 'Insufficient balance',
            })
            return
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(409).json({
                success: false,
                message: 'Reservation request has already been processed',
            })
            return
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2034'
        ) {
            res.status(409).json({
                success: false,
                message: 'Balance changed during reservation. Please retry.',
            })
            return
        }

        console.error('Create reservation error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to create reservation',
        })
    }
}

export const confirmReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const validation = reservationIdSchema.safeParse(req.params)

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid reservation ID',
                errors: validation.error.flatten(),
            })
            return
        }

        const { reservationId } = validation.data

        const result = await prisma.$transaction(
            async (tx) => {
                const reservation = await tx.balanceReservation.findFirst({
                    where: {
                        id: reservationId,
                        userId,
                    },
                })

                if (!reservation) {
                    return { type: 'NOT_FOUND' as const }
                }

                if (reservation.status === 'CONFIRMED') {
                    return {
                        type: 'ALREADY_CONFIRMED' as const,
                    }
                }

                if (reservation.status !== 'PENDING') {
                    return {
                        type: 'INVALID_STATUS' as const,
                        status: reservation.status,
                    }
                }

                if (reservation.expiresAt <= new Date()) {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            frozenBalance: {
                                decrement: reservation.amount,
                            },
                        },
                    })

                    await tx.balanceReservation.update({
                        where: { id: reservation.id },
                        data: {
                            status: 'EXPIRED',
                        },
                    })

                    return { type: 'EXPIRED' as const }
                }

                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: {
                        balance: true,
                        frozenBalance: true,
                    },
                })

                if (
                    !user ||
                    user.balance < reservation.amount ||
                    user.frozenBalance < reservation.amount
                ) {
                    throw new Error('BALANCE_INCONSISTENCY')
                }

                const now = new Date()

                const durationDays = SUBSCRIPTION_DURATIONS[reservation.plan]

                const expiresAt = new Date(
                    now.getTime() + durationDays * 24 * 60 * 60 * 1000,
                )

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        balance: {
                            decrement: reservation.amount,
                        },
                        frozenBalance: {
                            decrement: reservation.amount,
                        },
                    },
                })

                const subscription = await tx.subscription.create({
                    data: {
                        userId,
                        plan: reservation.plan,
                        price: reservation.amount,
                        startedAt: now,
                        expiresAt,
                    },
                })

                const vpnKey = await tx.vpnKey.create({
                    data: {
                        userId,
                        subscriptionId: subscription.id,
                        key: generateVpnKey(),
                        expiresAt,
                    },
                    select: {
                        id: true,
                        key: true,
                        status: true,
                        expiresAt: true,
                        createdAt: true,
                    },
                })

                await tx.balanceReservation.update({
                    where: { id: reservation.id },
                    data: {
                        status: 'CONFIRMED',
                    },
                })

                await tx.balanceTransaction.create({
                    data: {
                        userId,
                        reservationId: reservation.id,
                        type: 'SUBSCRIPTION_PAYMENT',
                        amount: -reservation.amount,
                        description: `Subscription payment: ${reservation.plan}`,
                    },
                })

                return {
                    type: 'SUCCESS' as const,
                    subscription,
                    vpnKey,
                    balance: user.balance - reservation.amount,
                    frozenBalance: user.frozenBalance - reservation.amount,
                }
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        )

        if (result.type === 'NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Reservation not found',
            })
            return
        }

        if (result.type === 'ALREADY_CONFIRMED') {
            res.json({
                success: true,
                message: 'Reservation was already confirmed',
                data: {
                    alreadyProcessed: true,
                },
            })
            return
        }

        if (result.type === 'INVALID_STATUS') {
            res.status(409).json({
                success: false,
                message: `Reservation cannot be confirmed. Status: ${result.status}`,
            })
            return
        }

        if (result.type === 'EXPIRED') {
            res.status(410).json({
                success: false,
                message: 'Reservation has expired',
            })
            return
        }

        res.json({
            success: true,
            message: 'Subscription activated successfully',
            data: {
                subscription: result.subscription,
                vpnKey: result.vpnKey,
                balance: result.balance,
                frozenBalance: result.frozenBalance,
                availableBalance: result.balance - result.frozenBalance,
                alreadyProcessed: false,
            },
        })
    } catch (error) {
        if (error instanceof Error && error.message === 'BALANCE_INCONSISTENCY') {
            res.status(409).json({
                success: false,
                message: 'Balance inconsistency detected',
            })
            return
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2034'
        ) {
            res.status(409).json({
                success: false,
                message: 'Balance changed during confirmation. Please retry.',
            })
            return
        }

        console.error('Confirm reservation error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to confirm reservation',
        })
    }
}

export const getReservations = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const validation = reservationsQuerySchema.safeParse(req.query)

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

        const [reservations, total] = await prisma.$transaction([
            prisma.balanceReservation.findMany({
                where: { userId },
                select: {
                    id: true,
                    amount: true,
                    plan: true,
                    status: true,
                    expiresAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),

            prisma.balanceReservation.count({
                where: { userId },
            }),
        ])

        res.json({
            success: true,
            data: {
                reservations,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        })
    } catch (error) {
        console.error('Get reservations error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get reservations',
        })
    }
}


export const cancelReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const validation = reservationIdSchema.safeParse(req.params)

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid reservation ID',
                errors: validation.error.flatten(),
            })
            return
        }

        const { reservationId } = validation.data

        const result = await prisma.$transaction(
            async (tx) => {
                const reservation = await tx.balanceReservation.findFirst({
                    where: {
                        id: reservationId,
                        userId,
                    },
                })

                if (!reservation) {
                    return { type: 'NOT_FOUND' as const }
                }

                if (reservation.status !== 'PENDING') {
                    return {
                        type: 'INVALID_STATUS' as const,
                        status: reservation.status,
                    }
                }

                const updatedReservation = await tx.balanceReservation.updateMany({
                    where: {
                        id: reservationId,
                        userId,
                        status: 'PENDING',
                    },
                    data: {
                        status: 'CANCELLED',
                    },
                })

                if (updatedReservation.count !== 1) {
                    return { type: 'CONFLICT' as const }
                }

                const updatedUser = await tx.user.updateMany({
                    where: {
                        id: userId,
                        frozenBalance: {
                            gte: reservation.amount,
                        },
                    },
                    data: {
                        frozenBalance: {
                            decrement: reservation.amount,
                        },
                    },
                })

                if (updatedUser.count !== 1) {
                    throw new Error('BALANCE_INCONSISTENCY')
                }

                const user = await tx.user.findUniqueOrThrow({
                    where: { id: userId },
                    select: {
                        balance: true,
                        frozenBalance: true,
                    },
                })

                return {
                    type: 'SUCCESS' as const,
                    balance: user.balance,
                    frozenBalance: user.frozenBalance,
                    availableBalance: user.balance - user.frozenBalance,
                }
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        )

        if (result.type === 'NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'Reservation not found',
            })
            return
        }

        if (result.type === 'INVALID_STATUS') {
            res.status(409).json({
                success: false,
                message: `Reservation cannot be cancelled. Status: ${result.status}`,
            })
            return
        }

        if (result.type === 'CONFLICT') {
            res.status(409).json({
                success: false,
                message: 'Reservation has already been processed',
            })
            return
        }

        res.json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: {
                balance: result.balance,
                frozenBalance: result.frozenBalance,
                availableBalance: result.availableBalance,
            },
        })
    } catch (error) {
        if (error instanceof Error && error.message === 'BALANCE_INCONSISTENCY') {
            res.status(409).json({
                success: false,
                message: 'Balance inconsistency detected',
            })
            return
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2034'
        ) {
            res.status(409).json({
                success: false,
                message: 'Balance changed during cancellation. Please retry.',
            })
            return
        }

        console.error('Cancel reservation error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to cancel reservation',
        })
    }
}


export const getVpnKeys = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' })
            return
        }

        const now = new Date()
        await prisma.vpnKey.updateMany({
            where: { userId, status: 'ACTIVE', expiresAt: { lte: now } },
            data: { status: 'EXPIRED' },
        })

        const keys = await prisma.vpnKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                key: true,
                status: true,
                expiresAt: true,
                createdAt: true,
                revokedAt: true,
                subscription: {
                    select: {
                        id: true,
                        plan: true,
                        status: true,
                        createdAt: true,
                        price: true,
                    },
                },
            },
        })

        res.json({ success: true, data: { keys } })
    } catch (error) {
        console.error('Get VPN keys error:', error)
        res.status(500).json({ success: false, message: 'Failed to get VPN keys' })
    }
}

export const regenerateVpnKey = async (req: Request, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const { keyId } = req.params

        if (!keyId || typeof keyId !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Invalid key ID',
            })
            return
        }

        const now = new Date()

        const monthStart = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1,
        ))

        const nextMonthStart = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            1,
        ))

        const LIMIT = 2

        const result = await prisma.$transaction(
            async (tx) => {
                const initialKey = await tx.vpnKey.findFirst({
                    where: {
                        id: keyId,
                        userId,
                    },
                    select: {
                        id: true,
                        subscriptionId: true,
                    },
                })

                if (!initialKey) {
                    return { type: 'NOT_FOUND' as const }
                }

                await tx.$queryRaw`
                    SELECT id
                    FROM "Subscription"
                    WHERE id = ${initialKey.subscriptionId}
                    FOR UPDATE
                `

                const currentKey = await tx.vpnKey.findFirst({
                    where: {
                        id: keyId,
                        userId,
                    },
                    include: {
                        subscription: true,
                    },
                })

                if (!currentKey) {
                    return { type: 'NOT_FOUND' as const }
                }

                const currentTime = new Date()

                if (
                    currentKey.status !== 'ACTIVE' ||
                    currentKey.expiresAt <= currentTime ||
                    currentKey.subscription.status !== 'ACTIVE' ||
                    currentKey.subscription.expiresAt <= currentTime
                ) {
                    return { type: 'INACTIVE' as const }
                }

                const regenerationsCount =
                    await tx.vpnKeyRegeneration.count({
                        where: {
                            subscriptionId: currentKey.subscriptionId,
                            createdAt: {
                                gte: monthStart,
                                lt: nextMonthStart,
                            },
                        },
                    })

                if (regenerationsCount >= LIMIT) {
                    return {
                        type: 'LIMIT_REACHED' as const,
                        used: regenerationsCount,
                        remaining: 0,
                        resetsAt: nextMonthStart,
                    }
                }

                await tx.vpnKey.update({
                    where: {
                        id: currentKey.id,
                    },
                    data: {
                        status: 'REVOKED',
                        revokedAt: currentTime,
                    },
                })

                const newKey = await tx.vpnKey.create({
                    data: {
                        userId,
                        subscriptionId: currentKey.subscriptionId,
                        key: generateVpnKey(),
                        expiresAt: currentKey.subscription.expiresAt,
                    },
                    select: {
                        id: true,
                        key: true,
                        status: true,
                        expiresAt: true,
                        createdAt: true,
                    },
                })

                await tx.vpnKeyRegeneration.create({
                    data: {
                        subscriptionId: currentKey.subscriptionId,
                    },
                })

                return {
                    type: 'SUCCESS' as const,
                    key: newKey,
                    used: regenerationsCount + 1,
                    remaining: LIMIT - regenerationsCount - 1,
                    resetsAt: nextMonthStart,
                }
            },
        )

        if (result.type === 'NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: 'VPN key not found',
            })
            return
        }

        if (result.type === 'INACTIVE') {
            res.status(409).json({
                success: false,
                message: 'Only an active VPN key can be regenerated',
            })
            return
        }

        if (result.type === 'LIMIT_REACHED') {
            res.status(429).json({
                success: false,
                message: 'Monthly VPN key regeneration limit reached',
                data: {
                    limit: LIMIT,
                    used: result.used,
                    remaining: result.remaining,
                    resetsAt: result.resetsAt,
                },
            })
            return
        }

        res.json({
            success: true,
            message: 'VPN key regenerated successfully',
            data: {
                key: result.key,
                regenerationLimit: {
                    limit: LIMIT,
                    used: result.used,
                    remaining: result.remaining,
                    resetsAt: result.resetsAt,
                },
            },
        })
    } catch (error) {
        console.error('Regenerate VPN key error:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to regenerate VPN key',
        })
    }
}

export const refundSubscription = async (
  req: Request,
  res: Response
) => {
try {
const userId = req.userId;
const params = subscriptionIdSchema.safeParse(req.params);

if (!params.success) {
    return res.status(400).json({
        success: false,
        message: 'Некорректный ID подписки',
    });
}

const { subscriptionId } = params.data;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация',
      });
    }

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Не указан ID подписки',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "Subscription"
        WHERE id = ${subscriptionId}
        FOR UPDATE
      `;

      const subscription = await tx.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },
      });

      if (!subscription) {
        return {
          error: 'SUBSCRIPTION_NOT_FOUND',
        };
      }

      if (subscription.status !== 'ACTIVE') {
        return {
          error: 'SUBSCRIPTION_NOT_ACTIVE',
        };
      }

      const now = new Date();
      const REFUND_PERIOD_MS = 24 * 60 * 60 * 1000;

      const elapsedTime =
        now.getTime() - subscription.createdAt.getTime();
        
      if (elapsedTime < 0 || elapsedTime > REFUND_PERIOD_MS) {
        return {
          error: 'REFUND_PERIOD_EXPIRED',
        };
      }

      const refundAmount = subscription.price;

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          balance: {
            increment: refundAmount,
          },
        },
      });

      await tx.balanceTransaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: refundAmount,
          description: `Возврат средств за подписку ${subscription.plan}`,
        },
      });

      await tx.subscription.delete({
        where: {
          id: subscription.id,
        },
      });

      return {
        success: true,
        refundAmount,
      };
    });

    if ('error' in result) {
      switch (result.error) {
        case 'SUBSCRIPTION_NOT_FOUND':
          return res.status(404).json({
            success: false,
            message: 'Подписка не найдена',
          });

        case 'SUBSCRIPTION_NOT_ACTIVE':
          return res.status(400).json({
            success: false,
            message: 'Вернуть можно только активную подписку',
          });

        case 'REFUND_PERIOD_EXPIRED':
          return res.status(403).json({
            success: false,
            message: 'Срок возврата истёк. Возврат доступен в течение 24 часов после покупки',
          });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Подписка отменена, средства возвращены на баланс',
      data: {
        refundAmount: result.refundAmount,
      },
    });
  } catch (error) {
    console.error('Refund subscription error:', error);

    return res.status(500).json({
      success: false,
      message: 'Не удалось выполнить возврат средств',
    });
  }
};
