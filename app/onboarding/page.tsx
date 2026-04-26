/*
 * gbaki-searcher/app/onboarding/page.tsx
 * Sélection de la filière après première connexion
 */
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { apiGetClasses, apiUpdateProfile, getProfile, apiMe, type ClassItem } from '../../lib/api'

export default function OnboardingPage() {
  const router = useRouter()
  const [classes,  setClasses]  = useState<ClassItem[]>([])
  const [selected, setSelected] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [profileId, setProfileId] = useState('')

  useEffect(() => {
    apiGetClasses().then(setClasses).catch(console.error)
    const p = getProfile()
    if (p) { setProfileId(p.id); if (p.class_id) setSelected(p.class_id) }
    else apiMe().then(p => { setProfileId(p.id); if (p.class_id) setSelected(p.class_id) }).catch(() => router.push('/auth'))
  }, [router])

  const handleSave = async () => {
    if (!selected || !profileId) return
    setSaving(true)
    try {
      await apiUpdateProfile(profileId, { class_id: selected })
      router.push('/dashboard')
    } catch (e: unknown) {
      alert((e as Error).message)
    } finally { setSaving(false) }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#eff6ff 0%,#f0f4ff 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'24px 16px', fontFamily:'Plus Jakarta Sans,sans-serif',
    }}>
      <div style={{
        background:'#fff', borderRadius:20, boxShadow:'0 8px 40px rgba(37,99,235,0.12)',
        width:'100%', maxWidth:480, padding:'40px 36px',
        animation:'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{textAlign:'center', marginBottom:28}}>
          <Image src="/logo.png" alt="ENSEA DSC" width={80} height={80} style={{objectFit:'contain', marginBottom:12}} priority/>
          <h1 style={{fontSize:22, fontWeight:800, color:'#111827', marginBottom:6}}>Choisissez votre filière</h1>
          <p style={{fontSize:13.5, color:'#6b7280', lineHeight:1.5}}>
            Cette information permet de vous afficher les documents de votre classe directement.
            Vous pouvez la modifier plus tard dans vos paramètres.
          </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:24}}>
          {loading ? (
            <div style={{textAlign:'center', padding:20, color:'#6b7280'}}>Chargement…</div>
          ) : classes.map(c => (
            <button key={c.id}
              onClick={() => setSelected(c.id)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'13px 16px',
                border: selected === c.id ? '2px solid #2563eb' : '1.5px solid #e5e7eb',
                borderRadius:10,
                background: selected === c.id ? '#eff6ff' : '#f8fafc',
                cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              }}
            >
              <div style={{
                width:36, height:36, borderRadius:9,
                background: selected === c.id ? '#2563eb' : '#e5e7eb',
                color: selected === c.id ? '#fff' : '#6b7280',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:800, flexShrink:0,
              }}>
                {c.code.slice(0,2)}
              </div>
              <div>
                <div style={{fontSize:14, fontWeight:700, color:'#111827'}}>{c.label}</div>
                {c.cycle && <div style={{fontSize:12, color:'#6b7280'}}>{c.cycle}</div>}
              </div>
              {selected === c.id && (
                <span style={{marginLeft:'auto', fontSize:18}}>✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          style={{
            width:'100%', padding:14, background: selected ? '#2563eb' : '#93c5fd',
            color:'#fff', border:'none', borderRadius:10,
            fontSize:15, fontWeight:800, cursor: selected ? 'pointer' : 'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center', minHeight:50,
            transition:'background 0.18s',
          }}
        >
          {saving ? '⏳ Enregistrement…' : 'Accéder à ma bibliothèque →'}
        </button>
      </div>
    </div>
  )
}
