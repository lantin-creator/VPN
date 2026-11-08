import { SubscriptionPlan } from '@prisma/client'

export const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, number> = {
    MONTH: 29900,
    QUARTER: 49900,
    YEAR: 169900,
}

export const SUBSCRIPTION_DURATIONS: Record<SubscriptionPlan, number> = {
    MONTH: 30,
    QUARTER: 90,
    YEAR: 365,
}

export const RESERVATION_DURATION_MINUTES = 15