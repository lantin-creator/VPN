import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'

import type { ReactNode } from 'react'

import HomePage from './components/Home-page'
import NotFoundPage from './pages/NotFound/NotFoundPage'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'

import { AuthProvider, useAuth } from './context/AuthContext'
import { BalanceProvider } from './context/BalanceContext'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <div>Проверяем авторизацию…</div>
    }

    if (!user) {
        return <Navigate to="/VPN/login" replace />
    }

    return children
}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/VPN/" element={<HomePage />} />

                <Route path="/VPN/login" element={<LoginPage />} />

                <Route path="/VPN/register" element={<RegisterPage />} />

                <Route
                    path="/VPN/account"
                    element={
                        <ProtectedRoute>
                            <AccountPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}

const App = () => {
    return (
        <AuthProvider>
            <BalanceProvider>
                <AppRoutes />
            </BalanceProvider>
        </AuthProvider>
    )
}

export default App
