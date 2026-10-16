import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { L, Lang } from './data'

/** Textes de l'interface (le contenu bilingue vit dans data.ts). */
const UI = {
  projects: { fr: 'Projets', en: 'Projects' },
  projectsCount: { fr: 'projets', en: 'projects' },
  newTab: { fr: 'nouvel onglet', en: 'new tab' },
  closeWindow: { fr: 'Fermer la fenêtre', en: 'Close window' },
  prevProject: { fr: 'Projet précédent', en: 'Previous project' },
  nextProject: { fr: 'Projet suivant', en: 'Next project' },
  viewProject: { fr: 'Voir le projet', en: 'View project' },
  comingSoon: { fr: 'Bientôt en ligne.', en: 'Coming soon.' },
  otherProjects: { fr: 'Autres projets', en: 'Other projects' },
  projectVisual: { fr: 'Visuel du projet', en: 'Visual of the project' },
  projectVideo: { fr: 'Vidéo de présentation de', en: 'Presentation video of' },
  copyLink: { fr: 'Copier le lien', en: 'Copy link' },
  linkCopied: { fr: 'Lien copié ✓', en: 'Link copied ✓' },
  portraitOf: { fr: 'Portrait de', en: 'Portrait of' },
  education: { fr: 'Formation', en: 'Education' },
  process: { fr: 'Processus', en: 'Process' },
  whatIBring: { fr: 'Ce que j’apporte', en: 'What I bring' },
  technologies: { fr: 'Technologies', en: 'Technologies' },
  tools: { fr: 'Outils', en: 'Tools' },
  values: { fr: 'Valeurs', en: 'Values' },
  keywords: { fr: 'Mots-clés', en: 'Keywords' },
  outsideWork: { fr: 'En dehors du travail', en: 'Outside of work' },
  contact: { fr: 'Contact', en: 'Contact' },
  writeEmail: { fr: 'Écrire un e-mail', en: 'Send an email' },
  copied: { fr: 'Copié ✓', en: 'Copied ✓' },
  palette: { fr: 'Palette', en: 'Palette' },
  search: { fr: 'Rechercher', en: 'Search' },
  searchNotes: { fr: 'Rechercher dans les notes', en: 'Search notes' },
  noNotes: { fr: 'Aucune note trouvée.', en: 'No notes found.' },
  selectNote: { fr: 'Sélectionne une note.', en: 'Select a note.' },
  hostedOn: { fr: 'Hébergé via', en: 'Hosted on' },
  language: { fr: 'Langue', en: 'Language' },
} satisfies Record<string, L>

type UIKey = keyof typeof UI

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: UIKey) => string
  pick: <T>(l: L<T>) => T
}

const LangContext = createContext<Ctx | null>(null)

const STORAGE_KEY = 'motionportfo-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'fr' || saved === 'en') return saved
  } catch {
    /* stockage indisponible : on retombe sur la langue du navigateur */
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignoré */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key) => UI[key][lang],
      pick: (l) => l[lang],
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang doit être utilisé dans <LangProvider>')
  return ctx
}
