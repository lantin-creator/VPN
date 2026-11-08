import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './BalanceModal.css'

interface BalanceModalProps {
    isOpen: boolean
    onClose: () => void
    onTopUp: (amount: number) => Promise<void>
}

const presetAmounts = [100, 500, 1000, 2000]

const BalanceModal = ({
    isOpen,
    onClose,
    onTopUp,
}: BalanceModalProps) => {
    const [amount, setAmount] = useState('500')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose()
            }
        }

        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, isSubmitting, onClose])

    useEffect(() => {
        if (isOpen) {
            setError(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    const numericAmount = Number(amount)

    const isValidAmount =
        amount.trim() !== '' &&
        Number.isInteger(numericAmount) &&
        numericAmount >= 1 &&
        numericAmount <= 10000

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!isValidAmount || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onTopUp(numericAmount)

            setAmount('500')
            onClose()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось пополнить баланс',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="balance-modal-overlay"
            onClick={() => !isSubmitting && onClose()}
        >
            <div
                className="balance-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="balance-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    className="balance-modal-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Закрыть окно"
                    disabled={isSubmitting}
                >
                    ×
                </button>

                <div className="balance-modal-header">
                    <div className="balance-modal-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="3" y="6" width="18" height="15" rx="2" />
                            <path d="M3 10h18" />
                            <path d="M16 15h2" />
                        </svg>
                    </div>

                    <h2 id="balance-modal-title">
                        Пополнение баланса
                    </h2>

                    <p>
                        Выберите сумму, которую хотите добавить на баланс.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="balance-modal-presets">
                        {presetAmounts.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className={`balance-preset ${
                                    numericAmount === preset ? 'active' : ''
                                }`}
                                onClick={() => setAmount(String(preset))}
                                disabled={isSubmitting}
                            >
                                {preset.toLocaleString('ru-RU')} ₽
                            </button>
                        ))}
                    </div>

                    <label
                        className="balance-modal-label"
                        htmlFor="balance-amount-input"
                    >
                        Или введите свою сумму
                    </label>

                    <div className="balance-input-wrapper">
                        <input
                            id="balance-amount-input"
                            type="number"
                            min="1"
                            max="10000"
                            step="1"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="Введите сумму"
                            required
                            disabled={isSubmitting}
                        />

                        <span>₽</span>
                    </div>

                    {!isValidAmount && amount !== '' && (
                        <p className="balance-input-error">
                            Введите сумму от 1 до 10 000 ₽
                        </p>
                    )}

                    {error && (
                        <p className="balance-input-error">
                            {error}
                        </p>
                    )}

                    <div className="balance-modal-summary">
                        <span>К зачислению</span>

                        <strong>
                            {isValidAmount
                                ? `${numericAmount.toLocaleString('ru-RU')} ₽`
                                : '—'}
                        </strong>
                    </div>

                    <button
                        className="balance-submit"
                        type="submit"
                        disabled={!isValidAmount || isSubmitting}
                    >
                        {isSubmitting
                            ? 'Обрабатываем…'
                            : 'Пополнить баланс'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default BalanceModal
