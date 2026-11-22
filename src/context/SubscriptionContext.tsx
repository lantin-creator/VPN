import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useSubscription } from '../hooks/useSubscription'

type SubscriptionType = ReturnType<typeof useSubscription>

interface SubscriptionProviderProps {
    children: ReactNode
}

const SubscriptionContext = createContext<SubscriptionType | null>(null)

export const SubscriptionProvider = ({
    children,
}: SubscriptionProviderProps) => {
    const subscription = useSubscription()

    return (
        <SubscriptionContext.Provider value={subscription}>
            {children}
        </SubscriptionContext.Provider>
    )
}

export const useSubscriptionContext = (): SubscriptionType => {
    const ctx = useContext(SubscriptionContext)

    if (!ctx) {
        throw new Error(
            'useSubscriptionContext must be used within SubscriptionProvider'
        )
    }

    return ctx
}
