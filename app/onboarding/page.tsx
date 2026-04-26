'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { apiGetClasses, apiUpdateProfile, apiMe, getProfile, saveProfile, type ClassItem } from '../../lib/api'
import ob from './onboarding.module.css'

/* ── Badge color par cycle ───────────────────────── */
function badgeColors(code: string, active: boolean): { bg: string; color: string } {
  const c = code.toUpperCase()
  if (active) {
    if (c.startsWith('AS') || c.startsWith('IPS')) return { bg: '#2563eb', color: '#fff' }
    if (c.startsWith('ISE')) return { bg: '#7c3aed', color: '#fff' }
    return { bg: '#059669', color: '#fff' }
  }
  if (c.startsWith('AS') || c.startsWith('IPS')) return { bg: '#dbeafe', color: '#1d4ed8' }
  if (c.startsWith('ISE')) return { bg: '#ede9fe', color: '#6d28d9' }
  return { bg: '#d1fae5', color: '#065f46' }
}

/* ── Code affiché tel quel dans le badge ─────────── */
function displayCode(code: string): string {
  return code.replace(/_/g, ' ').trim()
}

export default function OnboardingPage() {
  const router   = useRouter()
  const [classes,   setClasses]   = useState<ClassItem[]>([])
  const [selected,  setSelected]  = useState('')
  const [profileId, setProfileId] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    apiGetClasses().then(setClasses).catch(console.error)
    const p = getProfile()
    if (p) { setProfileId(p.id); if (p.class_id) setSelected(p.class_id) }
    else apiMe()
      .then(p => { setProfileId(p.id); if (p.class_id) setSelected(p.class_id) })
      .catch(() => router.push('/auth'))
  }, [router])

  const handleSave = async () => {
    if (!selected || !profileId) return
    setSaving(true); setError('')
    try {
      await apiUpdateProfile(profileId, { class_id: selected })
      // Recharger le profil complet pour avoir class_code/label à jour
      const fresh = await apiMe()
      saveProfile(fresh)
      router.push('/splash')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally { setSaving(false) }
  }

  return (
    <div className={ob.page}>
      <div className={ob.card}>
        <div className={ob.top}>
          <Image src="/logo.png" alt="ENSEA DSC" width={72} height={72}
            style={{ objectFit:'contain', marginBottom:12 }} priority/>
          <h1 className={ob.title}>Choisissez votre filière</h1>
          <p className={ob.sub}>
            Cette information permet de vous afficher les documents de votre classe directement.
            Vous pouvez la modifier plus tard dans vos paramètres.
          </p>
        </div>

        {error && <div className={ob.error}>{error}</div>}

        <div className={ob.list}>
          {classes.map(c => {
            const active  = selected === c.id
            const colors  = badgeColors(c.code, active)
            const code    = displayCode(c.code)
            return (
              <button
                key={c.id}
                className={`${ob.classBtn} ${active ? ob.classBtnActive : ''}`}
                onClick={() => setSelected(c.id)}
              >
                {/* Badge colorié avec le vrai code */}
                <div
                  className={ob.badge}
                  style={{ background: colors.bg, color: colors.color }}
                >
                  {code}
                </div>

                <div className={ob.classInfo}>
                  <div className={ob.className}>{c.label}</div>
                  {c.cycle && <div className={ob.classCycle}>{c.cycle}</div>}
                </div>

                {active && <span className={ob.check}>✓</span>}
              </button>
            )
          })}
        </div> 

        <button
          className={ob.saveBtn}
          onClick={handleSave}
          disabled={!selected || saving}
        >
          {saving ? '⏳ Enregistrement…' : 'Accéder à ma bibliothèque →'}
        </button>
      </div>
    </div>
  )
}