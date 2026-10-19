import { useSubscriptionContext } from '../context/SubscriptionContext'

const Rates = (props) => {
  const {
    Ratesclass = '',
    Ratessubheading = '',
    subheadingChild,      // ← исправил опечатку
    RatesHr1 = '',
    Text1 = '',
    Text1Child,
    Guarantee = '',
    GuaranteeChild,
    Price = '',
    PriceChild,
    RatesHr2 = '',
    BTNClass = '',
    ItSupportsCrossPlatformFunctionality = false,
    CrossPlatformCapability = '',
  } = props

  const { openModal } = useSubscriptionContext()

  const handleClick = () => {
    openModal({ title: subheadingChild, price: PriceChild })
  }

  return (
    <div className={Ratesclass}>
      <div className={Ratessubheading}>{subheadingChild}</div>
      <hr className={RatesHr1} />
      <div className={Text1}>
        <span style={{ fontWeight: 'normal' }}>✓</span>
        {Text1Child}
        <div className="AI">AI</div>
      </div>
      <div className={Guarantee}>
        <span style={{ fontWeight: 'normal' }}>✓</span>
        {GuaranteeChild}
      </div>
      {ItSupportsCrossPlatformFunctionality && (
        <div className={CrossPlatformCapability}>
          <span style={{ fontWeight: 'normal' }}>✓</span>Кроссплатформенность
        </div>
      )}
      <div className={Price}>{PriceChild}</div>
      <div className={RatesHr2}></div>
      <button className={BTNClass} onClick={handleClick}>
        Оформить
      </button>
    </div>
  )
}

export default Rates