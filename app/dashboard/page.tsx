'use client'
/*
 * GBAKI-AI — app/dashboard/page.tsx — Accueil
 * Bandeau, accès à la recherche intelligente et à l'IA, derniers documents de la classe.
 */
import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import s from './home.module.css'
import * as I from '../../components/icons'
import { formatDay, teacherNames } from '../../components/format'
import { useShell } from '../../components/shell'
import { useLang } from '../../context/LangContext'
import { apiGetDocuments, type Document } from '../../lib/api'

const AI_CHIPS = ['Explique-moi la loi binomiale', 'Quiz sur les suites']

export default function HomePage() {
  const router = useRouter()
  const { t, lang } = useLang()
  const { profile } = useShell()
  const [q, setQ] = useState('')
  const [ask, setAsk] = useState('')
  const [recent, setRecent] = useState<Document[] | null>(null)

  useEffect(() => {
    apiGetDocuments({ class_id: profile.class_id ?? undefined, page_size: 4 })
      .then(d => setRecent(d.results))
      .catch(() => setRecent([]))
  }, [profile.class_id])

  const goSearch = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/dashboard/recherche?q=${encodeURIComponent(q.trim())}`)
  }
  const goAsk = (text: string) => router.push(`/dashboard/assistant${text.trim() ? `?q=${encodeURIComponent(text.trim())}` : ''}`)

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={s.heroText}>
          <div className={s.kicker}>{t('heroKicker')}</div>
          <h1 className={s.heroTitle}>{t('heroTitle')}</h1>
          <p className={s.heroSub}>{t('heroSub')}</p>
          <div className={s.heroActions}>
            <Link href="/dashboard/documents" className={s.btnLight}>{t('heroExplore')}</Link>
            <Link href="/dashboard/assistant" className={s.btnGhost}>{t('heroAsk')}</Link>
          </div>
        </div>
        <div className={s.heroImage} aria-hidden />
      </section>

      <section className={s.cards}>
        <form className={s.card} onSubmit={goSearch}>
          <div className={s.cardKicker}><I.Search size={15} /> {t('cardSearchKicker')}</div>
          <h2 className={s.cardTitle}>{t('cardSearchTitle')}</h2>
          <div className={s.inputRow}>
            <input className={s.input} value={q} onChange={e => setQ(e.target.value)}
              placeholder={t('cardSearchPlaceholder')} aria-label={t('cardSearchKicker')} />
            <button className={s.btn} type="submit">{t('searchBtn')}</button>
          </div>
          <p className={s.cardHint}>{t('cardSearchHint')}</p>
        </form>

        <form className={s.card} onSubmit={e => { e.preventDefault(); goAsk(ask) }}>
          <div className={s.cardKicker}><I.Sparkle size={15} /> {t('cardAiKicker')}</div>
          <h2 className={s.cardTitle}>{t('cardAiTitle')}</h2>
          <div className={s.inputRow}>
            <input className={s.input} value={ask} onChange={e => setAsk(e.target.value)}
              placeholder={t('cardAiPlaceholder')} aria-label={t('cardAiKicker')} />
            <button className={s.btn} type="submit">{t('cardAiBtn')}</button>
          </div>
          <div className={s.chips}>
            {AI_CHIPS.map(c => (
              <button key={c} type="button" className={s.chip} onClick={() => goAsk(c)}>{c}</button>
            ))}
          </div>
        </form>
      </section>

      <section>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>{t('recentTitle')}</h2>
          <Link href="/dashboard/documents" className={s.sectionLink}>{t('recentAll')}</Link>
        </div>
        <div className={s.recent}>
          {recent === null
            ? [0, 1, 2, 3].map(i => <div key={i} className={`${s.docCard} ${s.skeleton}`} />)
            : recent.map(doc => (
              <Link key={doc.id} href={`/dashboard/documents?doc=${doc.id}`} className={s.docCard}>
                <div className={s.docChips}>
                  {doc.document_type && <span className={s.tag}>{doc.document_type}</span>}
                  {doc.subject && <span className={s.tagMuted}>{doc.subject}</span>}
                </div>
                <div className={s.docTitle}>{doc.title}</div>
                <div className={s.docMeta}>{teacherNames(doc) ? `${teacherNames(doc)} · ` : ''}{formatDay(doc.created_at, lang)}</div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}
