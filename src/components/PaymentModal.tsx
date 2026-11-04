import { useEffect, useState } from 'react'
import './PaymentModal.css'

const PaymentModal = ({ isOpen, plan, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  // Закрытие по Esc + блокировка скролла
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setName(''); setCard(''); setExpiry(''); setCvv('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, card, expiry, cvv })
  }

  // Маски ввода
  const handleCard = (v) =>
    setCard(v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())
  const handleExpiry = (v) =>
    setExpiry(v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d{1,2})/, '$1/$2'))
  const handleCvv = (v) => setCvv(v.replace(/\D/g, '').slice(0, 3))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">×</button>

        <h2 className="modal-title">Оплата подписки</h2>
        <p className="modal-plan">
          Тариф: <strong>{plan?.title}</strong> — <strong>{plan?.price}</strong>
        </p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Имя владельца карты
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="IVAN IVANOV"
              required
            />
          </label>

          <label>
            Номер карты
            <input
              type="text"
              value={card}
              onChange={(e) => handleCard(e.target.value)}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              required
            />
          </label>

          <div className="modal-row">
            <label>
              Срок
              <input
                type="text"
                value={expiry}
                onChange={(e) => handleExpiry(e.target.value)}
                placeholder="MM/YY"
                inputMode="numeric"
                required
              />
            </label>
            <label>
              CVV
              <input
                type="password"
                value={cvv}
                onChange={(e) => handleCvv(e.target.value)}
                placeholder="•••"
                inputMode="numeric"
                required
              />
            </label>
          </div>

          <button type="submit" className="modal-submit">Оформить</button>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal