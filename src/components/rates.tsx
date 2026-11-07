import type { ReactNode } from 'react'
import { useSubscriptionContext } from '../context/SubscriptionContext'
import type { PlanId } from '../hooks/useSubscription'

interface RatesProps {
    Ratesclass?: string
    Ratessubheading?: string
    subheadingChild: string
    RatesHr1?: string
    Text1?: string
    Text1Child?: ReactNode
    Guarantee?: string
    GuaranteeChild?: ReactNode
    Price?: string
    PriceChild: string
    RatesHr2?: string
    BTNClass?: string
    ItSupportsCrossPlatformFunctionality?: boolean
    CrossPlatformCapability?: string
    Subscription_price: number
    planId: PlanId
}

const Rates = ({
    Ratesclass = '',
    Ratessubheading = '',
    subheadingChild,
    RatesHr1 = '',
    Text1 = '',
    Text1Child,
    Guarantee = '',
    GuaranteeChild,
    Price = '',
    PriceChild,
    RatesHr2 = '',
    BTNClass = '',
    ItSupportsCrossPlatformFunctionality = false,
    CrossPlatformCapability = '',
    Subscription_price,
    planId,
}: RatesProps) => {
    const { openModal } = useSubscriptionContext()

    const handleClick = () => {
        openModal({
            id: planId,
            title: subheadingChild,
            price: PriceChild,
            subscriptionPrice: Subscription_price,
        })
    }

    return (
        <div className={Ratesclass}>
            <div className={Ratessubheading}>
                {subheadingChild}
            </div>

            <hr className={RatesHr1} />

            <div className={Text1}>
                <span style={{ fontWeight: 'normal' }}>✓</span>
                {Text1Child}
                <div className="AI">AI</div>
            </div>

            <div className={Guarantee}>
                <span style={{ fontWeight: 'normal' }}>✓</span>
                {GuaranteeChild}
            </div>

            {ItSupportsCrossPlatformFunctionality && (
                <div className={CrossPlatformCapability}>
                    <span style={{ fontWeight: 'normal' }}>✓</span>
                    Кроссплатформенность
                </div>
            )}

            <div className={Price}>
                {PriceChild}
            </div>

            <div className={RatesHr2}></div>

            <button
                className={BTNClass}
                onClick={handleClick}
                type="button"
            >
                Оформить
            </button>
        </div>
    )
}

export default Rates
