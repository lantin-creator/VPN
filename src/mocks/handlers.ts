import { http, HttpResponse } from 'msw'

type PlanId = 'month' | 'quarter' | 'year'

const planPrices: Record<PlanId, number> = {
    month: 299,
    quarter: 499,
    year: 1699,
}

const isPlanId = (value: unknown): value is PlanId => {
    return (
        typeof value === 'string' &&
        Object.prototype.hasOwnProperty.call(planPrices, value)
    )
}

export const payment = [
    http.post('/api/payment', async ({ request }) => {
        let body: unknown

        try {
            body = await request.json()
        } catch {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Некорректный запрос',
                },
                { status: 400 }
            )
        }

        if (
            typeof body !== 'object' ||
            body === null ||
            !('planId' in body) ||
            !isPlanId(body.planId)
        ) {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Неизвестный тариф',
                },
                { status: 400 }
            )
        }

        const amount = planPrices[body.planId]

        return HttpResponse.json({
            success: true,
            message: 'оплата прошла успешно',
            transaction: {
                id: String(Date.now()),
                planId: body.planId,
                amount,
                status: 'success',
            },
        })
    }),
]