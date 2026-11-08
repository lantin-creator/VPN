import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBalanceContext } from '../context/BalanceContext'
import {
  createReservationRequest,
  confirmReservationRequest,
  type SubscriptionPlan,
} from '../api/subscriptions.api'

export type PlanId = 'month' | 'quarter' | 'year'

interface Plan {
  id: PlanId
  title: string
  price: React.ReactNode
  subscriptionPrice: number
}

const PLAN_MAP: Record<PlanId, SubscriptionPlan> = {
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
}

export const useSubscription = () => {
  const { token } = useAuth()
  const { refreshBalance } = useBalanceContext()

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const openModal = useCallback((plan: Plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    if (isSubmitting) return

    setIsModalOpen(false)
    setSelectedPlan(null)
  }, [isSubmitting])

  const showToast = useCallback((message: string) => {
    setToast(message)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  const submitPayment = useCallback(async () => {
    if (!selectedPlan || !token || isSubmitting) {
      if (!token) {
        setToast('Для оформления подписки необходимо войти в аккаунт')
      }
      return
    }

    setIsSubmitting(true)
    setToast(null)

    try {
      // 1. Создаём резервирование и замораживаем деньги на backend.
      const reservationResponse = await createReservationRequest(
        PLAN_MAP[selectedPlan.id],
        token,
      )

      const reservationId = reservationResponse.data.reservation.id

      // 2. Подтверждаем резервирование.
      await confirmReservationRequest(reservationId, token)

      // 3. Получаем актуальный баланс с backend.
      await refreshBalance()

      setIsModalOpen(false)
      setSelectedPlan(null)
      setToast('Подписка успешно оформлена!')
    } catch (error) {
      // Даже при ошибке обновляем баланс: сервер мог успеть
      // обработать запрос до возникновения сетевой ошибки.
      try {
        await refreshBalance()
      } catch {
        // Ошибка обновления баланса не должна скрывать основную ошибку.
      }

      setToast(
        error instanceof Error
          ? error.message
          : 'Не удалось оформить подписку',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedPlan, token, isSubmitting, refreshBalance])

  return {
    selectedPlan,
    isModalOpen,
    isSubmitting,
    toast,
    openModal,
    closeModal,
    showToast,
    hideToast,
    submitPayment,
  }
}