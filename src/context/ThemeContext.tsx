import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light'

type ThemeContextType = {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('rvpn_theme')

        return savedTheme === 'light' ? 'light' : 'dark'
    })

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        localStorage.setItem('rvpn_theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark',
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme должен использоваться внутри ThemeProvider')
    }

    return context
}