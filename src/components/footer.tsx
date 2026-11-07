
import LogoConnect from './logo-conected'
import Balance from './Balance'
import { useState } from 'react'
import BalanceModal from './BalanceModal'
import { useBalanceContext } from '../context/BalanceContext'

const Footer = () => {
    const { available, topUp } = useBalanceContext()

    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

    const handleTopUp = (amount: number) => {
        const success = topUp(amount)

        if (!success) {
            console.error('Не удалось пополнить баланс')
        }
    }

    return (
        <div className="footer">
            <LogoConnect
                firstclassName="logo"
                secondclassName="Name-logo"
                secondChild="RVPN"
            />

            <div className="balance-container">
                <Balance
                    balance={available}
                    onClick={() => setIsBalanceModalOpen(true)}
                />
            </div>

            <LogoConnect
                firstclassName="conected"
                secondclassName="entrance"
                firstChild="Подключение"
            />

            <BalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                onTopUp={handleTopUp}
            />
        </div>
    )
}

export default Footer
