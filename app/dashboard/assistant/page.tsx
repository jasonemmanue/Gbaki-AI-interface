'use client'
/*
 * GBAKI-AI : app/dashboard/assistant/page.tsx, Assistant IA
 * Interface de discussion (colonne des conversations, sélecteur de modèle, zone de saisie,
 * suggestions). L'IA n'est pas encore branchée : chaque question reçoit la réponse
 * « bientôt disponible » et un lien vers la recherche intelligente.
 */
import { Suspense, useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import s from './assistant.module.css'
import * as I from '../../../components/icons'
import GbakiLogo from '../../../components/GbakiLogo'
import { useShell } from '../../../components/shell'
import { useLang, type TranslationKey } from '../../../context/LangContext'

const SUGGESTIONS: [TranslationKey, TranslationKey][] = [
  ['aiSugg1Title', 'aiSugg1Sub'],
  ['aiSugg2Title', 'aiSugg2Sub'],
  ['aiSugg3Title', 'aiSugg3Sub'],
]

function SoonBadge() {
  const { t } = useLang()
  return <span className={s.soonBadge}><span className={s.soonDot} />{t('aiSoonBadge')}</span>
}

function AssistantView() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const { profile } = useShell()
  const [input, setInput] = useState('')
  const [asked, setAsked] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const threadEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = params.get('q')
    if (q) setAsked([q])
  }, [params])

  useEffect(() => { threadEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [asked])

  const send = (text: string) => {
    const v = text.trim()
    if (!v) return
    setAsked(a => [...a, v]); setInput('')
  }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input) }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }
  const reset = () => { setAsked([]); setInput(''); router.replace('/dashboard/assistant') }

  const composer = (
    <form className={s.composer} onSubmit={onSubmit}>
      <textarea
        className={s.composerInput} rows={2} value={input}
        onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        placeholder={t('aiGreeting')} aria-label={t('navAssistant')}
      />
      <div className={s.composerBar}>
        <button type="button" className={s.iconBtn} title={t('aiAttach')} aria-label={t('aiAttach')} disabled>
          <I.Plus size={16} />
        </button>
        <span className={s.composerHint}>{t('assistantSources', { c: profile.class_code ?? '' })}</span>
        <button type="submit" className={s.sendBtn} aria-label={t('sendBtn')} disabled={!input.trim()}>
          <I.ArrowRight size={16} />
        </button>
      </div>
    </form>
  )

  const chats = asked.length ? [asked[0]] : []
  const shownChats = chats.filter(c => c.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className={s.layout}>
      {/* Colonne des conversations */}
      <aside className={s.chats}>
        <button className={s.newChat} onClick={reset}><I.Plus size={15} /> {t('newConversation')}</button>
        <label className={s.chatSearch}>
          <I.Search size={14} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder={t('aiSearchChats')} />
        </label>
        <div className={s.chatsLabel}>{t('conversations')}</div>
        {shownChats.length === 0
          ? <p className={s.chatsEmpty}>{t('aiNoChats')}</p>
          : shownChats.map(c => <div key={c} className={`${s.chatItem} ${s.chatItemActive}`}>{c}</div>)}
      </aside>

      {/* Zone principale */}
      <section className={s.main}>
        <header className={s.topBar}>
          <span className={s.model}>
            <span className={s.modelMark}><GbakiLogo size={16} /></span>
            {t('aiModelName')}
            <span className={s.chevron}>▾</span>
          </span>
          <SoonBadge />
          <button className={s.newChatSmall} onClick={reset} aria-label={t('newConversation')} title={t('newConversation')}>
            <I.Plus size={15} />
          </button>
        </header>

        {asked.length === 0 ? (
          <div className={s.welcome}>
            <div className={s.hero}>
              <span className={s.heroMark}><GbakiLogo size={30} /></span>
              <h1 className={s.heroTitle}>{t('aiModelName')}</h1>
              <SoonBadge />
            </div>
            <div className={s.welcomeBox}>
              {composer}
              <div className={s.suggested}>
                <div className={s.suggestedLabel}><I.Sparkle size={13} /> {t('aiSuggested')}</div>
                {SUGGESTIONS.map(([title, sub]) => (
                  <button key={title} className={s.suggestion} onClick={() => send(t(title))}>
                    <span className={s.suggestionTitle}>{t(title)}</span>
                    <span className={s.suggestionSub}>{t(sub)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={s.thread}>
              {asked.map((q, i) => (
                <div key={i} className={s.exchange}>
                  <div className={s.question}>{q}</div>
                  <div className={s.answer}>
                    <span className={s.answerMark}><GbakiLogo size={16} /></span>
                    <div className={s.answerBody}>
                      <SoonBadge />
                      <p>{t('aiSoonReply')}</p>
                      <Link href={`/dashboard/recherche?q=${encodeURIComponent(q)}`} className={s.searchLink}>
                        <I.Search size={14} /> {t('aiSearchInstead', { q })}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={threadEnd} />
            </div>
            <div className={s.bottom}>
              {composer}
              <p className={s.disclaimer}>{t('assistantDisclaimer')}</p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default function AssistantPage() {
  return <Suspense fallback={null}><AssistantView /></Suspense>
}
