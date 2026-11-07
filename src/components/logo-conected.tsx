
import type { ReactNode } from 'react'

interface LogoConnectProps {
    firstclassName?: string
    secondclassName?: string
    firstChild?: ReactNode
    secondChild?: ReactNode
}

const LogoConnect = ({
    firstclassName = '',
    secondclassName = '',
    firstChild,
    secondChild,
}: LogoConnectProps) => {
    return (
        <>
            <div className={firstclassName}>
                {firstChild}
            </div>

            <div className={secondclassName}>
                <h1>{secondChild}</h1>
            </div>
        </>
    )
}

export default LogoConnect
