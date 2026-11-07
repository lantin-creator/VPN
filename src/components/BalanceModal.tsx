
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './BalanceModal.css'

interface BalanceModalProps {
    isOpen: boolean
    onClose: () => void
    onTopUp: (amount: number) => void
}

const presetAmounts = [100, 500, 1000, 2000]

const BalanceModal = ({
    isOpen,
    onClose,
    onTopUp,
}: BalanceModalProps) => {
    const [amount, setAmount] = useState('500')

    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const numericAmount = Number(amount)

    const isValidAmount =
        amount.trim() !== '' &&
        Number.isInteger(numericAmount) &&
        numericAmount >= 1 &&
        numericAmount <= 1000000

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!isValidAmount) return

        onTopUp(numericAmount)

        setAmount('500')
        onClose()
    }

    return (
        <div
            className="balance-modal-overlay"
            onClick={onClose}
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
                            max="1000000"
                            step="1"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="Введите сумму"
                            required
                        />

                        <span>₽</span>
                    </div>

                    {!isValidAmount && amount !== '' && (
                        <p className="balance-input-error">
                            Введите сумму от 1 до 1 000 000 ₽
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
                        disabled={!isValidAmount}
                    >
                        Пополнить баланс
                    </button>
                </form>
            </div>
        </div>
    )
}

export default BalanceModal
