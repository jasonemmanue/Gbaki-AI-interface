'use client'

import { useState } from 'react'
import s from './auth.module.css'

/* ── Icons ─────────────────────────────────────────── */
const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const EyeIcon = ({ on }: { on: boolean }) => on ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

/* ── Logo ENSEA DSC ─────────────────────────────────── */
function Logo() {
  return (
    <div className={s.logoZone}>
      {/* SVG inline représentant le logo DSC réseau de neurones */}
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.logoImg} aria-label="ENSEA Data Science Club">
        <rect width="68" height="68" rx="16" fill="#fff"/>
        <rect width="68" height="68" rx="16" fill="url(#lg)" opacity="0.07"/>
        {/* réseau */}
        <circle cx="34" cy="13" r="4.5" fill="#1a56db" opacity="0.95"/>
        <circle cx="14" cy="40" r="4" fill="#1a56db" opacity="0.75"/>
        <circle cx="54" cy="40" r="4" fill="#1a56db" opacity="0.75"/>
        <circle cx="22" cy="56" r="3.5" fill="#1a56db" opacity="0.55"/>
        <circle cx="46" cy="56" r="3.5" fill="#1a56db" opacity="0.55"/>
        <circle cx="34" cy="34" r="6" fill="#1e429f"/>
        <circle cx="34" cy="34" r="3" fill="#fff" opacity="0.9"/>
        <line x1="34" y1="17" x2="34" y2="28" stroke="#1a56db" strokeWidth="1.6" opacity="0.55"/>
        <line x1="14" y1="40" x2="28" y2="34" stroke="#1a56db" strokeWidth="1.6" opacity="0.55"/>
        <line x1="54" y1="40" x2="40" y2="34" stroke="#1a56db" strokeWidth="1.6" opacity="0.55"/>
        <line x1="14" y1="40" x2="22" y2="53" stroke="#1a56db" strokeWidth="1.4" opacity="0.40"/>
        <line x1="54" y1="40" x2="46" y2="53" stroke="#1a56db" strokeWidth="1.4" opacity="0.40"/>
        <line x1="34" y1="13" x2="14" y2="40" stroke="#1a56db" strokeWidth="1" opacity="0.25"/>
        <line x1="34" y1="13" x2="54" y2="40" stroke="#1a56db" strokeWidth="1" opacity="0.25"/>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1a56db"/><stop offset="1" stopColor="#0ea5e9"/>
          </linearGradient>
        </defs>
      </svg>
      <div className={s.logoText}>
        <span className={s.logoSchool}>ENSEA</span>
        <span className={s.logoClub}>Data Science Club</span>
      </div>
    </div>
  )
}

/* ── InputField ─────────────────────────────────────── */
function InputField({ label, type, placeholder, value, onChange, icon, error, toggle }: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode; error?: string; toggle?: boolean;
}) {
  const [show, setShow] = useState(false)
  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>
      <div className={`${s.inputRow} ${error ? s.inputRowError : ''}`}>
        <span className={s.inputIcon}>{icon}</span>
        <input
          className={s.input}
          type={toggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'}
        />
        {toggle && (
          <button type="button" className={s.eyeBtn} onClick={() => setShow(!show)} tabIndex={-1}
            aria-label={show ? 'Masquer' : 'Afficher'}>
            <EyeIcon on={show} />
          </button>
        )}
      </div>
      {error && <p className={s.errorTxt}>{error}</p>}
    </div>
  )
}

/* ── Login ──────────────────────────────────────────── */
function LoginForm() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!email) v.email = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(email)) v.email = 'Email invalide.'
    if (!pw) v.pw = 'Le mot de passe est requis.'
    if (Object.keys(v).length) { setErrs(v); return }
    setErrs({}); setLoading(true)
    // TODO: POST /api/auth/login/
    await new Promise(r => setTimeout(r, 1100))
    setLoading(false); setOk(true)
  }

  if (ok) return (
    <div className={s.success}>
      <div className={s.successIcon}>✓</div>
      <p className={s.successTitle}>Connexion réussie !</p>
      <p className={s.successSub}>Bienvenue sur G-baki. Redirection en cours…</p>
    </div>
  )

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <InputField label="Email institutionnel" type="email" placeholder="prenom.nom@ensea.ed.ci"
        value={email} onChange={setEmail} icon={<MailIcon />} error={errs.email} />
      <InputField label="Mot de passe" type="password" placeholder="••••••••"
        value={pw} onChange={setPw} icon={<LockIcon />} error={errs.pw} toggle />
      <button className={s.btn} disabled={loading}>
        {loading ? <span className={s.spinner}/> : 'Se connecter'}
      </button>
      <div className={s.forgotRow}>
        <a href="#" className={s.forgotLink}>Mot de passe oublié ?</a>
      </div>
    </form>
  )
}

/* ── Register ───────────────────────────────────────── */
function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3
  const sColors = ['', '#ef4444', '#f59e0b', '#10b981']
  const sLabels = ['', 'Faible', 'Moyen', 'Fort']

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!name.trim()) v.name = 'Le nom est requis.'
    if (!email) v.email = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(email)) v.email = 'Email invalide.'
    if (!pw) v.pw = 'Le mot de passe est requis.'
    else if (pw.length < 8) v.pw = 'Au moins 8 caractères.'
    if (confirm !== pw) v.confirm = 'Les mots de passe ne correspondent pas.'
    if (Object.keys(v).length) { setErrs(v); return }
    setErrs({}); setLoading(true)
    // TODO: POST /api/profiles/
    await new Promise(r => setTimeout(r, 1100))
    setLoading(false); setOk(true)
  }

  if (ok) return (
    <div className={s.success}>
      <div className={s.successIcon}>✓</div>
      <p className={s.successTitle}>Compte créé !</p>
      <p className={s.successSub}>Vérifiez votre email pour activer votre compte G-baki.</p>
    </div>
  )

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <InputField label="Nom complet" type="text" placeholder="Prénom Nom"
        value={name} onChange={setName} icon={<UserIcon />} error={errs.name} />
      <InputField label="Email institutionnel" type="email" placeholder="prenom.nom@ensea.ed.ci"
        value={email} onChange={setEmail} icon={<MailIcon />} error={errs.email} />
      <div className={s.field}>
        <label className={s.label}>Mot de passe</label>
        <div className={`${s.inputRow} ${errs.pw ? s.inputRowError : ''}`}>
          <span className={s.inputIcon}><LockIcon /></span>
          <input className={s.input} type="password" placeholder="••••••••"
            value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
        </div>
        {pw && (
          <div className={s.strengthWrap}>
            <div className={s.strengthTrack}>
              <div className={s.strengthBar} style={{ width: `${(strength/3)*100}%`, background: sColors[strength] }}/>
            </div>
            <span className={s.strengthLbl} style={{ color: sColors[strength] }}>{sLabels[strength]}</span>
          </div>
        )}
        {errs.pw && <p className={s.errorTxt}>{errs.pw}</p>}
      </div>
      <InputField label="Confirmer le mot de passe" type="password" placeholder="••••••••"
        value={confirm} onChange={setConfirm} icon={<LockIcon />} error={errs.confirm} toggle />
      <button className={s.btn} disabled={loading}>
        {loading ? <span className={s.spinner}/> : 'Créer mon compte'}
      </button>
    </form>
  )
}

/* ── Page principale ────────────────────────────────── */
export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  return (
    <div className={s.page}>
      <div className={s.bg}>
        <div className={s.bgBlob1}/><div className={s.bgBlob2}/><div className={s.bgBlob3}/>
      </div>

      <main className={s.card}>
        <div className={s.header}>
          <Logo />
          <h1 className={s.appName}>G<span>-</span>baki</h1>
          <p className={s.tagline}>Recherche intelligente de supports pédagogiques académiques</p>
        </div>

        <div className={s.tabs}>
          {(['login','register'] as const).map(t => (
            <button key={t} className={`${s.tab} ${tab===t ? s.tabActive : ''}`}
              onClick={() => setTab(t)} type="button">
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <div className={s.formWrap} key={tab}>
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </main>

      <footer className={s.footer}>
        École Nationale Supérieure de Statistique et d&apos;Économie Appliquée — Abidjan
      </footer>
    </div>
  )
}
