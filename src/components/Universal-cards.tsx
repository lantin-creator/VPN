import type { ReactNode } from 'react'

interface UniversalCardsProps {
    MapClass?: string
    HeaderClass?: string
    HeaderChildren?: ReactNode
    ImageClass?: string
    TextClass?: string
    children?: ReactNode
}

const UniversalCards = ({
    MapClass = '',
    HeaderClass = '',
    HeaderChildren,
    ImageClass = '',
    TextClass = '',
    children
}: UniversalCardsProps) => {
    return (
        <div className={MapClass}>
            <div className={HeaderClass}>
                {HeaderChildren}
            </div>

            <div className={ImageClass}></div>

            <p className={TextClass}>
                {children}
            </p>
        </div>
    )
}

export default UniversalCards
