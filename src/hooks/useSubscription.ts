import { useCallback, useState } from 'react'

export const useSubscription = () => {
  const [selectedPlan, setSelectedPlan] = useState(null) 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const openModal = useCallback((plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPlan(null), 200)
  }, [])

  const showToast = useCallback((message) => {
    const id = Date.now()
    setToast({ message, id })
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 3500)
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  const submitPayment = useCallback(
    (formData) => {
      console.log('Оплата:', { plan: selectedPlan, ...formData })
      const planTitle = selectedPlan?.title ?? 'подписку'
      showToast(`Вы оформили подписку «${planTitle}»`)
      closeModal()
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