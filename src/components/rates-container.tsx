import Rates from './rates'

const RatesContainer = () => {
  return (
    <div className="rates-container">
      <Rates
        Ratesclass="rates1"
        Ratessubheading="rates1-subheading"
        subheadingChild="1 Месяц"
        RatesHr1="rates1-hr"
        Text1="text1"
        Text1Child="Чат с нейросетью"
        Guarantee="Guarantee"
        GuaranteeChild="5 дней гарантия возврата средств"
        Price="price"
        PriceChild="299 Руб."
        RatesHr2="rates2-hr"
        BTNClass="btn-Design"
      />
      <Rates
        Ratesclass="rates2"
        Ratessubheading="rates2-subheading"
        subheadingChild="3 Месяца"
        RatesHr1="rates3-hr"
        Text1="text2"
        Text1Child="Чат с нейросетью"
        Guarantee="Guarantee2"
        GuaranteeChild="Гарантия возврата средств"
        ItSupportsCrossPlatformFunctionality={true}
        CrossPlatformCapability="Cross-platform-capability"
        Price="price2"
        PriceChild="499 Руб."
        RatesHr2="rates4-hr"
        BTNClass="btn-Design2"
      />
      <Rates
        Ratesclass="rates3"
        Ratessubheading="rates3-subheading"
        subheadingChild="1 год"
        RatesHr1="rates5-hr"
        Text1="text3"
        Text1Child="Чат с нейросетью"
        Guarantee="Guarantee3"
        GuaranteeChild="Гарантия возврата средств"
        ItSupportsCrossPlatformFunctionality={true}
        CrossPlatformCapability="Cross-platform-capability2"
        Price="price3"
        PriceChild="1699 Руб."
        RatesHr2="rates6-hr"
        BTNClass="btn-Design3"
      />
    </div>
  )
}

export default RatesContainer