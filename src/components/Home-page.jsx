import './Home-page.css'
import Footer from './footer'
import Btn from './BTN'
import OfferMaps from './Offer-maps'
import RatesContainer from './rates-container'
import PaymentModal from './PaymentModal'
import Toast from './Toast'
import { SubscriptionProvider, useSubscriptionContext } from '../context/SubscriptionContext'

const HomePageContent = () => {
  const { isModalOpen, selectedPlan, closeModal, submitPayment, toast, hideToast } =
    useSubscriptionContext()

  return (
    <>
      <div className="body">
        <Footer />
        <div className="RVPN-text">
          <span style={{ color: 'rgb(8, 56, 213, 1)' }}>RVPN </span> - <span className="Bypassing-blockages">Обход блокировок</span> менее
          <div style={{ display: 'flex' }}>чем за <div className="ten-seconds">10 секунд.</div></div>
        </div>
        <div className="Our-service">
          Наш сервис предоставляет 
          <div>лучшую связь и соединение</div> 
          <div>по самой <span className="favorable-price">выгодной цене</span></div>
        </div>
        <Btn/>
        <div className="Foto-background"></div>
      </div>
      <div className="Advantages">
        <div className="advantages"><h1>Преимущества</h1></div>
        <OfferMaps />
      </div>
      <div id="Rates">
        <div className="rates–Subheading"><h1>Тарифы</h1></div>
        <RatesContainer />
      </div>
      <div id="Connection-method">
        <div className="Connection-method">Способ подключения</div>
        <div className="Stage1">Этап 1: Покупка</div>
        <div className="Stage1-text">Купите соответствующий тариф</div>
        <div className="Stage2">Этап 2: Подключение</div>
        <div className="Stage2-text">Установите приложение Х <div className="Stge2-text2">и вставьте ссылку в приложение</div></div>
        <div className="Stage3">Этап 3: Готово</div>
        <div className="Stage3-text">Пользуйтесь ВПН</div>
        <hr className="hr" />
        <div className="footer2">
          <div className="question">Остались вопросы?</div>
          <div className="question2">Пишите в тех поддержку</div>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        plan={selectedPlan}
        onClose={closeModal}
        onSubmit={submitPayment}
      />
      <Toast message={toast?.message} onClose={hideToast} />
    </>
  )
}

const HomePage = () => (
  <SubscriptionProvider>
    <HomePageContent />
  </SubscriptionProvider>
)

export default HomePage