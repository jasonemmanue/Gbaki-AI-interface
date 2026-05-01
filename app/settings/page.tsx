'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import s from './settings.module.css'
import { useLang } from '../../context/LangContext'
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

function shortCode(code: string): string {
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
  const { t, lang, toggleLang } = useLang()
  const [tab, setTab] = useState<'class' | 'account'>('class')

  // Profil
  const [profile,    setProfile]    = useState<UserProfile | null>(null)
  const [profileId,  setProfileId]  = useState('')
  const [classes,    setClasses]    = useState<ClassItem[]>([])

  // Onglet Classe
  const [selected,    setSelected]   = useState('')
  const [savingClass, setSavingClass] = useState(false)
  const [classMsg,    setClassMsg]   = useState<{type:'ok'|'err', text:string} | null>(null)

  // Onglet Compte
  const [newEmail,  setNewEmail]  = useState('')
  const [newPass,   setNewPass]   = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [savingAcc, setSavingAcc] = useState(false)
  const [accMsg,    setAccMsg]    = useState<{type:'ok'|'err', text:string} | null>(null)

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
      await apiUpdateProfile(profileId, { class_id: selected })
      const fresh = await apiMe()
      saveProfile(fresh)
      setProfile(fresh)
      setClassMsg({ type: 'ok', text: t('settingsClassCurrent') + ' ✓  Redirection…' })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (e: unknown) {
      setClassMsg({ type: 'err', text: (e as Error).message })
    } finally { setSavingClass(false) }
  }

  /* ── Changer de compte institutionnel ──────────── */
  const handleSaveAccount = async () => {
    setAccMsg(null)
    if (!newEmail.trim()) { setAccMsg({ type:'err', text: t('settingsAccountErrEmail') }); return }
    if (!newPass.trim())  { setAccMsg({ type:'err', text: t('settingsAccountErrPass') }); return }

    setSavingAcc(true)
    try {
      const r = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase(), password: newPass }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? 'Identifiants incorrects pour ce compte.')

      clearAuth()
      saveToken(data.token)
      saveProfile(data.profile)
      setAccMsg({ type: 'ok', text: t('settingsAccountSwitch') + ' ✓  Redirection…' })
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
          {t('settingsBack')}
        </button>
        <span className={s.headerTitle}>{t('settingsTitle')}</span>

        {/* Bouton langue */}
        <button
          onClick={toggleLang}
          title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
          style={{
            marginLeft: 'auto',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.03em',
            padding: '6px 12px',
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--primary, #2563eb)',
          }}
        >
          {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      </div>

      <div className={s.card}>
        {/* Tabs */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === 'class' ? s.tabActive : ''}`}
            onClick={() => setTab('class')}
          >
            {t('settingsTabClass')}
          </button>
          <button
            className={`${s.tab} ${tab === 'account' ? s.tabActive : ''}`}
            onClick={() => setTab('account')}
          >
            {t('settingsTabAccount')}
          </button>
        </div>

        {/* ── Onglet Classe ── */}
        {tab === 'class' && (
          <div className={s.panel}>
            <div className={s.panelTitle}>{t('settingsClassTitle')}</div>
            <p className={s.panelSub}>{t('settingsClassSub')}</p>

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
              {savingClass
                ? t('settingsClassSaving')
                : selected === profile?.class_id
                  ? t('settingsClassCurrent')
                  : `${t('settingsClassChoose')} ${currentClass?.code ?? ''}`}
            </button>
          </div>
        )}

        {/* ── Onglet Compte ── */}
        {tab === 'account' && (
          <div className={s.panel}>
            <div className={s.panelTitle}>{t('settingsAccountTitle')}</div>
            <p className={s.panelSub}>{t('settingsAccountSub')}</p>

            {accMsg && (
              <div className={accMsg.type === 'ok' ? s.success : s.error}>
                {accMsg.text}
              </div>
            )}

            {/* Compte actuel (lecture seule) */}
            <div className={s.field}>
              <label className={s.label}>{t('settingsAccountCurrent')}</label>
              <input
                className={s.input}
                type="email"
                value={profile?.email ?? ''}
                disabled
              />
            </div>

            <div className={s.divider}/>

            <div className={s.field}>
              <label className={s.label}>{t('settingsAccountNewEmail')}</label>
              <input
                className={s.input}
                type="email"
                placeholder={t('settingsAccountEmailPlaceholder')}
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                autoComplete="off"
              />
              <div className={s.hint}>{t('settingsAccountEmailHint')}</div>
            </div>

            <div className={s.field}>
              <label className={s.label}>{t('settingsAccountNewPass')}</label>
              <div className={s.inputWrap}>
                <input
                  className={s.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('settingsAccountPassPlaceholder')}
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
              {savingAcc ? t('settingsAccountSaving') : t('settingsAccountSwitch')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
