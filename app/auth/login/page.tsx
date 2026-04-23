/*
 * gbaki-searcher/app/auth/login/page.tsx
 * Stockage : gbaki-searcher/app/auth/login/page.tsx
 * LOGO : public/logo.png → width={120} height={120}
 * ─── CORRIGÉ : utilise les classes exactes de auth.module.css ───
 */
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { apiLogin } from '../../../lib/api'

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

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setSuccess(true)
      setTimeout(() => {
        router.push(data.is_first_login ? '/onboarding' : '/dashboard')
      }, 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.blob1} aria-hidden />
        <div className={styles.blob2} aria-hidden />
        <main className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <Image src="/logo.png" alt="ENSEA Data Science Club" width={120} height={120} style={{ objectFit: 'contain' }} priority />
            </div>
            <h1 className={styles.title}>Gbaki AI</h1>
          </div>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.successTitle}>Connexion réussie !</p>
            <p className={styles.successSub}>Bienvenue sur Gbaki AI.</p>
          </div>
        </main>
        <footer className={styles.footer}>
          École Nationale Supérieure de Statistique et d&apos;Économie Appliquée
        </footer>
      </div>
    )
  }

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

        {/* TABS — Connexion actif */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${styles.tabActive}`}
          >
            Connexion
          </button>
          <button
            type="button"
            className={styles.tab}
            onClick={() => router.push('/auth/register')}
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

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email institutionnel</label>
              <div className={styles.inputWrapper}>
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
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Se connecter'}
            </button>

            <div className={styles.forgotWrapper}>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>

          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        École Nationale Supérieure de Statistique et d&apos;Économie Appliquée
      </footer>
    </div>
  )
}