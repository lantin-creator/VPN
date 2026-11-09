import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

import {
    getCurrentUser,
    loginRequest,
    registerRequest,
    type User,
} from '../api/auth.api'

type AuthContextValue = {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthUnavailable: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'rvpn_token'

type AuthProviderProps = {
    children: ReactNode
}

const getErrorStatus = (error: unknown): number | undefined => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error
    ) {
        return (error as { status?: number }).status
    }

    return undefined
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem(TOKEN_KEY),
    )

    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthUnavailable, setIsAuthUnavailable] = useState(false)

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
        setIsAuthUnavailable(false)
    }, [])

    const refreshUser = useCallback(async () => {
        if (!token) {
            setUser(null)
            setIsAuthUnavailable(false)
            return
        }

        try {
            const response = await getCurrentUser(token)

            setUser(response.user)
            setIsAuthUnavailable(false)
        } catch (error) {
            const status = getErrorStatus(error)

            if (status === 401 || status === 403) {
                logout()
            } else {
                setIsAuthUnavailable(true)
            }

            throw error
        }
    }, [token, logout])

    useEffect(() => {
        let cancelled = false

        const initializeAuth = async () => {
            if (!token) {
                setUser(null)
                setIsAuthUnavailable(false)
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            try {
                const response = await getCurrentUser(token)

                if (!cancelled) {
                    setUser(response.user)
                    setIsAuthUnavailable(false)
                }
            } catch (error) {
                if (!cancelled) {
                    const status = getErrorStatus(error)

                    if (status === 401 || status === 403) {
                        logout()
                    } else {
                        setIsAuthUnavailable(true)
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        const handleOnline = () => {
            if (token) {
                void refreshUser().catch(() => {
                })
            }
        }

        void initializeAuth()

        window.addEventListener('online', handleOnline)

        return () => {
            cancelled = true
            window.removeEventListener('online', handleOnline)
        }
    }, [token, logout, refreshUser])

    const login = async (email: string, password: string) => {
        const response = await loginRequest(email, password)

        localStorage.setItem(TOKEN_KEY, response.token)

        setUser(response.user)
        setIsAuthUnavailable(false)
        setToken(response.token)
    }

    const register = async (email: string, password: string) => {
        const response = await registerRequest(email, password)

        localStorage.setItem(TOKEN_KEY, response.token)

        setUser(response.user)
        setIsAuthUnavailable(false)
        setToken(response.token)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthUnavailable,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}