import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

type LoginFormValues = {
    email: string
    password: string
}

type LoginFormProps = {
    onSubmit: (values: LoginFormValues) => void | Promise<void>
    error?: string | null
    isLoading?: boolean
}

const LoginForm = ({ onSubmit, error, isLoading = false }: LoginFormProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        void onSubmit({ email: email.trim(), password })
    }

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <Link className="auth-home-link" to="/VPN/">
                    ← На главную
                </Link>
                <p className="auth-brand">RVPN</p>
                <h1 className="auth-title" id="login-title">Вход в аккаунт</h1>
                <p className="auth-description">Войдите, чтобы управлять подпиской и балансом.</p>

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
                            autoComplete="current-password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            maxLength={72}
                        />
                    </label>

                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <button className="auth-submit" type="submit" disabled={isLoading}>
                        {isLoading ? 'Входим…' : 'Войти'}
                    </button>
                </form>

                <p className="auth-switch">
                    Нет аккаунта? <Link className="auth-link" to="/VPN/register">Зарегистрироваться</Link>
                </p>
            </section>
        </main>
    )
}

export default LoginForm
