'use client'
/*
 * GBAKI-AI — app/dashboard/documents/page.tsx
 * Documents : classe (celle du profil par défaut, toutes accessibles), filtres, tableau paginé,
 * panneau d'aperçu (1re page).
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import s from './documents.module.css'
import * as I from '../../../components/icons'
import Thumbnail from '../../../components/Thumbnail'
import { downloadDocument, openDocument } from '../../../components/docActions'
import { fileExt, formatSize, shortYear, teacherNames } from '../../../components/format'
import { useShell } from '../../../components/shell'
import { useLang } from '../../../context/LangContext'
import {
  apiGetClasses, sortClasses, apiGetDocTypes, apiGetDocument, apiGetDocuments, apiGetFolderFiles, apiGetSubjects, apiGetTeachers, apiGetYears,
  type AcademicYear, type ClassItem, type Document, type DocumentType, type FolderFile, type SubjectItem, type Teacher,
} from '../../../lib/api'

const PAGE_SIZE = 50

interface Filters { subject_id: string; teacher_id: string; academic_year_id: string; document_type_id: string }
const EMPTY: Filters = { subject_id: '', teacher_id: '', academic_year_id: '', document_type_id: '' }

function DocumentsView() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const { profile } = useShell()

  // Classe consultée : ?class=… sinon celle du profil ; chaque étudiant peut parcourir toutes les classes
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [classId, setClassId] = useState(() => params.get('class') ?? profile.class_id ?? '')
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [types, setTypes] = useState<DocumentType[]>([])

  const [filters, setFilters] = useState<Filters>(() => ({ ...EMPTY, subject_id: params.get('subject') ?? '' }))
  const [titleInput, setTitleInput] = useState('')
  const [title, setTitle] = useState('')
  const [page, setPage] = useState(1)
  const [docs, setDocs] = useState<Document[]>([])
  const [count, setCount] = useState(0)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState<Document | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    apiGetClasses().then(cs => setClasses(sortClasses(cs))).catch(() => {})
    apiGetTeachers().then(setTeachers).catch(() => {})
    apiGetYears().then(setYears).catch(() => {})
    apiGetDocTypes().then(setTypes).catch(() => {})
  }, [])

  useEffect(() => {
    apiGetSubjects(classId || undefined).then(setSubjects).catch(() => {})
  }, [classId])

  // Filtre par titre : attend la fin de la frappe
  useEffect(() => {
    const id = setTimeout(() => { setTitle(titleInput.trim()); setPage(1) }, 300)
    return () => clearTimeout(id)
  }, [titleInput])

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    apiGetDocuments({
      class_id: classId || undefined, title: title || undefined, page, page_size: PAGE_SIZE,
      ordering: 'title', ...filters,
    })
      .then(d => {
        if (cancelled) return
        setDocs(d.results); setCount(d.count); setNumPages(d.num_pages)
        setSelected(prev => prev ?? d.results[0] ?? null)
      })
      .catch(e => { if (!cancelled) setError((e as Error).message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [classId, title, page, filters])

  // Document demandé dans l'URL (?doc=…), depuis l'accueil ou la recherche
  useEffect(() => {
    const id = params.get('doc')
    if (id) apiGetDocument(id).then(d => { setSelected(d); setPanelOpen(true) }).catch(() => {})
  }, [params])

  const setFilter = (k: keyof Filters, v: string) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }
  const changeClass = (v: string) => {
    setClassId(v); setFilters(f => ({ ...f, subject_id: '' })); setPage(1); setSelected(null)
  }
  const reset = () => {
    setClassId(profile.class_id ?? ''); setFilters(EMPTY); setTitleInput(''); setPage(1); setSelected(null)
    router.replace('/dashboard/documents')
  }
  const select = (d: Document) => { setSelected(d); setPanelOpen(true) }

  return (
    <div className={s.layout}>
      <section className={s.listCol}>
        <div className={s.head}>
          <h1 className={s.title}>{t('navDocuments')}</h1>
          <label className={s.titleFilter}>
            <I.Search size={15} />
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} placeholder={t('docsFilterTitle')} />
          </label>
        </div>

        <div className={s.filters}>
          <Select label={t('filterClass')} all={t('filterAllSubjects')} value={classId}
            onChange={changeClass} options={classes.map(x => ({ value: x.id, label: x.label }))} />
          <Select label={t('filterSubject')} all={t('filterAllSubjects')} value={filters.subject_id}
            onChange={v => setFilter('subject_id', v)} options={subjects.map(x => ({ value: x.id, label: x.name }))} />
          <Select label={t('filterTeacher')} all={t('filterAllTeachers')} value={filters.teacher_id}
            onChange={v => setFilter('teacher_id', v)} options={teachers.map(x => ({ value: x.id, label: x.full_name }))} />
          <Select label={t('filterYear')} all={t('filterAllYears')} value={filters.academic_year_id}
            onChange={v => setFilter('academic_year_id', v)} options={years.map(x => ({ value: x.id, label: x.label }))} />
          <Select label={t('colType')} all={t('filterAllTypes')} value={filters.document_type_id}
            onChange={v => setFilter('document_type_id', v)} options={types.map(x => ({ value: x.id, label: x.label }))} />
          <button className={s.resetBtn} onClick={reset}>{t('filterReset')}</button>
        </div>

        <div className={s.table} role="table" aria-busy={loading}>
          <div className={`${s.row} ${s.rowHead}`} role="row">
            <span /><span>{t('colTitle')}</span><span>{t('colTeacher')}</span><span>{t('colType')}</span><span>{t('colYear')}</span>
          </div>
          <div className={s.rows}>
            {error && <div className={s.empty}>{error}</div>}
            {!error && !loading && docs.length === 0 && (
              <div className={s.empty}><strong>{t('emptyNoResult')}</strong><span>{t('emptyNoResultSub')}</span></div>
            )}
            {docs.map(d => {
              const active = selected?.id === d.id
              return (
                <button key={d.id} role="row" className={`${s.row} ${active ? s.rowActive : ''} ${loading ? s.dim : ''}`}
                  onClick={() => select(d)} aria-pressed={active}>
                  <span className={`${s.radio} ${active ? s.radioOn : ''}`} aria-hidden />
                  <span className={s.cellTitle}>
                    <span className={s.docTitle}>{d.is_folder && <I.Folder size={13} />} {d.title}</span>
                    <span className={s.docSub}>{d.subject}{d.page_count ? ` · ${d.page_count} ${t('pagesWord')}` : ` · ${fileExt(d)}`}</span>
                  </span>
                  <span className={s.cellMuted}>{teacherNames(d)}</span>
                  <span><span className={s.chip}>{d.document_type}</span></span>
                  <span className={s.cellMuted}>{shortYear(d.academic_year)}</span>
                </button>
              )
            })}
          </div>
          <div className={s.footer}>
            <span>{count} {count > 1 ? t('docCountN') : t('docCount1')}</span>
            {numPages > 1 && (
              <span className={s.pager}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label={t('prevBtn')}><I.ChevronLeft size={14} /></button>
                {t('pageOf', { p: page, n: numPages })}
                <button onClick={() => setPage(p => Math.min(numPages, p + 1))} disabled={page >= numPages} aria-label={t('nextBtn')}><I.ChevronRight size={14} /></button>
              </span>
            )}
          </div>
        </div>
      </section>

      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ''}`}>
        {selected
          ? <DocPanel doc={selected} onClose={() => setPanelOpen(false)} onSelect={select} />
          : <div className={s.empty}>{t('selectDocHint')}</div>}
      </aside>
    </div>
  )
}

function Select({ label, all, value, onChange, options }: {
  label: string; all: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <label className={s.select}>
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{all}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

function DocPanel({ doc, onClose, onSelect }: { doc: Document; onClose: () => void; onSelect: (d: Document) => void }) {
  const { t } = useLang()
  const [related, setRelated] = useState<Document[]>([])
  const [files, setFiles] = useState<FolderFile[] | null>(null)
  const [busy, setBusy] = useState<'open' | 'download' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError(''); setFiles(null)
    apiGetDocuments({ subject_id: doc.subject_id, page_size: 4, ordering: 'title' })
      .then(d => setRelated(d.results.filter(x => x.id !== doc.id).slice(0, 3)))
      .catch(() => setRelated([]))
    if (doc.is_folder) apiGetFolderFiles(doc.id).then(setFiles).catch(e => setError((e as Error).message))
  }, [doc.id, doc.subject_id, doc.is_folder])

  const run = useCallback(async (kind: 'open' | 'download') => {
    setBusy(kind); setError('')
    try { kind === 'open' ? await openDocument(doc.id) : await downloadDocument(doc.id) }
    catch { setError(t(kind === 'open' ? 'noPreview' : 'downloadError')) }
    finally { setBusy(null) }
  }, [doc.id, t])

  const sizeLine = useMemo(() => {
    const parts = []
    if (doc.page_count) parts.push(`${doc.page_count} ${t('pagesWord')}`)
    parts.push(formatSize(doc.file_size))
    return parts.filter(Boolean).join(' · ')
  }, [doc.page_count, doc.file_size, t])

  return (
    <div className={s.panelInner}>
      <button className={s.panelClose} onClick={onClose} aria-label={t('notifClose')}><I.Close /></button>
      <div className={s.panelChips}>
        {doc.document_type && <span className={s.chip}>{doc.document_type}</span>}
        {doc.class_info && <span className={s.chipMuted}>{doc.class_info.code}</span>}
        <span className={s.chipMuted}>{doc.is_folder ? t('folderBadge') : fileExt(doc)}</span>
      </div>
      <h2 className={s.panelTitle}>{doc.title}</h2>
      {doc.description && <p className={s.panelDesc}>{doc.description}</p>}

      {doc.is_folder ? (
        <div className={s.files}>
          <div className={s.relatedLabel}>{t('folderFiles')}</div>
          {files === null && !error && <div className={s.cellMuted}>{t('loading')}</div>}
          {files?.map(f => (
            <a key={f.path} href={f.url} className={s.fileRow} download>
              <I.Download size={13} /><span className={s.fileName}>{f.name}</span><span className={s.cellMuted}>{formatSize(f.size)}</span>
            </a>
          ))}
        </div>
      ) : (
        <Thumbnail doc={doc} fallbackText={t('noThumbnail')} />
      )}

      <div className={s.meta}>
        <Meta label={t('filterSubject')} value={doc.subject ?? ''} />
        <Meta label={t('colTeacher')} value={teacherNames(doc)} />
        <Meta label={t('colYear')} value={doc.academic_year ?? ''} />
        <Meta label={t('sizeLabel')} value={sizeLine} />
      </div>

      {!doc.is_folder && (
        <div className={s.actions}>
          <button className={s.btnOutline} onClick={() => run('open')} disabled={!!busy}>
            <I.Eye size={15} /> {busy === 'open' ? t('loading') : t('openBtn')}
          </button>
          <button className={s.btnPrimary} onClick={() => run('download')} disabled={!!busy}>
            <I.Download size={15} /> {busy === 'download' ? t('loading') : t('download')}
          </button>
        </div>
      )}
      {error && <p className={s.error}>{error}</p>}

      {related.length > 0 && (
        <div className={s.related}>
          <div className={s.relatedLabel}>{t('sameSubject')}</div>
          {related.map(r => (
            <button key={r.id} className={s.relatedRow} onClick={() => onSelect(r)}>
              <span className={s.relatedIcon}><I.FileText size={14} /></span>
              <span>
                <span className={s.relatedTitle}>{r.title}</span>
                <span className={s.docSub}>{r.document_type} · {shortYear(r.academic_year)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.metaBox}>
      <div className={s.metaLabel}>{label}</div>
      <div className={s.metaValue}>{value}</div>
    </div>
  )
}

export default function DocumentsPage() {
  return <Suspense fallback={null}><DocumentsView /></Suspense>
}
