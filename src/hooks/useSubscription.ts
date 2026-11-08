import { useCallback, useState } from 'react'
import { useBalanceContext } from '../context/BalanceContext'

export type PlanId = 'month' | 'quarter' | 'year'

export interface Plan {
    id: PlanId
    title: string
    price: string
    subscriptionPrice: number
}

interface PaymentResponse {
    message?: string
}

export const useSubscription = () => {
    const { freeze, confirmPayment, refund } = useBalanceContext()

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [toast, setToast] = useState<{
        message: string
        id: number
    } | null>(null)

    const openModal = useCallback((plan: Plan) => {
        setSelectedPlan(plan)
        setIsModalOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsModalOpen(false)

        setTimeout(() => {
            setSelectedPlan(null)
        }, 200)
    }, [])

    const showToast = useCallback((message: string) => {
        const id = Date.now()

        setToast({ message, id })

        setTimeout(() => {
            setToast((current) =>
                current?.id === id ? null : current
            )
        }, 3500)
    }, [])

    const hideToast = useCallback(() => {
        setToast(null)
    }, [])

    const submitPayment = useCallback(
        async (): Promise<void> => {
            if (!selectedPlan) {
                showToast('Сначала выберите тариф')
                return
            }

            const amount = selectedPlan.subscriptionPrice

            const isFrozen = freeze(amount)

            if (!isFrozen) {
                showToast('Недостаточно средств на балансе')
                return
            }

            try {
                const response = await fetch('/api/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        planId: selectedPlan.id,
                    }),
                })

                const data = await response.json() as PaymentResponse

                if (response.ok) {
                    const isConfirmed = confirmPayment(amount)

                    if (!isConfirmed) {
                        showToast('Не удалось подтвердить списание')
                        return
                    }

                    showToast(
                        `Вы оформили подписку «${selectedPlan.title}»`
                    )

                    closeModal()
                } else {
                    refund(amount)
                    showToast(data.message ?? 'Оплата не прошла')
                }
            } catch {
                refund(amount)
                showToast('Ошибка сети. Средства возвращены.')
            }
        },
        [
            selectedPlan,
            showToast,
            closeModal,
            freeze,
            confirmPayment,
            refund,
        ]
    )

    return {
        selectedPlan,
        isModalOpen,
        toast,
        openModal,
        closeModal,
        showToast,
        hideToast,
        submitPayment,
    }
}
