import type { ReactNode } from 'react'

interface NavigationButtonProps {
    className?: string
    NeedALink?: boolean
    childreninLink?: ReactNode
    children?: ReactNode
}

const NavigationButton = ({
    className = '',
    NeedALink = true,
    childreninLink,
    children,
}: NavigationButtonProps) => {
    return (
        <>
            <button className={className}>
                {NeedALink && (
                    <a href="#Rates">
                        {childreninLink}
                    </a>
                )}

                {children}
            </button>
        </>
    )
}

export default NavigationButton
