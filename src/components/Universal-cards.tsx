const UniversalCards = (props) => {
const {
    MapClass = '',
    HeaderClass = '',
    HeaderChildren,
    ImageClass = '',
    TextClass = '',
    children
} = props
    return(
        <div className={MapClass}>
          <div className={HeaderClass}>{HeaderChildren}</div>
          <div className={ImageClass}></div>
          <p className={TextClass}>
            {children}
          </p>
        </div>
    )
}

export default UniversalCards