import LogoConnect from "./logo-conected";

const Footer = () => {
    return(
        <div className="footer">
          <LogoConnect 
            firstclassName="logo"
            secondclassName="Name-logo"
            secondChild="RVPN"
          />
          <LogoConnect
            firstclassName="conected"
            secondclassName="entrance"
            firstChild="Подключение"
          />
        </div>
    )
}

export default Footer