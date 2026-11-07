import './Toast.css'

interface ToastProps {
    message: string
    onClose: () => void
}

const Toast = ({ message, onClose }: ToastProps) => {
    if (!message) return null

    return (
        <div className="toast" role="status">
            <span className="toast-icon">✓</span>
            <span className="toast-message">{message}</span>

            <button
                className="toast-close"
                onClick={onClose}
                aria-label="Закрыть"
            >
                ×
            </button>
        </div>
    )
}

export default Toast
