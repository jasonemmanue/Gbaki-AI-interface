/*
 * gbaki-searcher/app/auth/register/page.tsx
 * Stockage : gbaki-searcher/app/auth/register/page.tsx
 * LOGO : public/logo.png → width={120} height={120}
 * ─── CORRIGÉ : utilise les classes exactes de auth.module.css ───
 */
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { apiRegister } from '../../../lib/api'

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showCf,   setShowCf]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})
  const [success,  setSuccess]  = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const sColors  = ['', '#dc2626', '#d97706', '#059669']
  const sLabels  = ['', 'Faible', 'Correct', 'Solide']

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Le nom est requis.'
    if (!email)       e.email = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide.'
    if (!password)    e.password = 'Mot de passe requis.'
    else if (password.length < 6) e.password = 'Au moins 6 caractères.'
    if (password !== confirm) e.confirm = 'Les mots de passe ne correspondent pas.'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErr(errs); return }
    setFieldErr({}); setError(''); setLoading(true)
    try {
      await apiRegister(email, password, name)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  /* Page succès */
  if (success) return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />
      <main className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image src="/logo.png" alt="ENSEA DSC" width={120} height={120} style={{ objectFit: 'contain' }} priority />
          </div>
          <h1 className={styles.title}>Gbaki AI</h1>
        </div>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <p className={styles.successTitle}>Compte créé !</p>
          <p className={styles.successSub}>Votre profil est bien enregistré. Connectez-vous pour finaliser votre inscription.</p>
          <button className={styles.submitBtn} style={{ marginTop: 16 }} onClick={() => router.push('/auth/login')}>
            Se connecter
          </button>
        </div>
      </main>
      <footer className={styles.footer}>
        École Nationale Supérieure de Statistique et d&apos;Économie Appliquée
      </footer>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />

      <main className={styles.card}>
        <div className={styles.header}>
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
          <h1 className={styles.title}>Gbaki AI</h1>
          <p className={styles.subtitle}>Recherche intelligente dans vos documents académiques</p>
        </div>

        {/* TABS — Inscription actif */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={styles.tab}
            onClick={() => router.push('/auth/login')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`${styles.tab} ${styles.tabActive}`}
          >
            Inscription
          </button>
        </div>

        <div className={styles.formContainer}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Nom complet */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nom complet</label>
              <div className={`${styles.inputWrapper} ${fieldErr.name ? styles.inputError : ''}`}>
                <span className={styles.inputIcon}><UserIcon /></span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Prénom Nom"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              {fieldErr.name && <p className={styles.errorMsg}>{fieldErr.name}</p>}
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email institutionnel</label>
              <div className={`${styles.inputWrapper} ${fieldErr.email ? styles.inputError : ''}`}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="prenom.nom@universite.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {fieldErr.email && <p className={styles.errorMsg}>{fieldErr.email}</p>}
            </div>

            {/* Mot de passe */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div className={`${styles.inputWrapper} ${fieldErr.password ? styles.inputError : ''}`}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPw ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
              {password && (
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{ width: `${(strength / 3) * 100}%`, background: sColors[strength] }}
                  />
                  <span className={styles.strengthLabel} style={{ color: sColors[strength] }}>
                    {sLabels[strength]}
                  </span>
                </div>
              )}
              {fieldErr.password && <p className={styles.errorMsg}>{fieldErr.password}</p>}
            </div>

            {/* Confirmer mot de passe */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Confirmer le mot de passe</label>
              <div className={`${styles.inputWrapper} ${fieldErr.confirm ? styles.inputError : ''}`}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.input}
                  type={showCf ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowCf(!showCf)}
                  tabIndex={-1}
                  aria-label={showCf ? 'Masquer' : 'Afficher'}
                >
                  {showCf ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
              {fieldErr.confirm && <p className={styles.errorMsg}>{fieldErr.confirm}</p>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Créer mon compte'}
            </button>

          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        École Nationale Supérieure de Statistique et d&apos;Économie Appliquée
      </footer>
    </div>
  )
}