// gbaki-searcher/lib/api.ts
// Client API pour l'interface utilisateur (étudiant)

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

/* ── Token helpers ────────────────────────────────── */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gbaki_token')
}
export function saveToken(t: string) { localStorage.setItem('gbaki_token', t) }
export function clearAuth() {
  localStorage.removeItem('gbaki_token')
  localStorage.removeItem('gbaki_profile')
}
export function saveProfile(p: UserProfile) {
  localStorage.setItem('gbaki_profile', JSON.stringify(p))
}
export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem('gbaki_profile') ?? 'null') } catch { return null }
}

/* ── Core fetch ───────────────────────────────────── */
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
    try { const d = await res.json(); msg = d.error ?? d.detail ?? msg } catch { /**/ }
    throw new Error(msg)
  }
  if (res.status === 204) return {} as T
  return res.json()
}

/* ── Types ────────────────────────────────────────── */
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
  class_info: { code: string; label: string; id: string } | null
  subject: string | null
  document_type: string | null
  academic_year: string | null
  uploaded_by: string | null
  teachers: { id: string; name: string; email: string; department: string }[]
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
  id: string; code: string; label: string
  cycle: string | null; level_order: number | null
}

export interface SubjectItem {
  id: string; code: string | null; name: string
  description: string | null; class_id: string | null
}

export interface AcademicYear {
  id: string; label: string; start_year: number; end_year: number; is_active: boolean
}

export interface DocumentType {
  id: string; code: string | null; label: string
}

export interface Teacher {
  id: string; full_name: string; email: string | null; department: string | null
}

export interface DownloadResponse {
  url: string; file_name: string; mime_type: string | null
}

/* ── Auth ─────────────────────────────────────────── */
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login/', {
    method: 'POST', body: JSON.stringify({ email, password }),
  })
  saveToken(data.token); saveProfile(data.profile); return data
}

export async function apiRegister(email: string, password: string, full_name: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register/', {
    method: 'POST', body: JSON.stringify({ email, password, full_name }),
  })
  saveToken(data.token); saveProfile(data.profile); return data
}

export async function apiLogout(): Promise<void> {
  try { await apiFetch('/auth/logout/', { method: 'POST' }) } finally { clearAuth() }
}

export async function apiMe(): Promise<UserProfile> {
  const d = await apiFetch<UserProfile>('/auth/me/')
  saveProfile(d); return d
}

export async function apiUpdateProfile(id: string, payload: { class_id?: string; full_name?: string }): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/profiles/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) })
}

/* ── Documents ────────────────────────────────────── */
export interface DocFilters {
  search?: string
  class_id?: string
  subject_id?: string
  academic_year_id?: string
  document_type_id?: string
  teacher_id?: string
  is_published?: string
}

export async function apiGetDocuments(filters: DocFilters = {}): Promise<DocumentsResponse> {
  const p = new URLSearchParams()
  // Toujours forcer is_published=true pour les users
  p.set('is_published', 'true')
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && k !== 'is_published') p.set(k, v)
  })
  return apiFetch<DocumentsResponse>(`/documents/?${p.toString()}`)
}

/* ── Download / Preview ───────────────────────────── */
export async function apiGetDocumentUrl(id: string, mode: 'preview' | 'download' = 'preview'): Promise<DownloadResponse> {
  return apiFetch<DownloadResponse>(`/documents/${id}/download/?mode=${mode}`)
}

/* ── Référentiels ─────────────────────────────────── */
export async function apiGetClasses(): Promise<ClassItem[]> {
  return apiFetch<ClassItem[]>('/classes/')
}

export async function apiGetSubjects(classId?: string): Promise<SubjectItem[]> {
  return apiFetch<SubjectItem[]>(`/subjects/${classId ? '?class_id=' + classId : ''}`)
}

export async function apiGetYears(): Promise<AcademicYear[]> {
  return apiFetch<AcademicYear[]>('/academic-years/')
}

export async function apiGetDocTypes(): Promise<DocumentType[]> {
  return apiFetch<DocumentType[]>('/document-types/')
}

export async function apiGetTeachers(): Promise<Teacher[]> {
  return apiFetch<Teacher[]>('/teachers/')
}

/* ── Autocomplete ─────────────────────────────────── */
export async function apiAutocomplete(q: string): Promise<string[]> {
  if (q.length < 2) return []
  const d = await apiFetch<{ suggestions: string[] }>(`/autocomplete/documents/?q=${encodeURIComponent(q)}`)
  return d.suggestions
}
