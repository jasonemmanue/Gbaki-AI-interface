/*
 * gbaki-searcher/app/dashboard/page.tsx
 * ✅ NOUVELLES FONCTIONNALITÉS :
 *   1. Notifications cloche — nombre de docs publiés aujourd'hui (disparaît après 24h)
 *   2. Mode clair/sombre — bouton dans la topbar
 *   3. Langues FR/EN — bouton dans la topbar
 */
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import s from './user.module.css'
import { useLang } from '../../context/LangContext'
import {
  apiGetDocuments, apiLogout, apiMe, apiGetClasses, apiGetSubjects,
  apiGetYears, apiGetDocTypes, apiGetDocumentUrl,
  apiGetTeachers, apiGetNotificationsToday,
  getProfile,
  type Document, type UserProfile, type ClassItem,
  type SubjectItem, type AcademicYear, type DocumentType, type Teacher,
} from '../../lib/api'

/* ══ Distance de Levenshtein ════════════════════════ */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function levenshteinSuggest(query: string, corpus: string[], limit = 7): string[] {
  if (!query || query.length < 2) return []
  const q = normalize(query)
  const scored = corpus
    .map(w => {
      const nw = normalize(w)
      const dist = levenshtein(q, nw)
      const threshold = Math.floor(q.length / 3) + 1
      const contains = nw.includes(q) ? -1 : 0
      return { w, score: dist + contains, ok: dist <= threshold || nw.includes(q) }
    })
    .filter(x => x.ok)
    .sort((a, b) => a.score - b.score)
  return [...new Set(scored.map(x => x.w))].slice(0, limit)
}

/* ══ Helpers notifications ══════════════════════════ */
const NOTIF_KEY = 'gbaki_notif_seen_date'

function getNotifSeenDate(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(NOTIF_KEY)
}
function setNotifSeenDate(date: string) {
  localStorage.setItem(NOTIF_KEY, date)
}

/* ══ Icons ══════════════════════════════════════════ */
const IC = {
  Search:   (p:{size?:number,color?:string}) => <svg width={p.size??16} height={p.size??16} viewBox="0 0 24 24" fill="none" stroke={p.color??'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Home:     () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Docs:     () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Settings: () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout:   () => <svg className={s.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:     () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Eye:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Download: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Close:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bell:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
}

/* ══ Badge ══════════════════════════════════════════ */
function Badge({ label }: { label: string }) {
  const l = label.toLowerCase()
  let cls = s.badge + ' '
  if (['pdf','png','jpg','webp'].includes(l)) cls += s.badgePdf
  else if (l.match(/^(as|l|m|ing)\d/i)) cls += s.badgeClass
  else if (['cours','td','tp','examen','corrigé','devoir','corrige','iidcu','word'].includes(l)) cls += s.badgeType
  else cls += s.badgeDraft
  return <span className={cls}>{label}</span>
}

/* ══ Preview Modal ══════════════════════════════════ */
function PreviewModal({ doc, onClose, t }: { doc: Document; onClose: () => void; t: (k: string) => string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGetDocumentUrl(doc.id, 'preview')
      .then(r => setUrl(r.url))
      .catch(() => setError(t('noPreview')))
      .finally(() => setLoading(false))
  }, [doc.id, t])

  const handleDownload = async () => {
    try {
      const r = await apiGetDocumentUrl(doc.id, 'download')
      const a = document.createElement('a')
      a.href = r.url; a.download = r.file_name
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch { alert(t('downloadError')) }
  }

  const isPdf = doc.mime_type === 'application/pdf'
  const isImg = doc.mime_type?.startsWith('image/')

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.75)',
      display:'flex', flexDirection:'column', animation:'fadeIn 0.2s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{ background:'#111827', padding:'12px 20px', display:'flex',
        alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{doc.title}</div>
          <div style={{fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2}}>{doc.file_name}{doc.file_size ? ` · ${(doc.file_size/1024).toFixed(0)} Ko` : ''}</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={handleDownload} style={{display:'flex', alignItems:'center', gap:7,
            padding:'8px 16px', background:'#2563eb', color:'#fff',
            border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer'}}>
            <IC.Download/> {t('download')}
          </button>
          <button onClick={onClose} style={{width:36, height:36, background:'rgba(255,255,255,0.1)',
            border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
            <IC.Close/>
          </button>
        </div>
      </div>
      <div style={{flex:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
        {loading && <div style={{color:'rgba(255,255,255,0.7)', textAlign:'center'}}><div style={{fontSize:32, marginBottom:12}}>⏳</div><p>{t('loading')}</p></div>}
        {error  && <div style={{color:'#fca5a5', textAlign:'center'}}><div style={{fontSize:32, marginBottom:12}}>⚠️</div><p>{error}</p></div>}
        {url && (isImg
          ? <img src={url} alt={doc.title} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:8}}/>
          : isPdf
            ? <iframe src={url} style={{width:'100%', height:'100%', border:'none', borderRadius:8}} title={doc.title}/>
            : <div style={{color:'#fff', textAlign:'center'}}>
                <div style={{fontSize:48, marginBottom:16}}>📎</div>
                <div style={{fontSize:15, fontWeight:700, marginBottom:20}}>{doc.file_name}</div>
                <button onClick={handleDownload} style={{padding:'10px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer'}}>⬇ {t('download')}</button>
              </div>
        )}
      </div>
    </div>
  )
}

/* ══ Notification Dropdown ══════════════════════════ */
function NotifDropdown({ count, today, t, onClose }: {
  count: number; today: string; t: (k: string) => string; onClose: () => void
}) {
  return (
    <div className={s.notifDropdown}>
      <div className={s.notifDropdownHeader}>
        <span className={s.notifDropdownTitle}>{t('notifTitle')}</span>
        <button className={s.notifCloseBtn} onClick={onClose}><IC.Close/></button>
      </div>
      <div className={s.notifDropdownBody}>
        {count > 0 ? (
          <div className={s.notifItem}>
            <div className={s.notifItemIcon}>📄</div>
            <div className={s.notifItemText}>
              <span className={s.notifItemCount}>{count}</span> {t('notifToday')}
            </div>
          </div>
        ) : (
          <div className={s.notifEmpty}>{t('notifNone')}</div>
        )}
      </div>
    </div>
  )
}

/* ══ Document Card ══════════════════════════════════ */
function DocCard({ doc, onPreview, onDownload }: {
  doc: Document; onPreview: (d: Document) => void; onDownload: (d: Document) => void
}) {
  const teacherName = doc.teachers[0]?.name ?? doc.uploaded_by ?? '—'
  const teacherInit = teacherName.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className={s.docCard}>
      <div className={s.docCardTop}>
        <div className={s.docCardBadges}>
          {doc.badges.slice(0,4).map((b: string) => <Badge key={b} label={b}/>)}
        </div>
        <div className={s.docCardTitle}>{doc.title}</div>
        {doc.description && <div className={s.docCardDesc}>{doc.description}</div>}
      </div>
      <div className={s.docCardMeta}>
        <div className={s.docCardTeacher}>
          <div className={s.teacherAvatar}>{teacherInit}</div>
          <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{teacherName}</span>
        </div>
        <div className={s.docCardActions}>
          <button className={s.docBtn} onClick={() => onPreview(doc)} title="Visualiser"><IC.Eye/></button>
          <button className={s.docBtn} onClick={() => onDownload(doc)} title="Télécharger" style={{color:'var(--primary)'}}><IC.Download/></button>
        </div>
      </div>
    </div>
  )
}

/* ══ Page principale ════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter()

  const { lang, toggleLang, t } = useLang()

  const [profile,    setProfile]    = useState<UserProfile | null>(null)
  const [docs,       setDocs]       = useState<Document[]>([])
  const [count,      setCount]      = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [initDone,   setInitDone]   = useState(false)
  const [classes,    setClasses]    = useState<ClassItem[]>([])
  const [subjects,   setSubjects]   = useState<SubjectItem[]>([])
  const [years,      setYears]      = useState<AcademicYear[]>([])
  const [docTypes,   setDocTypes]   = useState<DocumentType[]>([])
  const [teachers,   setTeachers]   = useState<Teacher[]>([])
  const [corpus,     setCorpus]     = useState<string[]>([])
  const [filters, setFilters] = useState({ class_id:'', subject_id:'', year_id:'', type_id:'', teacher_id:'' })
  const [query,      setQuery]      = useState('')
  const [suggestions, setSugg]      = useState<string[]>([])
  const [showSugg,   setShowSugg]   = useState(false)
  const [sideOpen,   setSideOpen]   = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  /* ── Notifications state ── */
  const [notifCount,   setNotifCount]   = useState(0)
  const [notifDate,    setNotifDate]    = useState('')
  const [showNotif,    setShowNotif]    = useState(false)
  const [notifVisible, setNotifVisible] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  /* ── Load notifications ── */
  useEffect(() => {
    apiGetNotificationsToday()
      .then(data => {
        const today = data.date // 'YYYY-MM-DD'
        const seenDate = getNotifSeenDate()
        // Afficher le badge seulement si on n'a pas encore vu les notifs d'aujourd'hui
        if (data.count > 0 && seenDate !== today) {
          setNotifCount(data.count)
          setNotifDate(today)
          setNotifVisible(true)
        }
      })
      .catch(() => {/* silencieux */})
  }, [])

  /* ── Close notif on outside click ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── Mark notif as seen when dropdown opened ── */
  const handleBellClick = () => {
    setShowNotif(prev => !prev)
    if (!showNotif && notifDate) {
      setNotifSeenDate(notifDate)
      setNotifVisible(false)
    }
  }

  /* ── Load profile & referentials ── */
  useEffect(() => {
    const cached = getProfile()
    if (cached) {
      setProfile(cached)
      if (cached.class_id) setFilters(f => ({...f, class_id: cached.class_id ?? ''}))
    } else {
      apiMe().then(p => {
        setProfile(p)
        if (p.class_id) setFilters(f => ({...f, class_id: p.class_id ?? ''}))
      }).catch(() => router.push('/auth'))
    }
    Promise.all([apiGetClasses(), apiGetSubjects(), apiGetYears(), apiGetDocTypes(), apiGetTeachers()])
      .then(([c, su, y, dt, te]) => {
        setClasses(c); setSubjects(su); setYears(y); setDocTypes(dt); setTeachers(te)
        const tokens = new Set<string>()
        c.forEach(x => { tokens.add(x.label); tokens.add(x.code) })
        su.forEach(x => tokens.add(x.name))
        y.forEach(x => tokens.add(x.label))
        dt.forEach(x => tokens.add(x.label))
        te.forEach(x => tokens.add(x.full_name))
        setCorpus([...tokens].filter(Boolean))
      }).catch(console.error)
  }, [router])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSugg(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setSugg([]); setShowSugg(false); return }
    const timer = setTimeout(() => {
      const s = levenshteinSuggest(query, corpus, 7)
      setSugg(s); setShowSugg(s.length > 0)
    }, 180)
    return () => clearTimeout(timer)
  }, [query, corpus])

  const loadDocs = useCallback(async (q: string, f: typeof filters) => {
    setLoading(true)
    try {
      const data = await apiGetDocuments({
        search: q || undefined,
        class_id: f.class_id || undefined,
        subject_id: f.subject_id || undefined,
        academic_year_id: f.year_id || undefined,
        document_type_id: f.type_id || undefined,
        teacher_id: f.teacher_id || undefined,
      })
      setDocs(data.results); setCount(data.count)
      if (data.results.length > 0) {
        setCorpus(prev => {
          const extra = data.results.flatMap((d: Document) => [d.title, ...(d.description ? [d.description] : [])])
          return [...new Set([...prev, ...extra])]
        })
      }
    } catch { setDocs([]); setCount(0) }
    finally { setLoading(false); setInitDone(true) }
  }, [])

  useEffect(() => {
    if (!profile) return
    loadDocs(query, filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, profile])

  const doSearch = () => { setShowSugg(false); loadDocs(query, filters) }
  const pickSuggestion = (w: string) => { setQuery(w); setShowSugg(false); loadDocs(w, filters) }
  const clearSearch = () => { setQuery(''); setSugg([]); loadDocs('', filters) }
  const setFilter = (k: string, v: string) => {
    const next = { ...filters, [k]: v }
    if (k === 'class_id') next.subject_id = ''
    setFilters(next)
  }
  const clearFilters = () => setFilters({ class_id: profile?.class_id ?? '', subject_id:'', year_id:'', type_id:'', teacher_id:'' })
  const handleDownload = async (doc: Document) => {
    try {
      const r = await apiGetDocumentUrl(doc.id, 'download')
      const a = document.createElement('a'); a.href = r.url; a.download = r.file_name
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch { alert(t('downloadError')) }
  }
  const handleLogout = async () => { await apiLogout(); router.push('/auth') }

  const initials = (profile?.full_name ?? profile?.email ?? '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const filteredSubs = filters.class_id ? subjects.filter(su => su.class_id === filters.class_id || !su.class_id) : subjects
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className={s.shell}>
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} t={t}/>}
      <div className={`${s.overlay} ${!sideOpen ? s.overlayHidden : ''}`} onClick={() => setSideOpen(false)}/>

      {/* ══ SIDEBAR ══ */}
      <aside className={`${s.sidebar} ${sideOpen ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarTop}>
          <div className={s.brandRow}>
            <Image src="/logo.png" alt="ENSEA DSC" width={38} height={38}
              style={{borderRadius:9, objectFit:'contain', flexShrink:0}} priority/>
            <div className={s.brandNames}>
              <span className={s.brandApp}>G<span>-baki AI</span></span>
              <span className={s.brandSub}>ENSEA Data Science Club</span>
            </div>
          </div>
          <div className={s.sidebarProfile}>
            <div className={s.sidebarAvatar}>{initials}</div>
            <div style={{minWidth:0}}>
              <div className={s.sidebarName}>{profile?.full_name ?? profile?.email ?? '—'}</div>
              <div className={s.sidebarRole}>{profile?.class_code ?? t('studentBadge')}</div>
            </div>
          </div>
        </div>
        <nav className={s.nav}>
          <div className={s.navSection}>{t('navNavigation')}</div>
          <button className={`${s.navItem} ${s.navItemActive}`}><IC.Home/>{t('navHome')}</button>
          <button className={s.navItem} onClick={() => {
            clearSearch()
            setFilters({ class_id: profile?.class_id ?? '', subject_id:'', year_id:'', type_id:'', teacher_id:'' })
          }}><IC.Docs/>{t('navAllDocs')}</button>
          <div className={s.navSection}>{t('navMyAccount')}</div>
          <button className={s.navItem} onClick={() => router.push('/settings')}><IC.Settings/>{t('navSettings')}</button>
        </nav>
        <div className={s.sidebarBottom}>
          <button className={s.logoutFull} onClick={handleLogout}><IC.Logout/> {t('navLogout')}</button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.menuToggle} onClick={() => setSideOpen(!sideOpen)}><IC.Menu/></button>
          <div className={s.topbarLeft}>
            <div className={s.topbarTitle}>
              {t('hello')}, {profile?.full_name ?? profile?.email ?? '—'}
              {profile?.class_code && <span> — {profile.class_code}</span>}
            </div>
          </div>

          {/* ── Bouton langue ── */}
          <button
            className={s.iconBtn}
            onClick={toggleLang}
            title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            style={{fontWeight:700, fontSize:12, letterSpacing:'0.03em', gap:0, width:'auto', padding:'0 10px', minWidth:38}}
          >
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>


          {/* ── Cloche notifications ── */}
          <div style={{position:'relative'}} ref={notifRef}>
            <button className={s.iconBtn} onClick={handleBellClick} title="Notifications">
              <IC.Bell/>
              {notifVisible && notifCount > 0 && (
                <span className={s.notifBadge}>{notifCount > 99 ? '99+' : notifCount}</span>
              )}
            </button>
            {showNotif && (
              <NotifDropdown
                count={notifCount}
                today={notifDate}
                t={t}
                onClose={() => setShowNotif(false)}
              />
            )}
          </div>
        </header>

        <main className={s.content}>
          {/* ── Recherche ── */}
          <div className={s.searchSection} ref={searchRef}>
            <div className={s.searchTitle}>{t('searchTitle')}</div>
            <div className={s.searchHint}>
              {t('searchHint')} <em>{t('searchHintExample')}</em>
            </div>
            <div style={{position:'relative'}}>
              <div className={s.searchInputRow}>
                <div className={s.searchIcon}><IC.Search size={17} color="#94a3b8"/></div>
                <input
                  className={s.searchInput}
                  placeholder={t('searchPlaceholder')}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                  autoComplete="off"
                />
                {query && <button onClick={clearSearch} className={s.clearBtn}><IC.Close/></button>}
                <button className={s.searchBtn} onClick={doSearch} disabled={loading}>
                  <IC.Search size={15}/> {t('searchBtn')}
                </button>
              </div>
              {showSugg && suggestions.length > 0 && (
                <div className={s.autocompleteDropdown}>
                  {suggestions.map(sug => (
                    <div key={sug} className={s.autocompleteItem} onClick={() => pickSuggestion(sug)}>
                      <IC.Search size={12}/> {sug}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Filtres ── */}
          <div className={s.filtersSection}>
            <div className={s.filterGroup}>
              <label className={s.filterLabel}>{t('filterSubject')}</label>
              <select className={s.filterSelect} value={filters.subject_id} onChange={e => setFilter('subject_id', e.target.value)}>
                <option value="">{t('filterAllSubjects')}</option>
                {filteredSubs.map(su => <option key={su.id} value={su.id}>{su.name}</option>)}
              </select>
            </div>
            <div className={s.filterGroup}>
              <label className={s.filterLabel}>{t('filterTeacher')}</label>
              <select className={s.filterSelect} value={filters.teacher_id} onChange={e => setFilter('teacher_id', e.target.value)}>
                <option value="">{t('filterAllTeachers')}</option>
                {teachers.map(tch => <option key={tch.id} value={tch.id}>{tch.full_name}</option>)}
              </select>
            </div>
            <div className={s.filterGroup}>
              <label className={s.filterLabel}>{t('filterYear')}</label>
              <select className={s.filterSelect} value={filters.year_id} onChange={e => setFilter('year_id', e.target.value)}>
                <option value="">{t('filterAllYears')}</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
              </select>
            </div>
            <div className={s.filterGroup}>
              <label className={s.filterLabel}>{t('filterType')}</label>
              <select className={s.filterSelect} value={filters.type_id} onChange={e => setFilter('type_id', e.target.value)}>
                <option value="">{t('filterAllTypes')}</option>
                {docTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.label}</option>)}
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <button className={s.resetBtn} onClick={clearFilters}><IC.Close/> {t('filterReset')}</button>
            )}
          </div>

          {/* ── Résultats ── */}
          <div className={s.resultsHeader}>
            <div className={s.resultsTitle}>{t('resultsTitle')}</div>
            <div className={s.resultsMeta}>
              {loading ? t('loading') : `${count} ${count !== 1 ? t('docCountN') : t('docCount1')}`}
            </div>
          </div>

          {!initDone || loading ? (
            <div className={s.empty}><div className={s.emptyIcon}>⏳</div><div className={s.emptyTitle}>{t('loadingDocs')}</div></div>
          ) : docs.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>{query ? '🔍' : '📭'}</div>
              <div className={s.emptyTitle}>{query ? t('emptyNoResult') : t('emptyNoDocs')}</div>
              <div className={s.emptySub}>{query ? t('emptyNoResultSub') : t('emptyNoDocsSub')}</div>
            </div>
          ) : (
            <div className={s.docsGrid}>
              {docs.map(doc => <DocCard key={doc.id} doc={doc} onPreview={setPreviewDoc} onDownload={handleDownload}/>)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}