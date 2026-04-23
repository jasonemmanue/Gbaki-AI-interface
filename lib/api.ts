// ================================================================
// gbaki-searcher/lib/api.ts
// Stockage : gbaki-searcher/lib/api.ts
// Client API centralisé — connexion au backend Django
// ================================================================

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

/* ── Storage helpers ────────────────────────────── */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gbaki_token')
}
function saveToken(t: string) {
  localStorage.setItem('gbaki_token', t)
}
export function clearAuth() {
  localStorage.removeItem('gbaki_token')
  localStorage.removeItem('gbaki_profile')
}
export function saveProfile(p: UserProfile) {
  localStorage.setItem('gbaki_profile', JSON.stringify(p))
}
export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem('gbaki_profile') ?? 'null') }
  catch { return null }
}

/* ── Core fetch ─────────────────────────────────── */
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Token ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let msg = `Erreur ${res.status}`
    try {
      const d = await res.json()
      msg = d.error ?? d.detail ?? Object.values(d)[0] ?? msg
    } catch { /* ignore */ }
    throw new Error(String(msg))
  }
  if (res.status === 204) return {} as T
  return res.json()
}

/* ── Types ──────────────────────────────────────── */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  class_id: string | null
  class_code: string | null
  class_label: string | null
  is_first_login: boolean
}

export interface AuthResponse {
  token: string
  is_first_login: boolean
  profile: UserProfile
}

export interface Document {
  id: string
  title: string
  description: string | null
  file_name: string
  clickable_link: string | null
  mime_type: string | null
  file_size: number | null
  class_info: { code: string; label: string } | null
  subject: string | null
  document_type: string | null
  academic_year: string | null
  uploaded_by: string | null
  teachers: { name: string; email: string }[]
  status: string
  is_published: boolean
  created_at: string
  updated_at: string
  previewable: boolean
  badges: string[]
}

export interface DocumentsResponse {
  count: number
  results: Document[]
  suggestions?: string[]
}

export interface ClassItem {
  id: string
  code: string
  label: string
  cycle: string | null
  level_order: number | null
}

export interface SubjectItem {
  id: string
  name: string
  code: string | null
  class_id: string | null
}

/* ── Auth ───────────────────────────────────────── */

/**
 * Inscription — crée un User Django + Profile en base
 * POST /api/auth/register/
 */
export async function apiRegister(
  email: string,
  password: string,
  full_name: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  })
  saveToken(data.token)
  saveProfile(data.profile)
  return data
}

/**
 * Connexion
 * POST /api/auth/login/
 * Retourne is_first_login = true si l'utilisateur n'a pas encore de classe
 */
export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveToken(data.token)
  saveProfile(data.profile)
  return data
}

/**
 * Déconnexion
 * POST /api/auth/logout/
 */
export async function apiLogout(): Promise<void> {
  try {
    await apiFetch('/auth/logout/', { method: 'POST' })
  } finally {
    clearAuth()
  }
}

/**
 * Profil courant
 * GET /api/auth/me/
 */
export async function apiMe(): Promise<UserProfile> {
  const data = await apiFetch<UserProfile>('/auth/me/')
  saveProfile(data)
  return data
}

/**
 * Mettre à jour le profil (filière/classe après onboarding)
 * PATCH /api/profiles/{id}/
 */
export async function apiUpdateProfile(
  profileId: string,
  payload: { class_id?: string; full_name?: string; role?: string }
): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/profiles/${profileId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/* ── Documents ──────────────────────────────────── */
export interface DocFilters {
  search?: string
  class_id?: string
  subject_id?: string
  academic_year_id?: string
  document_type_id?: string
  is_published?: boolean
  status?: string
}

export async function apiGetDocuments(
  filters: DocFilters = {}
): Promise<DocumentsResponse> {
  const p = new URLSearchParams()
  if (filters.search)           p.set('search', filters.search)
  if (filters.class_id)         p.set('class_id', filters.class_id)
  if (filters.subject_id)       p.set('subject_id', filters.subject_id)
  if (filters.academic_year_id) p.set('academic_year_id', filters.academic_year_id)
  if (filters.document_type_id) p.set('document_type_id', filters.document_type_id)
  if (filters.is_published !== undefined) p.set('is_published', String(filters.is_published))
  if (filters.status)           p.set('status', filters.status)
  const qs = p.toString()
  return apiFetch<DocumentsResponse>(`/documents/${qs ? '?' + qs : ''}`)
}

/* ── Classes ────────────────────────────────────── */
export async function apiGetClasses(): Promise<ClassItem[]> {
  return apiFetch<ClassItem[]>('/classes/')
}

/* ── Subjects ───────────────────────────────────── */
export async function apiGetSubjects(classId?: string): Promise<SubjectItem[]> {
  const qs = classId ? `?class_id=${classId}` : ''
  return apiFetch<SubjectItem[]>(`/subjects/${qs}`)
}
