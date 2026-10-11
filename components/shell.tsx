'use client'
/* Contexte du tableau de bord (profil connecté) et logo Gbaki-AI. */
import { createContext, useContext } from 'react'
import s from '../app/dashboard/shell.module.css'
import type { UserProfile } from '../lib/api'
import GbakiLogo from './GbakiLogo'

export interface ShellValue { profile: UserProfile }
export const ShellContext = createContext<ShellValue | null>(null)

export function useShell(): ShellValue {
  const v = useContext(ShellContext)
  if (!v) throw new Error('useShell hors du tableau de bord')
  return v
}

/** Logo Gbaki-AI de la barre latérale (blanc sur fond sombre, voir .mark). */
export function BrandMark({ size = 34 }: { size?: number }) {
  return <GbakiLogo size={size} className={s.mark} />
}
