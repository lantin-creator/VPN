import LogoConnect from './logo-conected'

const Footer = () => {
    return (
        <div className="footer">
            <LogoConnect
                firstclassName="logo"
                secondclassName="Name-logo"
                secondChild="RVPN"
            />

            <LogoConnect
                firstclassName="conected"
                secondclassName="entrance"
                secondChild="Вход"
                Link_auth="/VPN/login"
            />
        </div>
    )
}

export default Footer
