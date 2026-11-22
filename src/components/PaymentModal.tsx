import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './PaymentModal.css'

interface PaymentPlan {
    id: 'month' | 'quarter' | 'year'
    title: ReactNode
    price: ReactNode
    subscriptionPrice: number
}

interface PaymentModalProps {
    isOpen: boolean
    plan?: PaymentPlan | null
    onClose: () => void
    onSubmit: () => Promise<void>
}

const PaymentModal = ({
    isOpen,
    plan,
    onClose,
    onSubmit,
}: PaymentModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) {
                onClose()
            }
        }

        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose, isSubmitting])

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (isSubmitting || !plan) return

        setIsSubmitting(true)

        try {
            await onSubmit()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={() => {
                if (!isSubmitting) onClose()
            }}
        >
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Закрыть"
                    disabled={isSubmitting}
                >
                    ×
                </button>

                <h2 className="modal-title">
                    Подтверждение подписки
                </h2>

                <p className="modal-plan">
                    Тариф: <strong>{plan?.title}</strong>
                    {' — '}
                    <strong>{plan?.price}</strong>
                </p>

                <button
                    type="button"
                    className="modal-submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !plan}
                >
                    {isSubmitting ? 'Обработка...' : 'Оформить'}
                </button>
            </div>
        </div>
    )
}

export default PaymentModal
