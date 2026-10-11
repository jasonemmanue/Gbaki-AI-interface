/* Petits utilitaires d'affichage partagés par les pages du tableau de bord. */
import type { Document } from '../lib/api'

export function formatSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

export function teacherNames(doc: Pick<Document, 'teachers'>): string {
  return doc.teachers.length ? doc.teachers.map(t => t.name).join(', ') : ''
}

/** Année courte affichée dans le tableau : « 2024-2025 » → « 2025 » (année de fin, comme les maquettes). */
export function shortYear(label: string | null): string {
  if (!label) return ''
  const m = label.match(/(\d{4})\D+(\d{4})/)
  return m ? m[2] : label
}

export function formatDay(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export function fileExt(doc: Pick<Document, 'file_name' | 'is_folder'>): string {
  if (doc.is_folder) return 'DOSSIER'
  const m = doc.file_name.match(/\.([a-z0-9]+)$/i)
  return m ? m[1].toUpperCase() : 'FICHIER'
}

export function initials(name: string | null | undefined, email = ''): string {
  const src = (name || email.split('@')[0] || '?').replace(/[._-]+/g, ' ').trim()
  const parts = src.split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase()
}

export function firstName(name: string | null | undefined, email = ''): string {
  const src = (name && !name.includes('@') ? name : email.split('@')[0]).replace(/[._-]+/g, ' ').trim()
  const first = src.split(/\s+/)[0] ?? ''
  return first ? first[0].toUpperCase() + first.slice(1) : ''
}

/** Découpe une ligne en morceaux surlignés selon les plages [début, fin[. */
export function splitBySpans(text: string, spans: [number, number][]): { text: string; mark: boolean }[] {
  const out: { text: string; mark: boolean }[] = []
  let pos = 0
  for (const [s, e] of [...spans].sort((a, b) => a[0] - b[0])) {
    if (s < pos) continue
    if (s > pos) out.push({ text: text.slice(pos, s), mark: false })
    out.push({ text: text.slice(s, e), mark: true })
    pos = e
  }
  if (pos < text.length) out.push({ text: text.slice(pos), mark: false })
  return out
}
