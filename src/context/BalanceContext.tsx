import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

import { useAuth } from './AuthContext'
import {
    getBalance,
    topUpBalance,
    type BalanceData,
} from '../api/balance.api'

interface BalanceContextValue {
    balance: number
    frozen: number
    available: number
    isLoading: boolean
    error: string | null
    refreshBalance: () => Promise<void>
    topUp: (amount: number) => Promise<void>
}

const BalanceContext = createContext<BalanceContextValue | undefined>(
    undefined,
)

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
    const { token, user, isLoading: isAuthLoading } = useAuth()

    const [balanceData, setBalanceData] = useState<BalanceData>({
        balance: 0,
        frozenBalance: 0,
        availableBalance: 0,
    })

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshBalance = useCallback(async () => {
        if (!token || !user) {
            setBalanceData({
                balance: 0,
                frozenBalance: 0,
                availableBalance: 0,
            })
            return
        }

        try {
            setError(null)

            const response = await getBalance(token)
            setBalanceData(response.data)
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить баланс'

            setError(message)
            throw err
        }
    }, [token, user])

    useEffect(() => {
        if (isAuthLoading) return

        let cancelled = false

        const loadBalance = async () => {
            setIsLoading(true)

            try {
                if (!token || !user) {
                    setBalanceData({
                        balance: 0,
                        frozenBalance: 0,
                        availableBalance: 0,
                    })
                    return
                }

                const response = await getBalance(token)

                if (!cancelled) {
                    setBalanceData(response.data)
                    setError(null)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Не удалось загрузить баланс',
                    )
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        void loadBalance()

        return () => {
            cancelled = true
        }
    }, [token, user, isAuthLoading])

    const topUp = useCallback(
        async (amount: number) => {
            if (!token || !user) {
                throw new Error('Необходимо войти в аккаунт')
            }

            if (!Number.isInteger(amount) || amount < 1 || amount > 10000) {
                throw new Error('Сумма должна быть от 1 до 10 000 ₽')
            }

            setError(null)

            await topUpBalance(
                token,
                amount * 100,
                crypto.randomUUID(),
            )

            await refreshBalance()
        },
        [token, user, refreshBalance],
    )

    return (
        <BalanceContext.Provider
            value={{
                balance: balanceData.balance,
                frozen: balanceData.frozenBalance,
                available: balanceData.availableBalance,
                isLoading,
                error,
                refreshBalance,
                topUp,
            }}
        >
            {children}
        </BalanceContext.Provider>
    )
}

export const useBalanceContext = () => {
    const context = useContext(BalanceContext)

    if (!context) {
        throw new Error(
            'useBalanceContext должен использоваться внутри BalanceProvider',
        )
    }

    return context
}
