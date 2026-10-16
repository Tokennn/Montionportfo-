import { useCallback, useEffect, useRef, useState } from 'react'
import { Dock } from './components/Dock'
import { ProjectCard } from './components/ProjectCard'
import { WindowShell } from './components/WindowShell'
import { AboutWindow } from './components/windows/AboutWindow'
import { NotesWindow } from './components/windows/NotesWindow'
import { ProjectWindow } from './components/windows/ProjectWindow'
import { BACKGROUND, PROJECTS } from './data'
import type { Lang } from './data'
import { useIsMobile, useReducedMotion } from './hooks/useMediaQuery'
import { useLang } from './i18n'
import { BACKGROUND_MODE, COFFEE_IMAGE, THEME } from './theme'
import { CoffeeBackground } from './components/CoffeeBackground'

type WindowKind = 'project' | 'about' | 'notes'

type Win = {
  key: string
  kind: WindowKind
  projectId?: string
  z: number
  offset: { x: number; y: number }
  closing: boolean
}

const WINDOW_Z_BASE = 50

// Liens directs : /#airmap, /#about, /#notes ouvrent la fenêtre correspondante.
const slugOf = (w: Pick<Win, 'kind' | 'projectId'>) => (w.kind === 'project' ? w.projectId! : w.kind)

function parseHash(): { kind: WindowKind; projectId?: string } | null {
  const slug = decodeURIComponent(window.location.hash.slice(1))
  if (slug === 'about' || slug === 'notes') return { kind: slug }
  if (PROJECTS.some((p) => p.id === slug)) return { kind: 'project', projectId: slug }
  return null
}

const topOpen = (ws: Win[]) => ws.filter((w) => !w.closing).reduce<Win | null>((a, b) => (!a || b.z > a.z ? b : a), null)

export default function App() {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const [windows, setWindows] = useState<Win[]>([])
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const zCounter = useRef(0)
  const keyCounter = useRef(0)
  const { lang, setLang, t } = useLang()

  const focusWindow = useCallback((key: string) => {
    setWindows((ws) => {
      const top = Math.max(...ws.map((w) => w.z))
      const target = ws.find((w) => w.key === key)
      if (!target || target.z === top) return ws
      const z = ++zCounter.current
      return ws.map((w) => (w.key === key ? { ...w, z } : w))
    })
  }, [])

  const openWindow = useCallback(
    (kind: WindowKind, projectId?: string, { push = true } = {}) => {
      // Ouverture par l'utilisateur : nouvelle entrée d'historique, le bouton Retour la refermera.
      const hash = `#${slugOf({ kind, projectId })}`
      if (push && window.location.hash !== hash) window.history.pushState(null, '', hash)
      setWindows((ws) => {
        const existing = ws.find((w) => !w.closing && w.kind === kind && (kind !== 'project' || w.projectId === projectId))
        const z = ++zCounter.current
        if (existing) return ws.map((w) => (w.key === existing.key ? { ...w, z } : w))
        // Cascade : chaque nouvelle fenêtre est décalée de la précédente.
        const n = ws.filter((w) => !w.closing).length % 5
        const step = isMobile ? 10 : 28
        return [
          ...ws,
          { key: `w${++keyCounter.current}`, kind, projectId, z, offset: { x: n * step, y: n * step }, closing: false },
        ]
      })
    },
    [isMobile],
  )

  const closeWindow = useCallback((key: string) => {
    setWindows((ws) => ws.map((w) => (w.key === key ? { ...w, closing: true } : w)))
  }, [])

  const removeWindow = useCallback((key: string) => {
    setWindows((ws) => ws.filter((w) => w.key !== key))
  }, [])

  const navigateProject = useCallback((key: string, projectId: string) => {
    setWindows((ws) => ws.map((w) => (w.key === key ? { ...w, projectId } : w)))
  }, [])

  // Au chargement : ouvre la fenêtre demandée dans l'URL.
  useEffect(() => {
    const target = parseHash()
    if (target) openWindow(target.kind, target.projectId, { push: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // L'URL suit la fenêtre au premier plan (sans créer d'entrée d'historique).
  useEffect(() => {
    const top = topOpen(windows)
    const hash = top ? `#${slugOf(top)}` : ''
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash || window.location.pathname + window.location.search)
    }
  }, [windows])

  // Retour / Suivant du navigateur.
  useEffect(() => {
    const onPop = () => {
      const target = parseHash()
      const targetSlug = target ? slugOf(target) : null
      let alreadyOpen = false
      setWindows((ws) => {
        const open = ws.filter((w) => !w.closing)
        alreadyOpen = !!targetSlug && open.some((w) => slugOf(w) === targetSlug)
        const top = topOpen(ws)
        if (!top || slugOf(top) === targetSlug || (targetSlug && !alreadyOpen)) return ws
        return ws.map((w) => (w.key === top.key ? { ...w, closing: true } : w))
      })
      if (target && !alreadyOpen) openWindow(target.kind, target.projectId, { push: false })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [openWindow])

  // Échap ferme la fenêtre au premier plan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setWindows((ws) => {
        const open = ws.filter((w) => !w.closing)
        if (!open.length) return ws
        const top = open.reduce((a, b) => (b.z > a.z ? b : a))
        return ws.map((w) => (w.key === top.key ? { ...w, closing: true } : w))
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isOpen = (kind: WindowKind) => windows.some((w) => w.kind === kind && !w.closing)
  // Ordre DOM stable (déplacer un nœud lui ferait perdre le focus) ; seul le z-index suit l'ordre de premier plan.
  const rank = new Map([...windows].sort((a, b) => a.z - b.z).map((w, i) => [w.key, i]))

  return (
    <main
      style={{
        width: '100%',
        // Sur mobile, 100dvh évite que la barre d'adresse ne masque le dock.
        height: isMobile ? '100dvh' : '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: THEME.pageBg,
      }}
    >
      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Quentin Contreau — {PROJECTS.length} {t('projectsCount')}
      </h1>

      {/* 1. Fond : photo de la spec, ou essai « coffee » (voir src/theme.ts) */}
      {BACKGROUND_MODE === 'coffee' ? (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: THEME.pageBg }}>
          {/* Tasse entière et centrée : entrée, crème qui tourne puis se pose, vapeur légère. */}
          <CoffeeBackground src={COFFEE_IMAGE} viewportHeight={isMobile ? '100dvh' : '100vh'} reducedMotion={reducedMotion} />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${BACKGROUND}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* 2. Dégradé */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(84, 84, 84, 0) 0%, rgb(0, 0, 0) 100%)',
          opacity: THEME.gradientOpacity,
        }}
      />

      {/* 3. Flou progressif en bas */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '47.375%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Cartes projet (repositionnées quand on bascule desktop/mobile) */}
      <section aria-label={t('projects')}>
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={`${p.id}-${isMobile ? 'm' : 'd'}`}
            project={p}
            index={i}
            isMobile={isMobile}
            active={activeCard === p.id}
            onActivate={setActiveCard}
            onOpen={(id) => openWindow('project', id)}
          />
        ))}
      </section>

      {/* 5. Dock */}
      <Dock
        isMobile={isMobile}
        reducedMotion={reducedMotion}
        aboutOpen={isOpen('about')}
        notesOpen={isOpen('notes')}
        onOpenAbout={() => openWindow('about')}
        onOpenNotes={() => openWindow('notes')}
      />

      {/* 6. Mentions bas de page (en haut sur mobile, pour ne pas chevaucher le dock) */}
      <footer
        style={{
          position: 'absolute',
          left: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          ...(isMobile ? { top: 'calc(16px + env(safe-area-inset-top))' } : { bottom: 16 }),
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 11 : 12,
          letterSpacing: '-0.04em',
          color: THEME.footerText,
          textShadow: THEME.footerShadow,
        }}
      >
        <span style={{ pointerEvents: 'auto' }}>@quentin.contreau</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'auto' }}>
          {t('hostedOn')}
          <a
            href="https://www.hostinger.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Hostinger (${t('newTab')})`}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'white',
              boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.08)',
            }}
          >
            <img src="/icons/hostinger.png" alt="" style={{ display: 'block', width: 13, height: 13 }} />
          </a>
        </span>
      </footer>

      {/* 7. Langue (en haut à droite ; centrée en haut sur mobile) */}
      <div
        role="group"
        aria-label={t('language')}
        style={{
          position: 'absolute',
          zIndex: 4,
          ...(isMobile
            ? { top: 'calc(10px + env(safe-area-inset-top))', left: '50%', transform: 'translateX(-50%)' }
            : { top: 20, right: 24 }),
          display: 'flex',
          gap: 2,
          padding: 3,
          borderRadius: 64,
          background: THEME.glassBg,
          border: `1px solid ${THEME.glassBorder}`,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      >
        {(['fr', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={lang === l}
            aria-label={l === 'fr' ? 'Français' : 'English'}
            onClick={() => setLang(l)}
            style={{
              height: 24,
              minWidth: 34,
              padding: '0 8px',
              border: 'none',
              borderRadius: 64,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.02em',
              background: lang === l ? THEME.langActiveBg : 'transparent',
              color: lang === l ? THEME.langActiveText : THEME.text,
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {windows.map((w) => {
        const project = w.kind === 'project' ? PROJECTS.find((p) => p.id === w.projectId) : undefined
        const title = w.kind === 'about' ? 'About Me' : w.kind === 'notes' ? 'Notes' : (project?.title ?? '')
        return (
          <WindowShell
            key={w.key}
            title={title}
            wide={w.kind !== 'about'}
            zIndex={WINDOW_Z_BASE + (rank.get(w.key) ?? 0)}
            offset={w.offset}
            closing={w.closing}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            onClose={() => closeWindow(w.key)}
            onFocus={() => focusWindow(w.key)}
            onExited={() => removeWindow(w.key)}
            bodyStyle={w.kind === 'notes' ? { padding: 0, overflowY: 'hidden' } : undefined}
          >
            {w.kind === 'project' && project && (
              <ProjectWindow project={project} isMobile={isMobile} onNavigate={(id) => navigateProject(w.key, id)} />
            )}
            {w.kind === 'about' && <AboutWindow isMobile={isMobile} />}
            {w.kind === 'notes' && <NotesWindow isMobile={isMobile} />}
          </WindowShell>
        )
      })}
    </main>
  )
}
