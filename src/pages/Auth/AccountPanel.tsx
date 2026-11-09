import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import './Auth.css'

import BalanceModal from '../../components/BalanceModal'
import { useBalanceContext } from '../../context/BalanceContext'
import { useAuth } from '../../context/AuthContext'

import {
    getVpnKeys,
    regenerateVpnKey,
    type VpnKey,
} from '../../api/vpn.api'

import { refundSubscriptionRequest } from '../../api/subscriptions.api'

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
    onSave: (
        profile: Omit<AccountProfile, 'email'>,
    ) => void | Promise<void>
    onLogout: () => void
    isLoading?: boolean
    error?: string | null
}

const REFUND_PERIOD_MS = 24 * 60 * 60 * 1000

const formatMoney = (amount: number) =>
    `${(amount / 100).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ₽`

const isRefundAvailable = (createdAt: string) => {
    const purchaseTime = new Date(createdAt).getTime()
    const elapsedTime = Date.now() - purchaseTime

    return (
        Number.isFinite(purchaseTime) &&
        elapsedTime >= 0 &&
        elapsedTime <= REFUND_PERIOD_MS
    )
}

const AccountPanel = ({
    profile,
    onSave,
    onLogout,
    isLoading = false,
    error,
}: AccountPanelProps) => {
    const { token } = useAuth()

    const [vpnKeys, setVpnKeys] = useState<VpnKey[]>([])
    const [vpnKeysLoading, setVpnKeysLoading] = useState(true)
    const [vpnKeysError, setVpnKeysError] = useState<string | null>(null)

    const [regeneratingKeyId, setRegeneratingKeyId] =
        useState<string | null>(null)

    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

    const [refundingSubscriptionId, setRefundingSubscriptionId] =
        useState<string | null>(null)

    const [refundError, setRefundError] = useState<string | null>(null)

    const {
        balance,
        isLoading: isBalanceLoading,
        error: balanceError,
        topUp,
        refreshBalance,
    } = useBalanceContext()

    const [firstName, setFirstName] = useState(profile.firstName ?? '')
    const [lastName, setLastName] = useState(profile.lastName ?? '')
    const [birthDate, setBirthDate] = useState(
        profile.birthDate?.slice(0, 10) ?? '',
    )
    const [city, setCity] = useState(profile.city ?? '')
    const [phone, setPhone] = useState(profile.phone ?? '')

    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

    useEffect(() => {
        if (!token) {
            setVpnKeys([])
            setVpnKeysLoading(false)
            return
        }

        let cancelled = false

        setVpnKeysLoading(true)
        setVpnKeysError(null)

        getVpnKeys(token)
            .then((response) => {
                if (!cancelled) {
                    setVpnKeys(response.data.keys)
                }
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setVpnKeysError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'Не удалось загрузить VPN-ключи',
                    )
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setVpnKeysLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [token])

    const handleRegenerateKey = async (keyId: string) => {
        if (!token) return

        setRegeneratingKeyId(keyId)
        setVpnKeysError(null)

        try {
            await regenerateVpnKey(keyId, token)

            const response = await getVpnKeys(token)
            setVpnKeys(response.data.keys)
        } catch (requestError) {
            setVpnKeysError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось перевыпустить ключ',
            )
        } finally {
            setRegeneratingKeyId(null)
        }
    }

    const handleRefund = async (subscriptionId: string) => {
        if (!token) return

        const confirmed = window.confirm(
            'Вернуть средства за эту подписку на баланс? Все VPN-ключи этой подписки будут удалены. Это действие нельзя отменить.',
        )

        if (!confirmed) return

        setRefundingSubscriptionId(subscriptionId)
        setRefundError(null)

        try {
            await refundSubscriptionRequest(subscriptionId, token)

            setVpnKeys((currentKeys) =>
                currentKeys.filter(
                    (key) => key.subscription?.id !== subscriptionId,
                ),
            )

            await refreshBalance()
        } catch (requestError) {
            setRefundError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось оформить возврат',
            )
        } finally {
            setRefundingSubscriptionId(null)
        }
    }

    const handleCopyKey = async (key: VpnKey) => {
        try {
            await navigator.clipboard.writeText(key.key)

            setCopiedKeyId(key.id)

            window.setTimeout(() => {
                setCopiedKeyId(null)
            }, 1800)
        } catch {
            setVpnKeysError('Не удалось скопировать ключ')
        }
    }

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

                <div className="account-layout">
                    <div className="account-profile-column">
                        <section className="account-card">
                            <h2>Мой аккаунт</h2>

                            <form
                                className="auth-form"
                                onSubmit={handleSubmit}
                            >
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
                                                setFirstName(
                                                    event.target.value,
                                                )
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
                                                setLastName(
                                                    event.target.value,
                                                )
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
                                                setBirthDate(
                                                    event.target.value,
                                                )
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

                    <div className="account-subscription-column">
                        <section className="account-card">
                            <h2>Мой VPN</h2>

                            <p>
                                Демонстрационный ключ аккаунта RVPN.
                                Он не подключает к реальному VPN-серверу.
                            </p>

                            {vpnKeysLoading && <p>Загружаем ключи…</p>}

                            {vpnKeysError && (
                                <p className="auth-error" role="alert">
                                    {vpnKeysError}
                                </p>
                            )}

                            {refundError && (
                                <p className="auth-error" role="alert">
                                    {refundError}
                                </p>
                            )}

                            {!vpnKeysLoading &&
                                vpnKeys.length === 0 &&
                                !vpnKeysError && (
                                    <p>
                                        Пока нет ключей. Купи подписку,
                                        и ключ появится здесь.
                                    </p>
                                )}

                            {vpnKeys.map((vpnKey, index) => {
                                const subscription = vpnKey.subscription

                                const isFirstKeyOfSubscription =
                                    !!subscription?.id &&
                                    vpnKeys.findIndex(
                                        (key) =>
                                            key.subscription?.id ===
                                            subscription.id,
                                    ) === index

                                const canRefund =
                                    isFirstKeyOfSubscription &&
                                    subscription?.status === 'ACTIVE' &&
                                    !!subscription.createdAt &&
                                    isRefundAvailable(
                                        subscription.createdAt,
                                    )

                                return (
                                    <div
                                        className="account-vpn-key"
                                        key={vpnKey.id}
                                    >
                                        <p>
                                            <strong>
                                                {vpnKey.status === 'ACTIVE'
                                                    ? 'Активен'
                                                    : vpnKey.status ===
                                                        'EXPIRED'
                                                      ? 'Истёк'
                                                      : 'Отозван'}
                                            </strong>
                                        </p>

                                        <code>{vpnKey.key}</code>

                                        <p>
                                            Действует до:{' '}
                                            {new Date(
                                                vpnKey.expiresAt,
                                            ).toLocaleString('ru-RU')}
                                        </p>

                                        {vpnKey.status === 'ACTIVE' && (
                                            <div className="account-actions">
                                                <button
                                                    className="account-secondary"
                                                    type="button"
                                                    onClick={() =>
                                                        void handleCopyKey(
                                                            vpnKey,
                                                        )
                                                    }
                                                >
                                                    {copiedKeyId ===
                                                    vpnKey.id
                                                        ? 'Скопировано'
                                                        : 'Копировать ключ'}
                                                </button>

                                                <button
                                                    className="account-secondary"
                                                    type="button"
                                                    disabled={
                                                        regeneratingKeyId ===
                                                        vpnKey.id
                                                    }
                                                    onClick={() =>
                                                        void handleRegenerateKey(
                                                            vpnKey.id,
                                                        )
                                                    }
                                                >
                                                    {regeneratingKeyId ===
                                                    vpnKey.id
                                                        ? 'Перевыпускаем…'
                                                        : 'Перевыпустить'}
                                                </button>
                                            </div>
                                        )}

                                        {canRefund && subscription && (
                                            <div className="account-refund">
                                                <p className="account-refund-info">
                                                    Стоимость подписки:{' '}
                                                    <strong>
                                                        {formatMoney(
                                                            subscription.price,
                                                        )}
                                                    </strong>
                                                </p>

                                                <button
                                                    className="account-refund-button"
                                                    type="button"
                                                    disabled={
                                                        refundingSubscriptionId ===
                                                        subscription.id
                                                    }
                                                    onClick={() =>
                                                        void handleRefund(
                                                            subscription.id,
                                                        )
                                                    }
                                                >
                                                    {refundingSubscriptionId ===
                                                    subscription.id
                                                        ? 'Оформляем возврат…'
                                                        : 'Вернуть средства'}
                                                </button>

                                                <p className="account-refund-hint">
                                                    Возврат доступен в течение
                                                    24 часов после покупки.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </section>
                    </div>
                </div>
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