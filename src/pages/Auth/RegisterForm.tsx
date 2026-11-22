import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

type RegisterFormValues = {
    email: string
    password: string
}

type RegisterFormProps = {
    onSubmit: (values: RegisterFormValues) => void | Promise<void>
    error?: string | null
    isLoading?: boolean
}

const RegisterForm = ({ onSubmit, error, isLoading = false }: RegisterFormProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [validationError, setValidationError] = useState<string | null>(null)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setValidationError(null)

        if (password.length < 8) {
            setValidationError('Пароль должен содержать не менее 8 символов.')
            return
        }

        if (password !== passwordConfirmation) {
            setValidationError('Пароли не совпадают.')
            return
        }

        void onSubmit({ email: email.trim(), password })
    }

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="register-title">
                <Link className="auth-home-link" to="/VPN/">
                    ← На главную
                </Link>
                <p className="auth-brand">RVPN</p>
                <h1 className="auth-title" id="register-title">Создать аккаунт</h1>
                <p className="auth-description">Зарегистрируйтесь, чтобы пользоваться возможностями RVPN.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        Email
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            maxLength={254}
                        />
                    </label>

                    <label className="auth-field">
                        Пароль
                        <input
                            className="auth-input"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            placeholder="Минимум 8 символов"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            minLength={8}
                            maxLength={72}
                        />
                    </label>

                    <label className="auth-field">
                        Повторите пароль
                        <input
                            className="auth-input"
                            type="password"
                            name="passwordConfirmation"
                            autoComplete="new-password"
                            placeholder="Введите пароль ещё раз"
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            required
                            minLength={8}
                            maxLength={72}
                        />
                    </label>

                    {(validationError || error) && (
                        <p className="auth-error" role="alert">{validationError || error}</p>
                    )}

                    <button className="auth-submit" type="submit" disabled={isLoading}>
                        {isLoading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="auth-switch">
                    Уже есть аккаунт? <Link className="auth-link" to="/VPN/login">Войти</Link>
                </p>
            </section>
        </main>
    )
}

export default RegisterForm
