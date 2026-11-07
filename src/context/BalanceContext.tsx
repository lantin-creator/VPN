import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { ReactNode } from 'react'

interface BalanceState {
    available: number
    frozen: number
}

interface BalanceContextValue extends BalanceState {
    topUp: (amount: number) => boolean
    freeze: (amount: number) => boolean
    confirmPayment: (amount: number) => boolean
    refund: (amount: number) => boolean
}

interface BalanceProviderProps {
    children: ReactNode
}

const STORAGE_KEY = 'rvpnBalance'
const LEGACY_STORAGE_KEY = 'numericAmount'

const INITIAL_BALANCE: BalanceState = {
    available: 500,
    frozen: 0,
}

const isValidAmount = (amount: number): boolean =>
    Number.isSafeInteger(amount) && amount > 0

const loadBalance = (): BalanceState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)

        if (saved !== null) {
            const parsed: unknown = JSON.parse(saved)

            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'available' in parsed &&
                'frozen' in parsed &&
                typeof parsed.available === 'number' &&
                typeof parsed.frozen === 'number' &&
                Number.isSafeInteger(parsed.available) &&
                Number.isSafeInteger(parsed.frozen) &&
                parsed.available >= 0 &&
                parsed.frozen >= 0
            ) {
                return {
                    available: parsed.available,
                    frozen: parsed.frozen,
                }
            }

            return INITIAL_BALANCE
        }

        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)

        if (legacy !== null) {
            const amount = Number(legacy)

            if (Number.isSafeInteger(amount) && amount >= 0) {
                return { available: amount, frozen: 0 }
            }
        }
    } catch {
        return INITIAL_BALANCE
    }

    return INITIAL_BALANCE
}

const BalanceContext = createContext<BalanceContextValue | null>(null)

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
    const [balance, setBalance] = useState<BalanceState>(loadBalance)
    const balanceRef = useRef(balance)

    const updateBalance = useCallback(
        (updater: (current: BalanceState) => BalanceState): BalanceState => {
            const next = updater(balanceRef.current)

            balanceRef.current = next
            setBalance(next)

            return next
        },
        []
    )

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(balance))
        } catch {
            console.error('Не удалось сохранить баланс')
        }
    }, [balance])

    const topUp = useCallback((amount: number): boolean => {
        if (!isValidAmount(amount)) return false

        const next = updateBalance((current) => {
            const available = current.available + amount

            if (!Number.isSafeInteger(available)) return current

            return { ...current, available }
        })

        return next.available >= amount
    }, [updateBalance])

    const freeze = useCallback((amount: number): boolean => {
        if (!isValidAmount(amount)) return false

        let success = false

        updateBalance((current) => {
            if (current.available < amount) return current

            success = true

            return {
                available: current.available - amount,
                frozen: current.frozen + amount,
            }
        })

        return success
    }, [updateBalance])

    const confirmPayment = useCallback((amount: number): boolean => {
        if (!isValidAmount(amount)) return false

        let success = false

        updateBalance((current) => {
            if (current.frozen < amount) return current

            success = true

            return {
                ...current,
                frozen: current.frozen - amount,
            }
        })

        return success
    }, [updateBalance])

    const refund = useCallback((amount: number): boolean => {
        if (!isValidAmount(amount)) return false

        let success = false

        updateBalance((current) => {
            if (current.frozen < amount) return current

            const available = current.available + amount

            if (!Number.isSafeInteger(available)) return current

            success = true

            return {
                available,
                frozen: current.frozen - amount,
            }
        })

        return success
    }, [updateBalance])

    const contextValue = useMemo(
        () => ({
            available: balance.available,
            frozen: balance.frozen,
            topUp,
            freeze,
            confirmPayment,
            refund,
        }),
        [balance, topUp, freeze, confirmPayment, refund]
    )

    return (
        <BalanceContext.Provider value={contextValue}>
            {children}
        </BalanceContext.Provider>
    )
}

export const useBalanceContext = () => {
    const context = useContext(BalanceContext)

    if (!context) {
        throw new Error(
            'useBalanceContext must be used within BalanceProvider'
        )
    }

    return context
}
