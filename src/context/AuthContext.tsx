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

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem(TOKEN_KEY),
    )

    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
    }, [])

    const refreshUser = useCallback(async () => {
        if (!token) {
            setUser(null)
            return
        }

        try {
            const response = await getCurrentUser(token)
            setUser(response.user)
        } catch (error) {
            const status = (error as { status?: number }).status

            if (status === 401 || status === 403) {
                logout()
            }

            throw error
        }
    }, [token, logout])

    useEffect(() => {
        let cancelled = false

        const initializeAuth = async () => {
            if (!token) {
                setUser(null)
                setIsLoading(false)
                return
            }

            try {
                const response = await getCurrentUser(token)

                if (!cancelled) {
                    setUser(response.user)
                }
            } catch {
                if (!cancelled) {
                    logout()
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        setIsLoading(true)
        void initializeAuth()

        return () => {
            cancelled = true
        }
    }, [token, logout])

    const login = async (email: string, password: string) => {
        const response = await loginRequest(email, password)

        localStorage.setItem(TOKEN_KEY, response.token)
        setToken(response.token)
        setUser(response.user)
    }

    const register = async (email: string, password: string) => {
        const response = await registerRequest(email, password)

        localStorage.setItem(TOKEN_KEY, response.token)
        setToken(response.token)
        setUser(response.user)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
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
