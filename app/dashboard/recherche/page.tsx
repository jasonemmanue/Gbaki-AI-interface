'use client'
/*
 * GBAKI-AI — app/dashboard/recherche/page.tsx — Recherche intelligente
 * Cherche dans le texte indexé des documents : page, ligne, correspondance exacte ou proche.
 */
import { Suspense, useEffect, useMemo, useRef, useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import s from './recherche.module.css'
import * as I from '../../../components/icons'
import { openDocument } from '../../../components/docActions'
import { shortYear, splitBySpans } from '../../../components/format'
import { useShell } from '../../../components/shell'
import { useLang } from '../../../context/LangContext'
import {
  apiFulltextSearch, apiGetPageText, type FulltextResponse, type PageText, type SearchHit,
} from '../../../lib/api'

const EXAMPLES = ['biais estimateur', 'variance', 'série géométrique', 'espace vectoriel']
type Tab = 'all' | 'exact' | 'close'

function Marked({ text, spans }: { text: string; spans: [number, number][] }) {
  return <>{splitBySpans(text, spans).map((p, i) => p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>)}</>
}

function SearchView() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const { profile } = useShell()
  const urlQ = params.get('q') ?? ''

  const [input, setInput] = useState(urlQ)
  const [scopeAll, setScopeAll] = useState(false)
  const [data, setData] = useState<FulltextResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [index, setIndex] = useState(0)

  useEffect(() => { setInput(urlQ) }, [urlQ])

  useEffect(() => {
    if (urlQ.trim().length < 2) { setData(null); return }
    let cancelled = false
    setLoading(true); setError(''); setIndex(0); setTab('all')
    apiFulltextSearch(urlQ, scopeAll ? null : profile.class_id)
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) { setError((e as Error).message); setData(null) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [urlQ, scopeAll, profile.class_id])

  const submit = (q: string) => {
    const v = q.trim()
    router.push(v ? `/dashboard/recherche?q=${encodeURIComponent(v)}` : '/dashboard/recherche')
  }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(input) }

  const hits = useMemo(() => {
    if (!data) return []
    return tab === 'all' ? data.results : data.results.filter(h => h.kind === tab)
  }, [data, tab])
  const current: SearchHit | undefined = hits[index]

  return (
    <div className={s.layout}>
      <div className={s.top}>
        <div className={s.topRow}>
          <h1 className={s.title}>{t('navSmartSearch')}</h1>
          <div className={s.examples}>
            <span>{t('searchExamples')}</span>
            {EXAMPLES.map(x => <button key={x} className={s.example} onClick={() => submit(x)}>{x}</button>)}
          </div>
        </div>
        <form className={s.searchBox} onSubmit={onSubmit} role="search">
          <I.Search size={18} />
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={t('searchPlaceholderFull')}
            aria-label={t('navSmartSearch')} autoFocus={!urlQ} />
        </form>
        <div className={s.understood}>
          {data && (
            <>
              <span className={s.understoodLabel}>{t('searchUnderstood')}</span>
              <span className={s.understoodChip}>
                {t('searchText')} « {data.query} »
                <button onClick={() => submit('')} aria-label="Effacer">×</button>
              </span>
              {data.corrections.map(c => (
                <span key={c.from} className={s.understoodChip}>{c.from} {t('searchCorrected')} « {c.to} »</span>
              ))}
            </>
          )}
          <label className={s.scope}>
            <input type="checkbox" checked={scopeAll} onChange={e => setScopeAll(e.target.checked)} />
            {scopeAll ? t('searchScopeAll') : `${t('searchScopeMine')} (${profile.class_code ?? ''})`}
          </label>
          {data && (
            <div className={s.tabs} role="tablist">
              {([['all', t('tabAll'), data.count], ['exact', t('tabExact'), data.exact_count], ['close', t('tabClose'), data.close_count]] as const)
                .map(([k, label, n]) => (
                  <button key={k} role="tab" aria-selected={tab === k} className={`${s.tab} ${tab === k ? s.tabActive : ''}`}
                    onClick={() => { setTab(k); setIndex(0) }}>{label} · {n}</button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.body}>
        <section className={s.results}>
          {!urlQ && <p className={s.notice}>{t('searchIntro')}</p>}
          {loading && <p className={s.notice}>{t('searching')}</p>}
          {error && <p className={s.notice}>{error}</p>}
          {data && !loading && (
            <>
              <div className={s.count}>{t('matchesIn', { n: hits.length, d: data.documents_count })}</div>
              {hits.length === 0 && <p className={s.notice}>{t('searchNothing')}</p>}
              {hits.map((h, i) => {
                const doc = data.documents[h.document_id]
                return (
                  <button key={`${h.document_id}-${h.page}-${h.line}`} className={`${s.hit} ${i === index ? s.hitActive : ''}`}
                    onClick={() => setIndex(i)}>
                    <span className={s.hitTop}>
                      <span className={h.kind === 'exact' ? s.kindExact : s.kindClose}>{h.kind === 'exact' ? t('kindExact') : t('kindClose')}</span>
                      <span className={s.hitPos}>p. {h.page} · {t('lineWord')} {h.line}</span>
                    </span>
                    <span className={s.hitTitle}>{doc?.title}</span>
                    <span className={s.hitText}><Marked text={h.text} spans={h.spans} /></span>
                    {h.found && <span className={s.hitFound}>{t('foundFor', { w: h.found.word, f: h.found.for })}</span>}
                  </button>
                )
              })}
            </>
          )}
        </section>

        <section className={s.viewer}>
          {current && data
            ? <PageViewer hit={current} doc={data.documents[current.document_id]} q={data.query}
                position={index} total={hits.length} onMove={d => setIndex(i => Math.min(hits.length - 1, Math.max(0, i + d)))} />
            : <div className={s.viewerEmpty}><I.FileText size={28} /></div>}
        </section>
      </div>
    </div>
  )
}

function PageViewer({ hit, doc, q, position, total, onMove }: {
  hit: SearchHit; doc: FulltextResponse['documents'][string]; q: string
  position: number; total: number; onMove: (delta: number) => void
}) {
  const { t } = useLang()
  const [page, setPage] = useState<PageText | null>(null)
  const [opening, setOpening] = useState(false)
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setPage(null)
    apiGetPageText(hit.document_id, hit.page, q).then(p => { if (!cancelled) setPage(p) }).catch(() => {})
    return () => { cancelled = true }
  }, [hit.document_id, hit.page, q])

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }) }, [page, hit.line])

  const pageCount = page?.page_count ?? doc?.page_count
  const open = async () => {
    setOpening(true)
    try { await openDocument(hit.document_id, hit.page) } catch { /* message inutile : onglet fermé */ } finally { setOpening(false) }
  }

  return (
    <div className={s.viewerInner}>
      <div className={s.viewerHead}>
        <div className={s.viewerTitleWrap}>
          <div className={s.viewerTitle}>{doc?.title}</div>
          <div className={s.viewerMeta}>
            {[doc?.document_type, doc?.subject, shortYear(doc?.academic_year ?? null)].filter(Boolean).join(' · ')}
            {' · '}{t('pageOf', { p: hit.page, n: pageCount ?? '?' })} · {t('lineWord')} {hit.line}
          </div>
        </div>
        <div className={s.viewerNav}>
          <button onClick={() => onMove(-1)} disabled={position <= 0} aria-label={t('prevBtn')}><I.ChevronLeft size={15} /></button>
          <span>{position + 1} / {total}</span>
          <button onClick={() => onMove(1)} disabled={position >= total - 1} aria-label={t('nextBtn')}><I.ChevronRight size={15} /></button>
        </div>
        <button className={s.openBtn} onClick={open} disabled={opening}>{t('openAtPage')}</button>
      </div>

      <div className={s.paperWrap}>
        <div className={s.paper}>
          <div className={s.paperHead}>
            <span>ENSEA · {doc?.class_code} · {doc?.subject}</span>
            <span>{t('pageOf', { p: hit.page, n: pageCount ?? '?' })}</span>
          </div>
          {!page && <div className={s.paperLoading}>{t('loading')}</div>}
          {page?.lines.map(l => (
            <div key={l.n} ref={l.n === hit.line ? activeRef : undefined} className={`${s.line} ${l.n === hit.line ? s.lineActive : ''}`}>
              <span className={s.lineNo}>{l.n}</span>
              <span className={s.lineText}><Marked text={l.text} spans={l.n === hit.line ? l.spans : []} /></span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.viewerNote}>
        <span className={hit.kind === 'exact' ? s.kindExact : s.kindClose}>{hit.kind === 'exact' ? t('exactMatch') : t('closeMatch')}</span>
        <span>{hit.kind === 'exact' ? t('exactNote', { n: hit.line }) : t('closeNote', { n: hit.line })}</span>
      </div>
    </div>
  )
}

export default function RecherchePage() {
  return <Suspense fallback={null}><SearchView /></Suspense>
}
