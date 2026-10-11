'use client'
/* Contexte du tableau de bord (profil connecté) et logo Gbaki-AI. */
import { createContext, useContext } from 'react'
import s from '../app/dashboard/shell.module.css'
import type { UserProfile } from '../lib/api'

export interface ShellValue { profile: UserProfile }
export const ShellContext = createContext<ShellValue | null>(null)

export function useShell(): ShellValue {
  const v = useContext(ShellContext)
  if (!v) throw new Error('useShell hors du tableau de bord')
  return v
}

/**
 * Logo Gbaki-AI (anneau, jambage à crochet, point bleu), redessiné en SVG d'après public/logo.png.
 * Le trait prend la couleur du texte (currentColor) : blanc sur la barre latérale, encre ailleurs.
 */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg className={s.mark} width={size} height={size} viewBox="232 225 605 605" aria-hidden role="img">
      <circle cx="510" cy="520" r="182" fill="none" stroke="currentColor" strokeWidth="47" />
      <path d="M688 362 V690 C688 752 660 781 610 781 H543" fill="none" stroke="currentColor"
        strokeWidth="47" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="738" cy="286" r="36" fill="#5468f2" />
    </svg>
  )
}
