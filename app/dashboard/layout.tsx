'use client'
/*
 * GBAKI-AI — app/dashboard/layout.tsx
 * Coquille commune : barre latérale (navigation, « Porté par », compte) + en-tête.
 * Vérifie la session et expose le profil aux pages via useShell().
 */
import { useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import s from './shell.module.css'
import * as I from '../../components/icons'
import { firstName, initials } from '../../components/format'
import { BrandMark, ShellContext } from '../../components/shell'
import { useLang, type TranslationKey } from '../../context/LangContext'
import {
  apiGetNotificationsToday, apiLogout, apiMe, clearAuth, getProfile, getToken, type UserProfile,
} from '../../lib/api'

const NAV: { href: string; key: TranslationKey; icon: ReactNode }[] = [
  { href: '/dashboard', key: 'navHome', icon: <I.Home /> },
  { href: '/dashboard/documents', key: 'navDocuments', icon: <I.FileText /> },
  { href: '/dashboard/recherche', key: 'navSmartSearch', icon: <I.Search /> },
  { href: '/dashboard/assistant', key: 'navAssistant', icon: <I.Sparkle /> },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, lang, toggleLang } = useLang()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [notif, setNotif] = useState<number | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/auth'); return }
    const cached = getProfile()
    if (cached) setProfile(cached)
    apiMe()
      .then(p => {
        if (!p.class_id) { router.replace('/onboarding'); return }
        setProfile(p)
      })
      .catch(() => { clearAuth(); router.replace('/auth') })
    apiGetNotificationsToday().then(n => setNotif(n.count)).catch(() => setNotif(null))
  }, [router])

  useEffect(() => { setDrawer(false) }, [pathname])

  if (!profile) return <div className={s.loading}><BrandMark /></div>

  const logout = async () => { await apiLogout(); router.push('/auth') }
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href)
  const name = profile.full_name && !profile.full_name.includes('@') ? profile.full_name : profile.email.split('@')[0]

  return (
    <ShellContext.Provider value={{ profile }}>
      <div className={s.app}>
        <aside className={`${s.sidebar} ${drawer ? s.sidebarOpen : ''}`}>
          <div className={s.brand}>
            <BrandMark />
            <div>
              <div className={s.brandName}>Gbaki-AI</div>
              <div className={s.brandSub}>ENSEA Data Science Club</div>
            </div>
            <button className={s.drawerClose} onClick={() => setDrawer(false)} aria-label="Fermer le menu"><I.Close /></button>
          </div>

          <div className={s.navLabel}>{t('navNavigation')}</div>
          <nav className={s.nav}>
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className={`${s.navItem} ${isActive(item.href) ? s.navItemActive : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.icon}<span>{t(item.key)}</span>
              </Link>
            ))}
          </nav>

          <div className={s.sidebarBottom}>
            <div className={s.navLabel}>{t('poweredBy')}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/edsc.jpg" alt="ENSEA Data Science Club" className={s.clubLogo} />

            <div className={s.userCard}>
              <span className={s.avatar}>{initials(profile.full_name, profile.email)}</span>
              <div className={s.userInfo}>
                <div className={s.userName}>{name}</div>
                <div className={s.userClass}>{profile.class_code ?? ''}</div>
              </div>
              <button className={s.iconBtnDark} onClick={logout} title={t('navLogout')} aria-label={t('navLogout')}>
                <I.Logout size={15} />
              </button>
            </div>
            <Link href="/settings" className={s.navItem}><I.Settings /><span>{t('navSettings')}</span></Link>
          </div>
        </aside>
        {drawer && <div className={s.backdrop} onClick={() => setDrawer(false)} />}

        <div className={s.main}>
          <header className={s.header}>
            <button className={s.menuBtn} onClick={() => setDrawer(true)} aria-label="Ouvrir le menu"><I.Menu size={20} /></button>
            <div className={s.greeting}>
              <strong>{t('hello')}, {firstName(profile.full_name, profile.email)}</strong>
              {profile.class_code && <span className={s.greetingSub}> {profile.class_code}</span>}
            </div>
            <div className={s.headerRight}>
              <span className={s.poweredSmall}>{t('poweredBy')}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/edsc.jpg" alt="ENSEA Data Science Club" className={s.clubLogoSmall} />
              <span className={s.headerSep} />
              <button className={s.iconBtn} onClick={toggleLang} title="Langue / Language">{lang.toUpperCase()}</button>
              <div className={s.notifWrap}>
                <button className={s.iconBtn} onClick={() => setNotifOpen(o => !o)} aria-label={t('notifTitle')}>
                  <I.Bell />
                  {!!notif && <span className={s.notifDot}>{notif}</span>}
                </button>
                {notifOpen && (
                  <div className={s.notifPanel} role="dialog">
                    <div className={s.notifTitle}>{t('notifTitle')}</div>
                    <p className={s.notifText}>{notif ? `${notif} ${t('notifToday')}` : t('notifNone')}</p>
                    <button className={s.linkBtn} onClick={() => setNotifOpen(false)}>{t('notifClose')}</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className={s.content}>{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  )
}
