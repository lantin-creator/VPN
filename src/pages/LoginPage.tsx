import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoginForm from './Auth/LoginForm'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (values: {
        email: string
        password: string
    }) => {
        setError(null)
        setIsLoading(true)

        try {
            await login(values.email, values.password)
            navigate('/VPN/account')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось войти в аккаунт',
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <LoginForm
            onSubmit={handleLogin}
            error={error}
            isLoading={isLoading}
        />
    )
}

export default LoginPage
