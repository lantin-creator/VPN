import './Balance.css'

interface BalanceProps {
  balance: number
  onClick: () => void
}

const Balance = ({ balance, onClick }: BalanceProps) => {
  const formattedBalance = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(balance)

  return (
    <button
      className="balance-button"
      onClick={onClick}
      type="button"
      aria-label={`Баланс: ${formattedBalance}. Открыть пополнение`}
    >
      <svg
        className="balance-icon"
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
        <path d="M6 6V4a2 2 0 0 1 2-2h11" />
      </svg>

      <span className="balance-amount">
        {formattedBalance}
      </span>
    </button>
  )
}

export default Balance
