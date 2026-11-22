import { z } from 'zod'

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(1).max(50).nullable().optional(),

    lastName: z.string().trim().min(1).max(50).nullable().optional(),

    birthDate: z.string().date().nullable().optional(),

    city: z.string().trim().min(1).max(100).nullable().optional(),

    phone: z.string().trim().min(5).max(30).nullable().optional(),
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Необходимо указать хотя бы одно поле для изменения' }
)