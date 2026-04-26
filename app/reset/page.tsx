'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import s from './reset.module.css'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

async function doReset(email: string, resetToken: string, newPassword: string) {
  const r = await fetch(`${API}/auth/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error ?? 'Erreur lors de la réinitialisation.')
  return data
}

function EyeIcon({ open }: { open: boolean }) {
  return open
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
}

export default function ResetPage() {
  const router = useRouter()
  const [email,       setEmail]      = useState('')
  const [resetToken,  setResetToken] = useState('')
  const [password,    setPassword]   = useState('')
  const [confirm,     setConfirm]    = useState('')
  const [showPwd,     setShowPwd]    = useState(false)
  const [showCfm,     setShowCfm]    = useState(false)
  const [loading,     setLoading]    = useState(false)
  const [error,       setError]      = useState('')
  const [done,        setDone]       = useState(false)

  useEffect(() => {
    const e = sessionStorage.getItem('gbaki_reset_email')
    const t = sessionStorage.getItem('gbaki_reset_token')
    if (!e || !t) { router.replace('/auth'); return }
    setEmail(e); setResetToken(t)
  }, [router])

  const strength = (() => {
    if (!password) return 0
    let sc = 0
    if (password.length >= 6)  sc++
    if (password.length >= 10) sc++
    if (/[A-Z]/.test(password)) sc++
    if (/\d/.test(password))   sc++
    if (/[^A-Za-z0-9]/.test(password)) sc++
    return sc
  })()

  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength]
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength]

  const handleSubmit = async () => {
    setError('')
    if (!password)           { setError('Entrez un nouveau mot de passe.'); return }
    if (password.length < 6) { setError('Minimum 6 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    try {
      await doReset(email, resetToken, password)
      sessionStorage.removeItem('gbaki_reset_email')
      sessionStorage.removeItem('gbaki_reset_token')
      setDone(true)
      setTimeout(() => router.push('/auth'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur.')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>gbaki<span>·ai</span></div>

        {done ? (
          <div className={s.doneBox}>
            <div className={s.doneIcon}>✅</div>
            <div className={s.doneTitle}>Mot de passe réinitialisé !</div>
            <p className={s.doneSub}>
              Votre mot de passe a été mis à jour avec succès.<br/>
              Redirection vers la connexion dans 3 secondes…
            </p>
            <Link href="/auth" className={s.back} style={{marginTop:20}}>
              Se connecter maintenant
            </Link>
          </div>
        ) : (
          <>
            <h1 className={s.title}>Nouveau mot de passe</h1>
            <p className={s.sub}>Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>

            {error && <div className={s.error}>{error}</div>}

            <label className={s.label}>Nouveau mot de passe</label>
            <div className={s.inputWrap}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button className={s.eye} onClick={() => setShowPwd(v => !v)} type="button">
                <EyeIcon open={showPwd}/>
              </button>
            </div>
            {password && (
              <>
                <div className={s.strengthBar}>
                  <div className={s.strengthFill} style={{ width:`${(strength/5)*100}%`, background: strengthColor }}/>
                </div>
                <div className={s.strengthLabel} style={{ color: strengthColor }}>{strengthLabel}</div>
              </>
            )}

            <label className={s.label}>Confirmer le mot de passe</label>
            <div className={s.inputWrap}>
              <input
                type={showCfm ? 'text' : 'password'}
                placeholder="Répétez le mot de passe"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className={confirm && confirm !== password ? s.inputError : confirm && confirm === password ? s.inputOk : ''}
              />
              <button className={s.eye} onClick={() => setShowCfm(v => !v)} type="button">
                <EyeIcon open={showCfm}/>
              </button>
            </div>

            <button className={s.btn} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            </button>

            <Link href="/auth" className={s.back}>← Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  )
}
