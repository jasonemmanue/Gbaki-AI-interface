/*
 * gbaki-searcher/app/onboarding/page.tsx
 * Stockage : gbaki-searcher/app/onboarding/page.tsx
 *
 * Affiché uniquement à la PREMIÈRE connexion (is_first_login = true)
 * Permet de choisir sa filière et sa classe
 * Sauvegarde via PATCH /api/profiles/{id}/
 * Redirige vers /dashboard après confirmation
 */
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { apiGetClasses, apiUpdateProfile, getProfile, type ClassItem } from '../../lib/api'

export default function OnboardingPage() {
  const router  = useRouter()
  const profile = getProfile()

  const [classes,      setClasses]      = useState<ClassItem[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [step,         setStep]         = useState(0)     // 0=classe, 1=confirmation
  const [saving,       setSaving]       = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  /* Charger les classes depuis l'API */
  useEffect(() => {
    apiGetClasses()
      .then(cls => setClasses(cls))
      .catch(() => setError('Impossible de charger les classes.'))
      .finally(() => setLoading(false))
  }, [])

  const handleFinish = async () => {
    if (!selectedClass || !profile) return
    setSaving(true)
    setError('')
    try {
      // Mettre à jour le profil avec la classe choisie
      await apiUpdateProfile(profile.id, { class_id: selectedClass.id })
      // Mettre à jour le localStorage
      const updated = { ...profile, class_id: selectedClass.id, class_code: selectedClass.code, class_label: selectedClass.label, is_first_login: false }
      localStorage.setItem('gbaki_profile', JSON.stringify(updated))
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const progress = ((step + 1) / 3) * 100

  return (
    <div style={{
      minHeight: '100vh', background: '#eef3fb',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 16px',
      fontFamily: 'Plus Jakarta Sans, Segoe UI, sans-serif',
      position: 'relative',
    }}>
      {/* Barre de progression */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: '#dde4f0', zIndex: 10 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#1a56db', borderRadius: '0 3px 3px 0', transition: 'width 0.4s ease' }} />
      </div>

      {/* Logo barre haute */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52,
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, zIndex: 9,
      }}>
        {/* LOGO : gbaki-searcher/public/logo.png · 32×32px */}
        <Image src="/logo.png" alt="ENSEA DSC" width={32} height={32} style={{ objectFit: 'contain', borderRadius: 7 }} priority />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
          G<span style={{ color: '#1a56db' }}>-</span>baki
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginLeft: 4 }}>
          · Configuration de votre profil
        </span>
      </div>

      {/* Carte */}
      <div style={{
        background: '#fff', borderRadius: 22,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        border: '1px solid #e5e7eb',
        width: '100%', maxWidth: 540, padding: '40px 40px 36px',
        marginTop: 52,
        animation: 'slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* ── ÉTAPE 0 : Choisir sa classe ── */}
        {step === 0 && (
          <div>
            {/* Badge étape */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#eff6ff', color: '#1a56db',
              fontSize: 11.5, fontWeight: 700, padding: '4px 12px',
              borderRadius: 99, marginBottom: 18, letterSpacing: '0.04em',
            }}>
              🎓 Étape 1 sur 2
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px', marginBottom: 8 }}>
              Quelle est votre classe ?
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
              Choisissez votre niveau d&apos;études. Vos documents seront filtrés automatiquement selon cette sélection.
            </p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                ⏳ Chargement des classes…
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {classes.map(cl => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => setSelectedClass(cl)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: 4, padding: '14px 16px',
                      borderRadius: 12,
                      border: selectedClass?.id === cl.id
                        ? '2px solid #1a56db'
                        : '2px solid #e5e7eb',
                      background: selectedClass?.id === cl.id ? '#eff6ff' : '#f9fafb',
                      cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
                      boxShadow: selectedClass?.id === cl.id ? '0 0 0 3px rgba(26,86,219,0.10)' : 'none',
                    }}
                  >
                    <span style={{
                      display: 'inline-block', background: '#dbeafe', color: '#1e40af',
                      fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99, marginBottom: 2,
                    }}>
                      {cl.code}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{cl.label}</span>
                    {cl.cycle && <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>{cl.cycle}</span>}
                  </button>
                ))}
                {classes.length === 0 && !loading && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', padding: '20px 0', fontSize: 13 }}>
                    Aucune classe disponible pour l&apos;instant.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={!selectedClass}
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 28px', background: '#1a56db', color: '#fff',
                  border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 800,
                  cursor: selectedClass ? 'pointer' : 'not-allowed',
                  opacity: selectedClass ? 1 : 0.55,
                  boxShadow: '0 3px 12px rgba(26,86,219,0.25)',
                  transition: 'all 0.18s',
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 1 : Confirmation ── */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎓</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
              Tout est prêt !
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 24 }}>
              Votre profil est configuré. G-baki vous proposera désormais les documents correspondant à votre parcours.
            </p>

            {/* Récap */}
            <div style={{
              background: '#eff6ff', border: '1px solid rgba(26,86,219,0.15)',
              borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 24,
            }}>
              {[
                { label: 'Classe',   value: `${selectedClass?.code} — ${selectedClass?.label}` },
                { label: 'Cycle',    value: selectedClass?.cycle ?? 'Non spécifié' },
                { label: 'Modifier', value: 'Dans vos paramètres de compte' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 12, padding: '5px 0', fontSize: 13.5 }}>
                  <span style={{ color: '#1a56db', fontWeight: 800, minWidth: 72 }}>{row.label}</span>
                  <span style={{ color: '#374151', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                style={{
                  width: '100%', padding: 14, background: '#1a56db', color: '#fff',
                  border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 800,
                  cursor: saving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 16px rgba(26,86,219,0.28)', transition: 'all 0.18s',
                  opacity: saving ? 0.8 : 1,
                }}
              >
                {saving ? '⏳ Enregistrement…' : 'Accéder à G-baki →'}
              </button>
              <button
                type="button"
                onClick={() => setStep(0)}
                style={{
                  width: '100%', padding: 12, background: '#f9fafb', color: '#6b7280',
                  border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                ← Modifier mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
