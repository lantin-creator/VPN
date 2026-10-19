import { Link } from 'react-router-dom'
import './NotFoundPage.css'

const NotFoundPage = () => {
  return (
    <div className="notfound">
      <div className="notfound-bg"></div>
      <div className="notfound-container">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Страница не найдена</h1>
        <p className="notfound-text">
          Возможно, страница была удалена, переименована
          <br />
          или вы ошиблись в адресе.
        </p>
        <Link to="/" className="notfound-btn">
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage