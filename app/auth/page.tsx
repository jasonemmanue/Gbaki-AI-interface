'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './auth.module.css'

/* ── API ─────────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

async function doLogin(email: string, password: string) {
  const res = await fetch(`${API}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erreur de connexion')
  if (typeof window !== 'undefined') {
    localStorage.setItem('gbaki_token', data.token)
    localStorage.setItem('gbaki_profile', JSON.stringify(data.profile))
  }
  return data
}

async function doRegister(email: string, password: string, full_name: string) {
  const res = await fetch(`${API}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la création du compte')
  if (typeof window !== 'undefined') {
    localStorage.setItem('gbaki_token', data.token)
    localStorage.setItem('gbaki_profile', JSON.stringify(data.profile))
  }
  return data
}

/* ── Logo ────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <Image
        src="/logo.png"
        alt="ENSEA Data Science Club"
        width={120}
        height={120}
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

/* ── InputField ──────────────────────────────────────────────── */
function InputField({
  label, type, placeholder, value, onChange, icon, error, showToggle,
}: {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  error?: string
  showToggle?: boolean
}) {
  const [show, setShow] = useState(false)
  const inputType = showToggle ? (show ? 'text' : 'password') : type

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
        <span className={styles.inputIcon}>{icon}</span>
        <input
          className={styles.input}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'}
        />
        {showToggle && (
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShow(!show)}
            tabIndex={-1}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <EyeIcon visible={show} />
          </button>
        )}
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}

/* ── LoginForm ───────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState<{ email?: string; password?: string; server?: string }>({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    if (!email)    e.email    = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide.'
    if (!password) e.password = 'Le mot de passe est requis.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const data = await doLogin(email, password)
      setSuccess(true)
      setTimeout(() => {
        router.push(data.is_first_login ? '/onboarding' : '/splash')
      }, 800)
    } catch (err: unknown) {
      setErrors({ server: err instanceof Error ? err.message : 'Erreur de connexion' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.successTitle}>Connexion réussie !</p>
        <p className={styles.successSub}>Bienvenue sur Gbaki AI.</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {errors.server && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600,
        }}>
          ⚠ {errors.server}
        </div>
      )}
      <InputField
        label="Email institutionnel" type="email"
        placeholder="prenom.nom@universite.edu"
        value={email} onChange={setEmail}
        icon={<MailIcon />} error={errors.email}
      />
      <InputField
        label="Mot de passe" type="password"
        placeholder="••••••••"
        value={password} onChange={setPassword}
        icon={<LockIcon />} error={errors.password} showToggle
      />
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Se connecter'}
      </button>
      <div className={styles.forgotWrapper}>
        <a href="/auth/forgot-password" className={styles.forgotLink}>
          Mot de passe oublié ?
        </a>
      </div>
    </form>
  )
}

/* ── RegisterForm ────────────────────────────────────────────── */
function RegisterForm() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name    = 'Le nom complet est requis.'
    if (!email)       e.email   = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide.'
    if (!password)    e.password = 'Le mot de passe est requis.'
    else if (password.length < 8) e.password = 'Au moins 8 caractères.'
    if (!confirm)     e.confirm  = 'Veuillez confirmer le mot de passe.'
    else if (confirm !== password) e.confirm = 'Les mots de passe ne correspondent pas.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await doRegister(email, password, name)
      setSuccess(true)
    } catch (err: unknown) {
      setErrors({ server: err instanceof Error ? err.message : 'Erreur lors de la création du compte' })
    } finally {
      setLoading(false)
    }
  }

  const strength       = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e']

  if (success) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.successTitle}>Compte créé avec succès !</p>
        <p className={styles.successSub}>
          Connectez-vous pour finaliser votre inscription.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {errors.server && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600,
        }}>
          ⚠ {errors.server}
        </div>
      )}
      <InputField
        label="Nom complet" type="text" placeholder="Prénom Nom"
        value={name} onChange={setName}
        icon={<UserIcon />} error={errors.name}
      />
      <InputField
        label="Email institutionnel" type="email"
        placeholder="prenom.nom@universite.edu"
        value={email} onChange={setEmail}
        icon={<MailIcon />} error={errors.email}
      />
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mot de passe</label>
        <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
          <span className={styles.inputIcon}><LockIcon /></span>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {password && (
          <div className={styles.strengthBar}>
            <div
              className={styles.strengthFill}
              style={{ width: `${(strength / 3) * 100}%`, background: strengthColors[strength] }}
            />
            <span className={styles.strengthLabel} style={{ color: strengthColors[strength] }}>
              {strengthLabels[strength]}
            </span>
          </div>
        )}
        {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
      </div>
      <InputField
        label="Confirmer le mot de passe" type="password" placeholder="••••••••"
        value={confirm} onChange={setConfirm}
        icon={<LockIcon />} error={errors.confirm} showToggle
      />
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Créer un compte'}
      </button>
    </form>
  )
}

/* ── Page principale ─────────────────────────────────────────── */
export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />

      <main className={styles.card}>
        <div className={styles.header}>
          <Logo />
          <h1 className={styles.title}>Gbaki AI</h1>
          <p className={styles.subtitle}>Recherche intelligente dans vos documents académiques</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Connexion
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Inscription
          </button>
        </div>

        <div className={styles.formContainer} key={tab}>
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </main>

      <footer className={styles.footer}>
        École Nationale Supérieur de Statistique et d&apos;Économie Appliquée
      </footer>
    </div>
  )
}