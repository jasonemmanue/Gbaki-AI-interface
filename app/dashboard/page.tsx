/*
 * gbaki-searcher/app/dashboard/page.tsx
 * LOGO : public/logo.png → 38×38px dans la sidebar (.brandLogo)
 */
'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import s from './dashboard.module.css'
import {
  apiGetDocuments, apiLogout, apiMe,
  getProfile, type Document, type UserProfile
} from '../../lib/api'

const Icons = {
  Home:     () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Docs:     () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Search:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Logout:   () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="19" height="19"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Eye:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Settings: () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

function BadgeEl({ label }: { label: string }) {
  const l = label.toLowerCase()
  let cls = s.badge + ' '
  if (['pdf','png','jpg','webp'].includes(l)) cls += s.bPdf
  else if (['as1','as2','as3','l1','l2','l3','m1','m2'].includes(l)) cls += s.bClass
  else if (['cours','td','tp','examen','corrigé','devoir'].includes(l)) cls += s.bType
  else if (l === 'publié') cls += s.bPublished
  else if (l === 'brouillon') cls += s.bDraft
  else cls += s.bOther
  return <span className={cls}>{label}</span>
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile]       = useState<UserProfile | null>(null)
  const [nav, setNav]               = useState('home')
  const [sideOpen, setSideOpen]     = useState(false)
  const [query, setQuery]           = useState('')
  const [docs, setDocs]             = useState<Document[]>([])
  const [count, setCount]           = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading]       = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [searched, setSearched]     = useState(false)

  // Charger le profil et les documents initiaux
  useEffect(() => {
    const cached = getProfile()
    if (cached) setProfile(cached)
    else {
      apiMe().then(p => setProfile(p)).catch(() => router.push('/auth/login'))
    }
    // Charger les docs de la filière de l'utilisateur
    loadDocs({})
  }, [router])

  const loadDocs = useCallback(async (filters: Parameters<typeof apiGetDocuments>[0]) => {
    setInitLoading(true)
    try {
      const data = await apiGetDocuments(filters)
      setDocs(data.results)
      setCount(data.count)
      if (data.suggestions) setSuggestions(data.suggestions)
    } catch { /* silencieux */ }
    finally { setInitLoading(false) }
  }, [])

  const doSearch = useCallback(async (q: string) => {
    setLoading(true); setSuggestions([]); setSearched(true)
    try {
      // Filtre automatique par classe du profil si disponible
      const filters: Parameters<typeof apiGetDocuments>[0] = {}
      if (q.trim()) filters.search = q.trim()
      if (profile?.class_id) filters.class_id = profile.class_id
      const data = await apiGetDocuments(filters)
      setDocs(data.results); setCount(data.count)
      if (data.suggestions) setSuggestions(data.suggestions)
    } catch { setDocs([]); setCount(0) }
    finally { setLoading(false) }
  }, [profile])

  const handleLogout = async () => {
    await apiLogout()
    router.push('/auth/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : (profile?.email?.[0] ?? '?').toUpperCase()

  const NAV = [
    { id:'home',      label:'Accueil',           icon:'Home',    section:'NAVIGATION' },
    { id:'docs',      label:'Tous les documents', icon:'Docs',    section:null         },
    { id:'settings',  label:'Paramètres',         icon:'Settings',section:'MON COMPTE' },
  ]

  return (
    <div className={s.shell}>
      <div className={`${s.overlay} ${!sideOpen ? s.overlayHidden : ''}`} onClick={() => setSideOpen(false)}/>

      {/* ══ SIDEBAR ══ */}
      <aside className={`${s.sidebar} ${sideOpen ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarTop}>
          <div className={s.brandRow}>
            {/* LOGO : public/logo.png · 38×38px */}
            <Image src="/logo.png" alt="ENSEA DSC" width={38} height={38} className={s.brandLogo} priority />
            <div className={s.brandText}>
              <span className={s.brandName}>G<span>-</span>baki</span>
              <span className={s.brandSub}>ENSEA Data Science Club</span>
            </div>
          </div>
          <div className={s.userChip}>
            <div className={s.userAvatar}>{initials}</div>
            <div className={s.userChipInfo}>
              <div className={s.userChipName}>{profile?.full_name ?? profile?.email ?? '…'}</div>
              <div className={s.userChipRole}>
                {profile?.class_label ?? profile?.class_code ?? 'Étudiant'}
              </div>
            </div>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.map((item, i) => {
            const prev = NAV[i-1]
            const showSection = item.section && item.section !== (prev?.section ?? '')
            const IconComp = Icons[item.icon as keyof typeof Icons]
            return (
              <div key={item.id}>
                {showSection && <p className={s.navSection}>{item.section}</p>}
                <button className={`${s.navItem} ${nav===item.id ? s.navItemActive : ''}`}
                  onClick={() => { setNav(item.id); setSideOpen(false) }}>
                  <IconComp/>{item.label}
                </button>
              </div>
            )
          })}
        </nav>

        <div className={s.sidebarBottom}>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <Icons.Logout/>Se déconnecter
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.iconBtn} style={{ display:'flex' }} onClick={() => setSideOpen(!sideOpen)}>
            <Icons.Menu/>
          </button>
          <div className={s.topbarGreeting}>
            <div className={s.topbarGreetingTxt}>
              Bonjour{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
              {profile?.class_label && <span> — {profile.class_label}</span>}
            </div>
          </div>
          <div className={s.topbarRight}>
            <button className={s.iconBtn}><Icons.Bell/></button>
            <div className={s.userAvatar} style={{ width:36,height:36,fontSize:12,borderRadius:'50%' }}>{initials}</div>
          </div>
        </header>

        <main className={s.content}>

          {/* Contexte filière */}
          {profile?.class_label && (
            <div className={s.contextBar}>
              📚 Documents filtrés pour : <span>{profile.class_label}</span>
              <button className={s.contextEdit} onClick={() => router.push('/onboarding')}>Modifier</button>
            </div>
          )}

          {/* Recherche */}
          <div className={s.searchBlock}>
            <h2 className={s.searchHeading}>Que cherchez-vous ?</h2>
            <p className={s.searchSubheading}>
              Tapez un mot-clé, matière, enseignant, type de document.
              Accepte les abréviations : <em>td, tp, proba, exam, corrigé…</em>
            </p>
            <div className={s.searchRow}>
              <div className={s.searchInputWrap}>
                <Icons.Search/>
                <input className={s.searchInput}
                  placeholder="Ex : cours probabilités, examen estimation, TP stats…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                />
              </div>
              <button className={s.searchBtn} onClick={() => doSearch(query)} disabled={loading}>
                {loading ? '⏳' : <><Icons.Search/> Rechercher</>}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className={s.suggestions}>
                <span className={s.suggLabel}>💡 Vouliez-vous dire :</span>
                {suggestions.map(w => (
                  <button key={w} className={s.suggChip} onClick={() => { setQuery(w); doSearch(w) }}>{w}</button>
                ))}
              </div>
            )}
          </div>

          {/* Résultats */}
          <div>
            <div className={s.resultsBar}>
              <div className={s.resultsTitle}>{searched ? 'Résultats' : 'Documents de votre filière'}</div>
              <div className={s.resultsMeta}>
                {initLoading ? 'Chargement…' : `${count} document${count > 1 ? 's' : ''}${searched && query ? ` pour «\u00a0${query}\u00a0»` : ''}`}
              </div>
            </div>
          </div>

          {initLoading ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--ink-muted)' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
              <p>Chargement des documents…</p>
            </div>
          ) : docs.length === 0 && searched ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>🔍</div>
              <div className={s.emptyTitle}>Aucun résultat</div>
              <div className={s.emptySub}>Essayez un autre terme. Notre moteur comprend les abréviations comme «&nbsp;proba&nbsp;», «&nbsp;td&nbsp;», «&nbsp;exam&nbsp;».</div>
            </div>
          ) : (
            <div className={s.docsGrid}>
              {docs.map(doc => {
                const initials2 = (doc.teachers[0]?.name ?? doc.uploaded_by ?? '??').split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()
                return (
                  <div className={s.docCard} key={doc.id}>
                    <div className={s.docCardBody}>
                      <div className={s.docBadges}>{doc.badges.slice(0,3).map(b => <BadgeEl key={b} label={b}/>)}</div>
                      <div className={s.docCardTitle}>{doc.title}</div>
                      {doc.description && <div className={s.docCardDesc}>{doc.description}</div>}
                    </div>
                    <div className={s.docCardFoot}>
                      <div className={s.docTeacher}>
                        <div className={s.teacherAvt}>{initials2}</div>
                        <span className={s.teacherName}>{doc.teachers[0]?.name ?? doc.uploaded_by}</span>
                      </div>
                      <div className={s.docActions}>
                        {doc.previewable && (
                          <a href={doc.clickable_link ?? '#'} target="_blank" rel="noreferrer" className={s.docBtn} title="Prévisualiser"><Icons.Eye/></a>
                        )}
                        <a href={doc.clickable_link ?? '#'} target="_blank" rel="noreferrer" className={s.docBtn} title="Télécharger"><Icons.Download/></a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
