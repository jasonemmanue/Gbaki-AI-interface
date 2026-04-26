'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import s from './forgot.module.css'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

async function sendOtp(email: string) {
  const r = await fetch(`${API}/auth/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return r.json()
}

async function checkOtp(email: string, code: string) {
  const r = await fetch(`${API}/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error ?? 'Code invalide.')
  return data
}

export default function ForgotPage() {
  const router = useRouter()
  const [step,    setStep]    = useState<1 | 2>(1)
  const [email,   setEmail]   = useState('')
  const [digits,  setDigits]  = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [resendCountdown, setResend] = useState(0)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResend(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  const handleSendOtp = async () => {
    setError('')
    if (!email.trim()) { setError('Veuillez entrer votre email.'); return }
    setLoading(true)
    try {
      await sendOtp(email.trim().toLowerCase())
      setStep(2)
      setResend(60)
      setTimeout(() => inputRefs[0].current?.focus(), 100)
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally { setLoading(false) }
  }

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 3) inputRefs[i + 1].current?.focus()
    if (val && next.every(d => d !== '') && i === 3) handleVerify(next.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs[i - 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      setDigits(pasted.split(''))
      inputRefs[3].current?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (code?: string) => {
    const c = code ?? digits.join('')
    if (c.length < 4) { setError('Entrez les 4 chiffres.'); return }
    setError(''); setLoading(true)
    try {
      const data = await checkOtp(email.trim().toLowerCase(), c)
      sessionStorage.setItem('gbaki_reset_email', data.email)
      sessionStorage.setItem('gbaki_reset_token', data.reset_token)
      router.push('/reset')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code invalide.')
      setDigits(['', '', '', ''])
      setTimeout(() => inputRefs[0].current?.focus(), 50)
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setError(''); setSuccess(''); setDigits(['', '', '', ''])
    setLoading(true)
    try {
      await sendOtp(email.trim().toLowerCase())
      setResend(60)
      setSuccess('Un nouveau code a été envoyé.')
      setTimeout(() => inputRefs[0].current?.focus(), 100)
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>gbaki<span>·ai</span></div>

        {step === 1 && (
          <>
            <h1 className={s.title}>Mot de passe oublié ?</h1>
            <p className={s.sub}>
              Entrez votre email d&apos;inscription. Nous vous enverrons un code à 4 chiffres.
            </p>
            {error && <div className={s.error}>{error}</div>}
            <label className={s.label}>Adresse email</label>
            <input
              className={s.emailInput}
              type="email"
              placeholder="exemple@ensea.ed.ci"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              autoFocus
            />
            <button className={s.btn} onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Envoi en cours…' : 'Envoyer le code'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={s.title}>Vérifiez votre email</h1>
            <p className={s.sub}>
              Un code à 4 chiffres a été envoyé à <strong>{email}</strong>. Entrez-le ci-dessous.
            </p>
            {error   && <div className={s.error}>{error}</div>}
            {success && <div className={s.success}>{success}</div>}
            <div className={s.otpRow} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  className={`${s.otpInput} ${d ? s.otpFilled : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                />
              ))}
            </div>
            <button
              className={s.btn}
              onClick={() => handleVerify()}
              disabled={loading || digits.some(d => !d)}
            >
              {loading ? 'Vérification…' : 'Confirmer le code'}
            </button>
            <div className={s.resend}>
              Pas reçu le code ?{' '}
              <button className={s.resendBtn} onClick={handleResend} disabled={resendCountdown > 0 || loading}>
                {resendCountdown > 0 ? `Renvoyer dans ${resendCountdown}s` : 'Renvoyer'}
              </button>
            </div>
          </>
        )}

        <Link href="/auth" className={s.back}>← Retour à la connexion</Link>
      </div>
    </div>
  )
}
