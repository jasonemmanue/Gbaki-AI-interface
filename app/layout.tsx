/*
 * GBAKI-AI — app/layout.tsx
 * Polices Barlow / Barlow Condensed, thème (3 modes) et langue.
 */
import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { LangProvider } from '../context/LangContext'
import { ThemeProvider, THEME_INIT_SCRIPT } from '../context/ThemeContext'

const barlow = Barlow({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-barlow', display: 'swap',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barlow-condensed', display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gbaki-AI',
  description: 'Bibliothèque de la filière AS de l\'ENSEA : cours, TD, sujets et corrigés, avec recherche dans le texte des documents. Porté par l\'ENSEA Data Science Club.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${barlow.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
