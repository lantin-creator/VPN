import { apiRequest } from './client'

export type BalanceData = {
    balance: number
}

export type BalanceResponse = {
    success: boolean
    data: BalanceData
}

export const getBalance = (token: string) =>
    apiRequest<BalanceResponse>('/balance', { token })

export const topUpBalance = (
    token: string,
    amount: number,
    idempotencyKey: string,
) =>
    apiRequest('/balance/top-up', {
        method: 'POST',
        token,
        body: {
            amount,
            idempotencyKey,
        },
    })
