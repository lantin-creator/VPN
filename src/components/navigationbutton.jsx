const NavigationButton = (props) => {
const{
    className = '',
    NeedALink = true,
    childreninLink,
    children,
} = props
    return(
        <>
            <button className={className}>
                {NeedALink && <a href="#Rates">
                    {childreninLink}
                </a>}
                {children}
            </button>
        </>
    )
}

export default NavigationButton