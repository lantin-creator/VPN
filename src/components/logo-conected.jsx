const LogoConnect = (props) => {
    const {
        firstclassName = '',
        secondclassName = '',
        firstChild,
        secondChild,
    } = props
    return(
    <>
        <div className={firstclassName}>{firstChild}</div>
        <div className={secondclassName}><h1>{secondChild}</h1></div>
    </>
    )
}

export default LogoConnect