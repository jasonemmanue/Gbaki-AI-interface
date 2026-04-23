/*
 * gbaki-searcher/app/auth/forgot-password/page.tsx
 * Stockage : gbaki-searcher/app/auth/forgot-password/page.tsx
 * LOGO : public/logo.png → width={120} height={120}
 * Champs : email uniquement
 * ─── CORRIGÉ : utilise les classes exactes de auth.module.css ───
 */
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

export default function ForgotPasswordPage() {
  const router   = useRouter()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!email.trim()) { setError("L'email est requis."); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Adresse email invalide.'); return }
    setError(''); setLoading(true)
    // TODO: POST /api/auth/password-reset/
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
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
          <p className={styles.subtitle}>Réinitialisation du mot de passe</p>
        </div>

        <Link href="/auth/login" className={styles.backLink}>
          ← Retour à la connexion
        </Link>

        {sent ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon} style={{ fontSize: 28 }}>📬</div>
            <p className={styles.successTitle}>Email envoyé !</p>
            <p className={styles.successSub}>
              Si un compte existe pour <strong>{email}</strong>,
              vous recevrez un lien de réinitialisation.
              <br />Vérifiez votre dossier spam.
            </p>
            <button
              className={styles.submitBtn}
              style={{ marginTop: 16 }}
              onClick={() => router.push('/auth/login')}
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
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

              {/* Champ email — identique au LoginForm */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Votre email institutionnel</label>
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

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Envoyer le lien de réinitialisation'}
              </button>

              <div className={styles.forgotWrapper}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  Vous vous souvenez ?{' '}
                  <Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 600 }}>
                    Se connecter
                  </Link>
                </span>
              </div>

            </form>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        École Nationale Supérieure de Statistique et d&apos;Économie Appliquée
      </footer>
    </div>
  )
}