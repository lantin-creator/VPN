import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AccountPanel from './Auth/AccountPanel'
import { getProfile, updateProfile, type ProfileUpdate } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

const AccountPage = () => {
    const { token, user, logout, isLoading, refreshUser } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>['user'] | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token || !user) return

        let cancelled = false

        getProfile(token)
            .then((response) => {
                if (!cancelled) {
                    setProfile(response.user)
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : 'Не удалось загрузить профиль',
                    )
                }
            })

        return () => {
            cancelled = true
        }
    }, [token, user])

    const handleSave = async (values: Omit<ProfileUpdate, 'email'>) => {
        if (!token) return

        setError(null)
        setIsSaving(true)

        try {
            const response = await updateProfile(token, values)
            setProfile(response.user)
            await refreshUser()
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить профиль',
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/VPN/login')
    }

    if (isLoading || (user && !profile && !error)) {
        return <main className="account-page">Загрузка профиля…</main>
    }

    if (!user) {
        return null
    }

    if (!profile) {
        return <main className="account-page">{error || 'Не удалось загрузить профиль'}</main>
    }

    return (
        <AccountPanel
            profile={profile}
            onSave={handleSave}
            onLogout={handleLogout}
            isLoading={isSaving}
            error={error}
        />
    )
}

export default AccountPage
