import { apiRequest } from './client'

export type SubscriptionPlan = 'MONTH' | 'QUARTER' | 'YEAR'

export interface Reservation {
  id: string
  amount: number
  plan: SubscriptionPlan
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED'
  expiresAt: string
  createdAt: string
}

interface CreateReservationResponse {
  success: boolean
  message: string
  data: {
    reservation: Reservation
    alreadyProcessed: boolean
  }
}

interface ConfirmReservationResponse {
  success: boolean
  message: string
  data: {
    subscription?: {
      id: string
      plan: SubscriptionPlan
      price: number
      startedAt: string
      expiresAt: string
    }
    balance?: number
    alreadyProcessed: boolean
  }
}

export const createReservationRequest = (
  plan: SubscriptionPlan,
  token: string,
) => {
  return apiRequest<CreateReservationResponse>(
    '/subscriptions/reservations',
    {
      method: 'POST',
      token,
      body: {
        plan,
        idempotencyKey: crypto.randomUUID(),
      },
    },
  )
}

export const confirmReservationRequest = (
  reservationId: string,
  token: string,
) => {
  return apiRequest<ConfirmReservationResponse>(
    `/subscriptions/reservations/${reservationId}/confirm`,
    {
      method: 'POST',
      token,
    },
  )
}

export interface RefundSubscriptionResponse {
  success: boolean
  message: string
  data: {
    refundAmount: number
  }
}

export const refundSubscriptionRequest = (
  subscriptionId: string,
  token: string,
) => {
  return apiRequest<RefundSubscriptionResponse>(
    `/subscriptions/${subscriptionId}/refund`,
    {
      method: 'POST',
      token,
    },
  )
}

