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

export function BrandMark() {
  return (
    <span className={s.mark} aria-hidden>
      g<span className={s.markDot} />
    </span>
  )
}
