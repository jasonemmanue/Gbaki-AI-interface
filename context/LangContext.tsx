/*
 * GBAKI-Searcher — context/LangContext.tsx
 * Contexte global pour la langue (Français / English)
 */
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Lang = 'fr' | 'en'

/* ══ Dictionnaire de traductions ════════════════════ */
export const translations = {
  fr: {
    // Topbar
    hello: 'Bonjour',
    // Sidebar nav
    navNavigation: 'Navigation',
    navHome: 'Accueil',
    navAllDocs: 'Tous les documents',
    navMyAccount: 'Mon compte',
    navSettings: 'Paramètres',
    navLogout: 'Se déconnecter',
    // Search
    searchTitle: 'Que cherchez-vous ?',
    searchHint: 'Tapez un mot-clé, matière, enseignant, type de document. Accepte les abréviations :',
    searchHintExample: 'td, tp, proba, exam, corrigé…',
    searchPlaceholder: 'Ex: cours probabilités, examen estimation, TP stats...',
    searchBtn: 'Rechercher',
    // Filters
    filterSubject: 'Matière',
    filterAllSubjects: 'Toutes',
    filterTeacher: 'Enseignant',
    filterAllTeachers: 'Tous',
    filterYear: 'Année',
    filterAllYears: 'Toutes',
    filterType: 'Type',
    filterAllTypes: 'Tous',
    filterReset: 'Réinitialiser',
    // Results
    resultsTitle: 'Documents de votre filière',
    loading: 'Chargement…',
    docCount1: 'document',
    docCountN: 'documents',
    // Empty states
    emptyNoResult: 'Aucun résultat',
    emptyNoDocs: 'Aucun document disponible',
    emptyNoResultSub: 'Essayez un autre terme ou vérifiez vos filtres.',
    emptyNoDocsSub: 'Les documents apparaîtront ici une fois publiés.',
    loadingDocs: 'Chargement des documents…',
    // Preview
    download: 'Télécharger',
    noPreview: 'Impossible de charger le fichier.',
    downloadError: 'Impossible de télécharger le fichier.',
    // Notifications
    notifTitle: 'Nouveaux documents',
    notifToday: "document(s) publié(s) aujourd'hui",
    notifNone: 'Aucune nouvelle notification',
    notifClose: 'Fermer',
    // Student badge
    studentBadge: 'Étudiant',
    // Settings — page
    settingsTitle: 'Paramètres',
    settingsBack: '← Retour',
    settingsTabClass: '🎓 Ma classe',
    settingsTabAccount: '👤 Mon compte',
    // Settings — onglet classe
    settingsClassTitle: 'Changer de classe',
    settingsClassSub: 'Sélectionnez votre classe. Votre dashboard affichera les documents correspondants.',
    settingsClassSaving: 'Enregistrement…',
    settingsClassCurrent: 'Classe actuelle',
    settingsClassChoose: 'Choisir',
    // Settings — onglet compte
    settingsAccountTitle: 'Changer de compte',
    settingsAccountSub: "Vous avez un nouvel email institutionnel ? Connectez-vous avec le compte déjà inscrit sur GBAKI pour y accéder. Votre session actuelle sera remplacée.",
    settingsAccountCurrent: 'Compte actuel',
    settingsAccountNewEmail: 'Nouvel email institutionnel',
    settingsAccountEmailPlaceholder: 'nouveau@ensea.edu.ci',
    settingsAccountEmailHint: 'Ce compte doit déjà être inscrit sur GBAKI.',
    settingsAccountNewPass: 'Mot de passe du nouveau compte',
    settingsAccountPassPlaceholder: 'Mot de passe du nouveau compte',
    settingsAccountSaving: 'Vérification…',
    settingsAccountSwitch: 'Basculer vers ce compte',
    settingsAccountErrEmail: 'Entrez le nouvel email institutionnel.',
    settingsAccountErrPass: 'Entrez le mot de passe du nouveau compte.',
  },
  en: {
    // Topbar
    hello: 'Hello',
    // Sidebar nav
    navNavigation: 'Navigation',
    navHome: 'Home',
    navAllDocs: 'All documents',
    navMyAccount: 'My account',
    navSettings: 'Settings',
    navLogout: 'Log out',
    // Search
    searchTitle: 'What are you looking for?',
    searchHint: 'Type a keyword, subject, teacher, document type. Accepts abbreviations:',
    searchHintExample: 'td, tp, proba, exam, answers…',
    searchPlaceholder: 'E.g. probability course, estimation exam, stats lab...',
    searchBtn: 'Search',
    // Filters
    filterSubject: 'Subject',
    filterAllSubjects: 'All',
    filterTeacher: 'Teacher',
    filterAllTeachers: 'All',
    filterYear: 'Year',
    filterAllYears: 'All',
    filterType: 'Type',
    filterAllTypes: 'All',
    filterReset: 'Reset filters',
    // Results
    resultsTitle: 'Documents for your programme',
    loading: 'Loading…',
    docCount1: 'document',
    docCountN: 'documents',
    // Empty states
    emptyNoResult: 'No results',
    emptyNoDocs: 'No documents available',
    emptyNoResultSub: 'Try another term or check your filters.',
    emptyNoDocsSub: 'Documents will appear here once published.',
    loadingDocs: 'Loading documents…',
    // Preview
    download: 'Download',
    noPreview: 'Unable to load file.',
    downloadError: 'Unable to download file.',
    // Notifications
    notifTitle: 'New documents',
    notifToday: 'document(s) published today',
    notifNone: 'No new notifications',
    notifClose: 'Close',
    // Student badge
    studentBadge: 'Student',
    // Settings — page
    settingsTitle: 'Settings',
    settingsBack: '← Back',
    settingsTabClass: '🎓 My class',
    settingsTabAccount: '👤 My account',
    // Settings — class tab
    settingsClassTitle: 'Change class',
    settingsClassSub: 'Select your class. Your dashboard will show the matching documents.',
    settingsClassSaving: 'Saving…',
    settingsClassCurrent: 'Current class',
    settingsClassChoose: 'Select',
    // Settings — account tab
    settingsAccountTitle: 'Switch account',
    settingsAccountSub: 'Got a new institutional email? Log in with the account already registered on GBAKI to access it. Your current session will be replaced.',
    settingsAccountCurrent: 'Current account',
    settingsAccountNewEmail: 'New institutional email',
    settingsAccountEmailPlaceholder: 'new@ensea.edu.ci',
    settingsAccountEmailHint: 'This account must already be registered on GBAKI.',
    settingsAccountNewPass: 'Password of the new account',
    settingsAccountPassPlaceholder: 'Password of the new account',
    settingsAccountSaving: 'Verifying…',
    settingsAccountSwitch: 'Switch to this account',
    settingsAccountErrEmail: 'Please enter the new institutional email.',
    settingsAccountErrPass: 'Please enter the password for the new account.',
  },
} satisfies Record<Lang, Record<string, string>>

export type TranslationKey = keyof typeof translations.fr

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  toggleLang: () => {},
  t: (key) => key,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('gbaki_lang') as Lang | null
    if (saved === 'fr' || saved === 'en') setLang(saved)
  }, [])

  const toggleLang = () => {
    setLang(prev => {
      const next: Lang = prev === 'fr' ? 'en' : 'fr'
      localStorage.setItem('gbaki_lang', next)
      return next
    })
  }

  const t = (key: TranslationKey): string => translations[lang][key] ?? key

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
