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
    // ── Gbaki-AI (refonte) ──
    navDocuments: 'Documents',
    navSmartSearch: 'Recherche intelligente',
    navAssistant: 'Assistant IA',
    poweredBy: 'Porté par',
    heroKicker: 'Bibliothèque de la filière',
    heroTitle: "Gbaki-AI la mémoire de l'excellence",
    heroSub: 'Là où le savoir et la préparation se rencontrent.',
    heroExplore: 'Explorer les documents',
    heroAsk: "Poser une question à l'IA",
    cardSearchKicker: 'Recherche intelligente',
    cardSearchTitle: "Tu ne sais pas où chercher ? T'inquiète.",
    cardSearchPlaceholder: 'Une phrase, un mot, même mal orthographié…',
    cardSearchHint: 'Trouve le passage exact, à la page et à la ligne près.',
    cardAiKicker: 'IA personnalisée',
    cardAiTitle: 'Une IA qui connaît les cours de ta filière.',
    cardAiPlaceholder: 'Demande à Gbaki-AI…',
    cardAiBtn: 'Demander',
    recentTitle: 'Ajoutés récemment',
    recentAll: 'Tous les documents →',
    docsFilterTitle: 'Filtrer par titre…',
    colTitle: 'Titre',
    colTeacher: 'Enseignant',
    colType: 'Type',
    colYear: 'Année',
    pagesWord: 'pages',
    pageWord: 'page',
    openBtn: 'Ouvrir',
    sameSubject: 'Dans la même matière',
    sizeLabel: 'Taille',
    folderFiles: 'Fichiers du dossier',
    folderBadge: 'Dossier',
    selectDocHint: 'Sélectionne un document pour voir sa première page.',
    noThumbnail: 'Aperçu indisponible pour ce format',
    prevBtn: 'Précédent',
    nextBtn: 'Suivant',
    pageOf: 'Page {p} sur {n}',
    searchExamples: 'Exemples :',
    searchUnderstood: 'Compris',
    searchText: 'Texte',
    searchCorrected: 'corrigé en',
    tabAll: 'Tout',
    tabExact: 'Exactes',
    tabClose: 'Proches',
    matchesIn: '{n} correspondances dans {d} documents',
    kindExact: 'Exacte',
    kindClose: 'Proche',
    foundFor: 'Trouvé « {w} » pour « {f} ».',
    openAtPage: 'Ouvrir à cette page',
    exactNote: 'La phrase recherchée apparaît telle quelle à la ligne {n}.',
    closeNote: 'Les mots recherchés, ou des mots proches, apparaissent à la ligne {n}.',
    exactMatch: 'Correspondance exacte',
    closeMatch: 'Correspondance proche',
    searchIntro: "Cherche une notion dans le texte de tous les documents : Gbaki-AI te donne la page et la ligne.",
    searchNothing: 'Aucun passage trouvé. Essaie un autre mot ou une formulation plus courte.',
    searchScopeMine: 'Ma classe',
    searchScopeAll: 'Toute la filière AS',
    searchPlaceholderFull: 'Une phrase, un mot, même mal orthographié…',
    searching: 'Recherche…',
    lineWord: 'ligne',
    assistantSources: 'Sources : documents {c}',
    newConversation: 'Nouvelle conversation',
    assistantSoonTitle: "L'assistant arrive bientôt",
    assistantSoonText: "Il répondra à tes questions à partir des cours, TD et sujets de ta filière, avec les pages sources. En attendant, la recherche intelligente retrouve déjà les passages exacts.",
    assistantTry: 'Essayer la recherche intelligente',
    assistantPlaceholder: 'Pose ta question sur un cours, un exercice, un examen…',
    sendBtn: 'Envoyer',
    assistantDisclaimer: "L'assistant répondra à partir des documents de ta filière et peut se tromper : vérifie avec la source.",
    conversations: 'Conversations',
    settingsTabAppearance: '🎨 Apparence',
    settingsAppearanceTitle: 'Thème',
    settingsAppearanceSub: "Choisis l'apparence de Gbaki-AI. Le choix est gardé sur cet appareil.",
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeBlue: 'Bleu nuit',
    emailEnsea: 'Utilise ton adresse institutionnelle nom@ensea.edu.ci.',
    aiModelName: 'Gbaki-AI',
    aiSoonBadge: 'Bientôt disponible',
    aiGreeting: "Comment puis-je t'aider aujourd'hui ?",
    aiSuggested: 'Suggestions',
    aiSearchChats: 'Rechercher',
    aiNoChats: 'Aucune conversation pour le moment.',
    aiAttach: 'Joindre un document',
    aiSoonReply: "Gbaki-AI arrive bientôt : il répondra à partir des cours, TD et sujets de ta filière, avec les pages sources. En attendant, la recherche intelligente retrouve déjà les passages exacts.",
    aiSearchInstead: 'Chercher « {q} » dans les documents',
    aiSugg1Title: 'Explique-moi la loi binomiale',
    aiSugg1Sub: 'Probabilités, avec un exemple corrigé',
    aiSugg2Title: 'Résume le chapitre sur les séries',
    aiSugg2Sub: 'Analyse, les points clés à retenir',
    aiSugg3Title: "Qu'est-ce qu'un intervalle de confiance ?",
    aiSugg3Sub: 'Estimation, définition et méthode',
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
    // ── Gbaki-AI (redesign) ──
    navDocuments: 'Documents',
    navSmartSearch: 'Smart search',
    navAssistant: 'AI assistant',
    poweredBy: 'Powered by',
    heroKicker: 'Programme library',
    heroTitle: 'Gbaki-AI, the memory of excellence',
    heroSub: 'Where knowledge meets preparation.',
    heroExplore: 'Browse documents',
    heroAsk: 'Ask the AI',
    cardSearchKicker: 'Smart search',
    cardSearchTitle: "Not sure where to look? Don't worry.",
    cardSearchPlaceholder: 'A phrase, a word, even misspelled…',
    cardSearchHint: 'Finds the exact passage, down to the page and line.',
    cardAiKicker: 'Personal AI',
    cardAiTitle: 'An AI that knows your programme courses.',
    cardAiPlaceholder: 'Ask Gbaki-AI…',
    cardAiBtn: 'Ask',
    recentTitle: 'Recently added',
    recentAll: 'All documents →',
    docsFilterTitle: 'Filter by title…',
    colTitle: 'Title',
    colTeacher: 'Teacher',
    colType: 'Type',
    colYear: 'Year',
    pagesWord: 'pages',
    pageWord: 'page',
    openBtn: 'Open',
    sameSubject: 'Same subject',
    sizeLabel: 'Size',
    folderFiles: 'Folder files',
    folderBadge: 'Folder',
    selectDocHint: 'Select a document to see its first page.',
    noThumbnail: 'No preview for this format',
    prevBtn: 'Previous',
    nextBtn: 'Next',
    pageOf: 'Page {p} of {n}',
    searchExamples: 'Examples:',
    searchUnderstood: 'Understood',
    searchText: 'Text',
    searchCorrected: 'corrected to',
    tabAll: 'All',
    tabExact: 'Exact',
    tabClose: 'Close',
    matchesIn: '{n} matches in {d} documents',
    kindExact: 'Exact',
    kindClose: 'Close',
    foundFor: 'Found “{w}” for “{f}”.',
    openAtPage: 'Open at this page',
    exactNote: 'The searched phrase appears as is on line {n}.',
    closeNote: 'The searched words, or close ones, appear on line {n}.',
    exactMatch: 'Exact match',
    closeMatch: 'Close match',
    searchIntro: 'Search a notion in the text of every document: Gbaki-AI gives you the page and the line.',
    searchNothing: 'No passage found. Try another word or a shorter phrase.',
    searchScopeMine: 'My class',
    searchScopeAll: 'Whole AS programme',
    searchPlaceholderFull: 'A phrase, a word, even misspelled…',
    searching: 'Searching…',
    lineWord: 'line',
    assistantSources: 'Sources: {c} documents',
    newConversation: 'New conversation',
    assistantSoonTitle: 'The assistant is coming soon',
    assistantSoonText: 'It will answer your questions from your programme courses, tutorials and past papers, with source pages. Meanwhile, smart search already finds exact passages.',
    assistantTry: 'Try smart search',
    assistantPlaceholder: 'Ask about a course, an exercise, an exam…',
    sendBtn: 'Send',
    assistantDisclaimer: 'The assistant will answer from your programme documents and can be wrong: check the source.',
    conversations: 'Conversations',
    settingsTabAppearance: '🎨 Appearance',
    settingsAppearanceTitle: 'Theme',
    settingsAppearanceSub: 'Choose how Gbaki-AI looks. The choice is kept on this device.',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeBlue: 'Midnight blue',
    emailEnsea: 'Use your institutional address name@ensea.edu.ci.',
    aiModelName: 'Gbaki-AI',
    aiSoonBadge: 'Coming soon',
    aiGreeting: 'How can I help you today?',
    aiSuggested: 'Suggested',
    aiSearchChats: 'Search',
    aiNoChats: 'No conversations yet.',
    aiAttach: 'Attach a document',
    aiSoonReply: 'Gbaki-AI is coming soon: it will answer from your programme courses, tutorials and past papers, with source pages. Meanwhile, smart search already finds exact passages.',
    aiSearchInstead: 'Search “{q}” in the documents',
    aiSugg1Title: 'Explain the binomial distribution',
    aiSugg1Sub: 'Probability, with a worked example',
    aiSugg2Title: 'Summarise the chapter on series',
    aiSugg2Sub: 'Analysis, key points to remember',
    aiSugg3Title: 'What is a confidence interval?',
    aiSugg3Sub: 'Estimation, definition and method',
  },
} satisfies Record<Lang, Record<string, string>>

export type TranslationKey = keyof typeof translations.fr

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
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

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const toggleLang = () => {
    setLang(prev => {
      const next: Lang = prev === 'fr' ? 'en' : 'fr'
      localStorage.setItem('gbaki_lang', next)
      return next
    })
  }

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let out: string = translations[lang][key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
    return out
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
