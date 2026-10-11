/*
 * GBAKI-AI — context/ThemeContext.tsx
 * Trois thèmes : clair, sombre, bleu nuit. Appliqué via data-theme sur <html>.
 * Le script THEME_INIT_SCRIPT (layout) applique le thème avant l'affichage, sans flash.
 */
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'blue'
export const THEMES: Theme[] = ['light', 'dark', 'blue']
const STORAGE_KEY = 'gbaki_theme'

export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark'||t==='blue'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved && THEMES.includes(saved)) setThemeState(saved)
    } catch { /* stockage indisponible : thème clair */ }
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignoré */ }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme !== 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
