'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import s from './settings.module.css'
import {
  apiGetClasses, apiUpdateProfile, apiMe,
  getProfile, saveProfile, saveToken, clearAuth,
  type ClassItem, type UserProfile,
} from '../../lib/api'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

/* ── helpers ────────────────────────────────────────────── */
function getBadgeClass(code: string, active: boolean): string {
  const c = code.toUpperCase()
  if (active) {
    if (c.startsWith('AS'))  return s.classBadgeActiveAS
    if (c.startsWith('ISE')) return s.classBadgeActiveISE
    if (c.includes('MATH'))  return s.classBadgeActiveMATH
    return s.classBadgeActiveING
  }
  if (c.startsWith('AS'))  return s.badgeAS
  if (c.startsWith('ISE')) return s.badgeISE
  if (c.includes('MATH'))  return s.badgeMATH
  return s.badgeING
}

/* Code affiché dans le badge — on utilise directement c.code tel quel,
   en tronquant à 6 chars max pour tenir dans 44px si besoin */
function shortCode(code: string): string {
  // code vient de la DB : "AS1", "AS2", "ISE 1 M", "ISE 2", "IPS 1 E" etc.
  // On retire juste les underscores éventuels et on garde 7 chars max
  const clean = code.replace(/_/g, ' ').trim()
  return clean.length <= 7 ? clean : clean.slice(0, 7)
}

function EyeIcon({ open }: { open: boolean }) {
  return open
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
}

/* ══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'class' | 'account'>('class')

  // Profil
  const [profile,    setProfile]    = useState<UserProfile | null>(null)
  const [profileId,  setProfileId]  = useState('')
  const [classes,    setClasses]    = useState<ClassItem[]>([])

  // Onglet Classe
  const [selected,   setSelected]   = useState('')
  const [savingClass, setSavingClass] = useState(false)
  const [classMsg,   setClassMsg]   = useState<{type:'ok'|'err', text:string} | null>(null)

  // Onglet Compte
  const [newEmail,   setNewEmail]   = useState('')
  const [newPass,    setNewPass]    = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [savingAcc,  setSavingAcc]  = useState(false)
  const [accMsg,     setAccMsg]     = useState<{type:'ok'|'err', text:string} | null>(null)

  useEffect(() => {
    apiGetClasses().then(setClasses).catch(console.error)
    const cached = getProfile()
    if (cached) {
      setProfile(cached); setProfileId(cached.id)
      if (cached.class_id) setSelected(cached.class_id)
    } else {
      apiMe().then(p => {
        setProfile(p); setProfileId(p.id)
        if (p.class_id) setSelected(p.class_id)
      }).catch(() => router.push('/auth'))
    }
  }, [router])

  /* ── Changer de classe ──────────────────────────── */
  const handleSaveClass = async () => {
    if (!selected || !profileId) return
    setSavingClass(true); setClassMsg(null)
    try {
      const updated = await apiUpdateProfile(profileId, { class_id: selected })
      // Recharger le profil complet depuis /me pour avoir class_code et class_label à jour
      const fresh = await apiMe()
      saveProfile(fresh)
      setProfile(fresh)
      setClassMsg({ type: 'ok', text: 'Classe mise à jour ! Redirection…' })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (e: unknown) {
      setClassMsg({ type: 'err', text: (e as Error).message })
    } finally { setSavingClass(false) }
  }

  /* ── Changer de compte institutionnel ──────────── */
  const handleSaveAccount = async () => {
    setAccMsg(null)
    if (!newEmail.trim()) { setAccMsg({ type:'err', text:'Entrez le nouvel email institutionnel.' }); return }
    if (!newPass.trim())  { setAccMsg({ type:'err', text:'Entrez le mot de passe du nouveau compte.' }); return }

    setSavingAcc(true)
    try {
      // 1. Tenter de se connecter avec le nouveau compte
      const r = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase(), password: newPass }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? 'Identifiants incorrects pour ce compte.')

      // 2. Connexion réussie → sauvegarder le nouveau token et profil
      clearAuth()
      saveToken(data.token)
      saveProfile(data.profile)
      setAccMsg({ type: 'ok', text: 'Compte changé avec succès ! Redirection…' })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (e: unknown) {
      setAccMsg({ type: 'err', text: (e as Error).message })
    } finally { setSavingAcc(false) }
  }

  const currentClass = classes.find(c => c.id === selected)

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <button className={s.backBtn} onClick={() => router.push('/dashboard')}>
          ← Retour
        </button>
        <span className={s.headerTitle}>Paramètres</span>
      </div>

      <div className={s.card}>
        {/* Tabs */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === 'class' ? s.tabActive : ''}`}
            onClick={() => setTab('class')}
          >
            🎓 Ma classe
          </button>
          <button
            className={`${s.tab} ${tab === 'account' ? s.tabActive : ''}`}
            onClick={() => setTab('account')}
          >
            👤 Mon compte
          </button>
        </div>

        {/* ── Onglet Classe ── */}
        {tab === 'class' && (
          <div className={s.panel}>
            <div className={s.panelTitle}>Changer de classe</div>
            <p className={s.panelSub}>
              Sélectionnez votre classe. Votre dashboard affichera les documents correspondants.
            </p>

            {classMsg && (
              <div className={classMsg.type === 'ok' ? s.success : s.error}>
                {classMsg.text}
              </div>
            )}

            <div className={s.classList}>
              {classes.map(c => {
                const active = selected === c.id
                const abbr = shortCode(c.code)
                return (
                  <button
                    key={c.id}
                    className={`${s.classBtn} ${active ? s.classBtnActive : ''}`}
                    onClick={() => setSelected(c.id)}
                  >
                    {/* Badge colorié avec code complet lisible */}
                    <div className={`${s.classBadge} ${getBadgeClass(c.code, active)}`}>
                      {abbr}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={s.className}>{c.label}</div>
                      {c.cycle && <div className={s.classCycle}>{c.cycle}</div>}
                    </div>
                    {active && <span className={s.checkIcon}>✓</span>}
                  </button>
                )
              })}
            </div>

            <button
              className={s.saveBtn}
              onClick={handleSaveClass}
              disabled={savingClass || !selected || selected === profile?.class_id}
            >
              {savingClass ? 'Enregistrement…' : selected === profile?.class_id ? 'Classe actuelle' : `Choisir ${currentClass?.code ?? ''}`}
            </button>
          </div>
        )}

        {/* ── Onglet Compte ── */}
        {tab === 'account' && (
          <div className={s.panel}>
            <div className={s.panelTitle}>Changer de compte</div>
            <p className={s.panelSub}>
              Vous avez un nouvel email institutionnel ? Connectez-vous avec le compte déjà inscrit
              sur GBAKI pour y accéder. Votre session actuelle sera remplacée.
            </p>

            {accMsg && (
              <div className={accMsg.type === 'ok' ? s.success : s.error}>
                {accMsg.text}
              </div>
            )}

            {/* Compte actuel (lecture seule) */}
            <div className={s.field}>
              <label className={s.label}>Compte actuel</label>
              <input
                className={s.input}
                type="email"
                value={profile?.email ?? ''}
                disabled
              />
            </div>

            <div className={s.divider}/>

            <div className={s.field}>
              <label className={s.label}>Nouvel email institutionnel</label>
              <input
                className={s.input}
                type="email"
                placeholder="nouveau@ensea.edu.ci"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                autoComplete="off"
              />
              <div className={s.hint}>Ce compte doit déjà être inscrit sur GBAKI.</div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Mot de passe du nouveau compte</label>
              <div className={s.inputWrap}>
                <input
                  className={s.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mot de passe du nouveau compte"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveAccount()}
                  autoComplete="new-password"
                />
                <button className={s.eye} onClick={() => setShowPass(v => !v)} type="button">
                  <EyeIcon open={showPass}/>
                </button>
              </div>
            </div>

            <button
              className={s.saveBtn}
              onClick={handleSaveAccount}
              disabled={savingAcc}
            >
              {savingAcc ? 'Vérification…' : 'Basculer vers ce compte'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
