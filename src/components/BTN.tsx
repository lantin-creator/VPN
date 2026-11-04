import NavigationButton from "./navigationbutton.tsx";

const Btn = () => {
    return(
    <>
        <NavigationButton
          className="Subscribebtn"
          childreninLink="Оформить подписку"
        />
        <NavigationButton
          className="Design"
          NeedALink={false}
          children="Оформить за 300 Руб"
        />
    </>
    )
}

export default Btn