'use client'
/*
 * GBAKI-AI — app/dashboard/assistant/page.tsx — Assistant IA
 * Mise en page posée ; l'assistant n'est pas encore branché sur un modèle.
 * Une question envoyée est proposée à la recherche intelligente, qui trouve déjà les passages.
 */
import { Suspense, useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import s from './assistant.module.css'
import * as I from '../../../components/icons'
import { BrandMark, useShell } from '../../../components/shell'
import { useLang } from '../../../context/LangContext'

const SUGGESTIONS = ['Résume le chapitre sur les séries', 'Explique la loi binomiale', "Qu'est-ce qu'un intervalle de confiance ?"]

function AssistantView() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const { profile } = useShell()
  const [input, setInput] = useState('')
  const [asked, setAsked] = useState<string[]>([])

  useEffect(() => {
    const q = params.get('q')
    if (q) setAsked([q])
  }, [params])

  const send = (text: string) => {
    const v = text.trim()
    if (!v) return
    setAsked(a => [...a, v]); setInput('')
  }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input) }

  return (
    <div className={s.layout}>
      <div className={s.head}>
        <h1 className={s.title}>{asked[0] ?? t('navAssistant')}</h1>
        <span className={s.sources}>{t('assistantSources', { c: profile.class_code ?? '' })}</span>
        <button className={s.newBtn} onClick={() => { setAsked([]); router.replace('/dashboard/assistant') }}>
          <I.Plus size={14} /> {t('newConversation')}
        </button>
      </div>

      <div className={s.thread}>
        {asked.length === 0 && (
          <div className={s.soon}>
            <BrandMark />
            <h2>{t('assistantSoonTitle')}</h2>
            <p>{t('assistantSoonText')}</p>
            <Link href="/dashboard/recherche" className={s.soonLink}>{t('assistantTry')} <I.ArrowRight size={14} /></Link>
          </div>
        )}
        {asked.map((q, i) => (
          <div key={i} className={s.exchange}>
            <div className={s.question}>{q}</div>
            <div className={s.answer}>
              <span className={s.answerMark}><BrandMark /></span>
              <div>
                <p>{t('assistantSoonTitle')}. {t('assistantSoonText')}</p>
                <Link href={`/dashboard/recherche?q=${encodeURIComponent(q)}`} className={s.soonLink}>
                  {t('assistantTry')} : « {q} » <I.ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form className={s.composer} onSubmit={onSubmit}>
        <div className={s.suggestions}>
          {SUGGESTIONS.map(x => <button key={x} type="button" className={s.suggestion} onClick={() => send(x)}>{x}</button>)}
        </div>
        <div className={s.inputRow}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={t('assistantPlaceholder')} aria-label={t('navAssistant')} />
          <button type="submit" className={s.sendBtn}>{t('sendBtn')} <I.ArrowRight size={14} /></button>
        </div>
        <p className={s.disclaimer}>{t('assistantDisclaimer')}</p>
      </form>
    </div>
  )
}

export default function AssistantPage() {
  return <Suspense fallback={null}><AssistantView /></Suspense>
}
