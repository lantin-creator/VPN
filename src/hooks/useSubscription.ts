import { useCallback, useState } from 'react'
interface Plan {
  title: string
  price: string
}
interface PaymentFormData {
  name: string
  card: string
  expiry: string
  cvv: string
}

export const useSubscription = () => {
const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
const [isModalOpen, setIsModalOpen] = useState(false)
const [toast, setToast] = useState<{ message: string; id: number } | null>(null)

  const openModal = useCallback((plan: Plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPlan(null), 200)
  }, [])

  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToast({ message, id })
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 3500)
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  const submitPayment = useCallback(
  async (formData: PaymentFormData) => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, ...formData }),
      })

      const data = await response.json()

      if (response.ok) {
        const planTitle = selectedPlan?.title ?? 'подписку'
        showToast(`Вы оформили подписку «${planTitle}»`)
        closeModal()
      } else {
        showToast(data.message ?? 'Оплата не прошла')
      }
    } catch {
      showToast('Ошибка сети. Попробуйте позже.')
    }
  },
  [selectedPlan, showToast, closeModal]
)

  return {
    selectedPlan,
    isModalOpen,
    toast,
    openModal,
    closeModal,
    submitPayment,
    hideToast,
  }
}