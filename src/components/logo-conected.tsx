import type { ReactNode } from 'react'
import { Link } from 'react-router-dom';

interface LogoConnectProps {
    firstclassName?: string
    secondclassName?: string
    firstChild?: ReactNode
    secondChild?: ReactNode
    Link_auth?: string
}

const LogoConnect = ({
    firstclassName = '',
    secondclassName = '',
    firstChild,
    secondChild,
    Link_auth,
}: LogoConnectProps) => {
    return (
        <>
            <div className={firstclassName}>
                {firstChild}
            </div>

            <div className={secondclassName}>
                {Link_auth ? (
            <Link
                to={Link_auth}
            >
                    <h1>{secondChild}</h1>
            </Link>
                ) : (
                    <h1>{secondChild}</h1>
                )}
            </div>
        </>
    )
}

export default LogoConnect
