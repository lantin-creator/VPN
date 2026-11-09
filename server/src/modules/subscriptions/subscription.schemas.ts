import { z } from 'zod'

export const createReservationSchema = z.object({
    plan: z.enum(['MONTH', 'QUARTER', 'YEAR']),
    idempotencyKey: z.string().uuid(),
})

export const reservationIdSchema = z.object({
    reservationId: z.string().uuid(),
})

export const reservationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const subscriptionIdSchema = z.object({
  subscriptionId: z.string().uuid(),
});