'use client'

import { useState, useRef, useEffect } from 'react'
import GbakiLogo from '../../components/GbakiLogo'
import { useRouter } from 'next/navigation'
import styles from './auth.module.css'
import otp from '../forgot/forgot.module.css'

/* ── API ─────────────────────────────────────────────────────── */
import { API_BASE as API, ENSEA_EMAIL_RE } from '../../lib/api'

/* Réponse d'auth : soit une session (token + profil), soit un code à saisir
   (verification_required) tant que l'adresse ENSEA n'est pas vérifiée. */
type AuthResult = {
  token?: string
  profile?: unknown
  is_first_login?: boolean
  verification_required?: boolean
  email?: string
}

async function postAuth(path: string, body: object, fallback: string): Promise<AuthResult> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? fallback)
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('gbaki_token', data.token)
    localStorage.setItem('gbaki_profile', JSON.stringify(data.profile))
  }
  return data
}

const doLogin = (email: string, password: string) =>
  postAuth('/auth/login/', { email, password }, 'Erreur de connexion')

const doRegister = (email: string, password: string, full_name: string) =>
  postAuth('/auth/register/', { email, password, full_name }, 'Erreur lors de la création du compte')

const doVerifyEmail = (email: string, code: string) =>
  postAuth('/auth/verify-email/', { email, code }, 'Code invalide.')

const doResendVerification = (email: string) =>
  postAuth('/auth/resend-verification/', { email }, "Impossible d'envoyer le code.")

/* ── Logo ────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <span style={{ color: 'var(--x-text)', display: 'inline-flex' }}>
        <GbakiLogo size={84} title="Gbaki-AI" />
      </span>
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

/* ── Saisie du code de vérification (4 chiffres reçus par email) ── */
function VerifyEmailStep({ email, onVerified }: { email: string; onVerified: (r: AuthResult) => void }) {
  const [digits,  setDigits]  = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')
  const [countdown, setCountdown] = useState(60)
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
                useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => { refs[0].current?.focus() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const verify = async (code: string) => {
    if (code.length < 4) { setError('Entrez les 4 chiffres.'); return }
    setError(''); setInfo(''); setLoading(true)
    try {
      onVerified(await doVerifyEmail(email, code))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code invalide.')
      setDigits(['', '', '', ''])
      setTimeout(() => refs[0].current?.focus(), 50)
    } finally { setLoading(false) }
  }

  const onDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 3) refs[i + 1].current?.focus()
    if (val && i === 3 && next.every(d => d)) verify(next.join(''))
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) { e.preventDefault(); setDigits(pasted.split('')); verify(pasted) }
  }

  const resend = async () => {
    if (countdown > 0) return
    setError(''); setInfo(''); setDigits(['', '', '', '']); setLoading(true)
    try {
      await doResendVerification(email)
      setCountdown(60)
      setInfo('Un nouveau code a été envoyé.')
      setTimeout(() => refs[0].current?.focus(), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.form}>
      <p className={styles.subtitle} style={{ textAlign: 'center' }}>
        Pour confirmer que cette adresse t&apos;appartient, saisis le code à 4 chiffres envoyé à{' '}
        <strong>{email}</strong>.
      </p>
      {error && <div className={otp.error}>{error}</div>}
      {info  && <div className={otp.success}>{info}</div>}
      <div className={otp.otpRow} onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={`${otp.otpInput} ${d ? otp.otpFilled : ''}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={d}
            onChange={e => onDigit(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus() }}
            disabled={loading}
            aria-label={`Chiffre ${i + 1}`}
          />
        ))}
      </div>
      <button
        type="button"
        className={styles.submitBtn}
        onClick={() => verify(digits.join(''))}
        disabled={loading || digits.some(d => !d)}
      >
        {loading ? <span className={styles.spinner} /> : 'Vérifier mon adresse'}
      </button>
      <div className={otp.resend}>
        Pas reçu le code ? Regarde aussi les spams.{' '}
        <button type="button" className={otp.resendBtn} onClick={resend} disabled={countdown > 0 || loading}>
          {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer'}
        </button>
      </div>
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
  const [verifyEmail, setVerifyEmail] = useState('')

  const enter = (data: AuthResult) => {
    setSuccess(true)
    setTimeout(() => {
      router.push(data.is_first_login ? '/onboarding' : '/splash')
    }, 800)
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!email)    e.email    = "L'email est requis."
    else if (!ENSEA_EMAIL_RE.test(email.trim())) e.email = 'Utilise ton adresse institutionnelle nom@ensea.edu.ci.'
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
      const data = await doLogin(email.trim().toLowerCase(), password)
      if (data.verification_required) setVerifyEmail(data.email ?? email.trim().toLowerCase())
      else enter(data)
    } catch (err: unknown) {
      setErrors({ server: err instanceof Error ? err.message : 'Erreur de connexion' })
    } finally {
      setLoading(false)
    }
  }

  if (verifyEmail && !success) return <VerifyEmailStep email={verifyEmail} onVerified={enter} />

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
          background: 'var(--x-error-bg)', border: '1px solid var(--x-error-border)', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: 'var(--x-error)', fontWeight: 600,
        }}>
          ⚠ {errors.server}
        </div>
      )}
      <InputField
        label="Email institutionnel" type="email"
        placeholder="nom@ensea.edu.ci"
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
        <a href="/forgot" className={styles.forgotLink}>
          Mot de passe oublié ?
        </a>
      </div>
    </form>
  )
}

/* ── RegisterForm ────────────────────────────────────────────── */
function RegisterForm() {
  const router = useRouter()
  const [verifyEmail, setVerifyEmail] = useState('')
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
    else if (!ENSEA_EMAIL_RE.test(email.trim())) e.email = 'Utilise ton adresse institutionnelle nom@ensea.edu.ci.'
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
      const data = await doRegister(email.trim().toLowerCase(), password, name)
      if (data.verification_required) setVerifyEmail(data.email ?? email.trim().toLowerCase())
      else setSuccess(true)
    } catch (err: unknown) {
      setErrors({ server: err instanceof Error ? err.message : 'Erreur lors de la création du compte' })
    } finally {
      setLoading(false)
    }
  }

  const verified = (data: AuthResult) => {
    setSuccess(true)
    setTimeout(() => router.push(data.is_first_login ? '/onboarding' : '/splash'), 800)
  }

  if (verifyEmail && !success) return <VerifyEmailStep email={verifyEmail} onVerified={verified} />

  const strength       = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e']

  if (success) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.successTitle}>Compte créé avec succès !</p>
        <p className={styles.successSub}>
          {verifyEmail ? 'Adresse vérifiée. Bienvenue sur Gbaki AI.' : 'Connectez-vous pour finaliser votre inscription.'}
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {errors.server && (
        <div style={{
          background: 'var(--x-error-bg)', border: '1px solid var(--x-error-border)', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: 'var(--x-error)', fontWeight: 600,
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
        placeholder="nom@ensea.edu.ci"
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