/*
 * GBAKI-Searcher — app/layout.tsx
 * Stockage : gbaki-searcher/app/layout.tsx
 * ✅ Ajout : ThemeProvider + LangProvider
 */
import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '../context/LangContext'

export const metadata: Metadata = {
  title: 'GBAKI-Searcher — Manuel numérique ENSEA',
  description: 'Trouvez vos supports pédagogiques en quelques secondes. ENSEA Data Science Club.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
            {children}
          </LangProvider>
      </body>
    </html>
  )
}