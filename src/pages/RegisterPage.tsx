import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RegisterForm from './Auth/RegisterForm'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (values: {
        email: string
        password: string
    }) => {
        setError(null)
        setIsLoading(true)

        try {
            await register(values.email, values.password)
            navigate('/VPN/account')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось создать аккаунт',
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <RegisterForm
            onSubmit={handleRegister}
            error={error}
            isLoading={isLoading}
        />
    )
}

export default RegisterPage
