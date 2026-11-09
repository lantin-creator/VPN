import { useState, type FormEvent } from 'react'
import './Auth.css'
import { Link } from 'react-router-dom'
import BalanceModal from '../../components/BalanceModal'
import { useBalanceContext } from '../../context/BalanceContext'

export type AccountProfile = {
    email: string
    firstName: string | null
    lastName: string | null
    birthDate: string | null
    city: string | null
    phone: string | null
}

type AccountPanelProps = {
    profile: AccountProfile
    onSave: (profile: Omit<AccountProfile, 'email'>) => void | Promise<void>
    onLogout: () => void
    isLoading?: boolean
    error?: string | null
}

const formatMoney = (amount: number) =>
    `${(amount / 100).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ₽`

const AccountPanel = ({
    profile,
    onSave,
    onLogout,
    isLoading = false,
    error,
}: AccountPanelProps) => {
    const {
        balance,
        isLoading: isBalanceLoading,
        error: balanceError,
        topUp,
    } = useBalanceContext()

    const [firstName, setFirstName] = useState(profile.firstName ?? '')
    const [lastName, setLastName] = useState(profile.lastName ?? '')
    const [birthDate, setBirthDate] = useState(
        profile.birthDate?.slice(0, 10) ?? '',
    )
    const [city, setCity] = useState(profile.city ?? '')
    const [phone, setPhone] = useState(profile.phone ?? '')

    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        void onSave({
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
            birthDate: birthDate || null,
            city: city.trim() || null,
            phone: phone.trim() || null,
        })
    }

    const handleTopUp = async (amount: number) => {
        await topUp(amount)
    }

    return (
        <main className="account-page">
            <div className="account-container">
                <header className="account-header">
                    <div>
                        <Link className="auth-home-link" to="/VPN/">
                            ← На главную
                        </Link>
                        <p className="auth-brand">RVPN</p>
                        <h1>Личный кабинет</h1>
                    </div>

                    <button
                        className="account-secondary"
                        type="button"
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </header>

                <section className="account-balance-card">
                    <div className="account-balance-heading">
                        <div>
                            <p className="account-balance-caption">
                                Ваш баланс
                            </p>

                            <h2>
                                {isBalanceLoading
                                    ? 'Загрузка…'
                                    : formatMoney(balance)}
                            </h2>
                        </div>

                        <button
                            className="account-topup-button"
                            type="button"
                            onClick={() => setIsBalanceModalOpen(true)}
                            disabled={isBalanceLoading}
                        >
                            Пополнить
                        </button>
                    </div>

                    {balanceError && (
                        <p className="auth-error" role="alert">
                            {balanceError}
                        </p>
                    )}
                </section>

                <section className="account-card">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="auth-field">
                            Email
                            <input
                                className="auth-input"
                                type="email"
                                value={profile.email}
                                readOnly
                            />
                        </label>

                        <div className="account-grid">
                            <label className="auth-field">
                                Имя
                                <input
                                    className="auth-input"
                                    value={firstName}
                                    onChange={(event) =>
                                        setFirstName(event.target.value)
                                    }
                                    maxLength={50}
                                />
                            </label>

                            <label className="auth-field">
                                Фамилия
                                <input
                                    className="auth-input"
                                    value={lastName}
                                    onChange={(event) =>
                                        setLastName(event.target.value)
                                    }
                                    maxLength={50}
                                />
                            </label>

                            <label className="auth-field">
                                Дата рождения
                                <input
                                    className="auth-input"
                                    type="date"
                                    value={birthDate}
                                    onChange={(event) =>
                                        setBirthDate(event.target.value)
                                    }
                                />
                            </label>

                            <label className="auth-field">
                                Город
                                <input
                                    className="auth-input"
                                    value={city}
                                    onChange={(event) =>
                                        setCity(event.target.value)
                                    }
                                    maxLength={100}
                                />
                            </label>

                            <label className="auth-field">
                                Телефон
                                <input
                                    className="auth-input"
                                    type="tel"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(event.target.value)
                                    }
                                    maxLength={30}
                                />
                            </label>
                        </div>

                        {error && (
                            <p className="auth-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="account-actions">
                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Сохраняем…'
                                    : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <BalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                onTopUp={handleTopUp}
            />
        </main>
    )
}

export default AccountPanel
