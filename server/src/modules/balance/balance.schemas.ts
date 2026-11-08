import { z } from 'zod'

export const transactionsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const topUpSchema = z.object({
    amount: z.coerce.number().int().min(100).max(1000000),
    idempotencyKey: z.string().uuid(),
})