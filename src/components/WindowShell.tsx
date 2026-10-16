import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useDraggable } from '../hooks/useDraggable'
import { useLang } from '../i18n'

type Props = {
  title: string
  wide?: boolean
  zIndex: number
  /** Décalage initial (px) pour que les fenêtres ouvertes s'empilent en cascade. */
  offset: { x: number; y: number }
  closing: boolean
  isMobile: boolean
  reducedMotion: boolean
  onClose: () => void
  onFocus: () => void
  /** Appelé une fois l'animation de sortie terminée. */
  onExited: () => void
  bodyStyle?: CSSProperties
  children: ReactNode
}

const LIGHTS = [
  { color: 'rgb(253, 93, 92)', glyph: 'M3 3l6 6M9 3l-6 6' },
  { color: 'rgb(250, 201, 0)', glyph: 'M2.5 6h7' },
  { color: 'rgb(52, 199, 90)', glyph: 'M6 2.5v7M2.5 6h7' },
]

export function WindowShell({
  title,
  wide,
  zIndex,
  offset,
  closing,
  isMobile,
  reducedMotion,
  onClose,
  onFocus,
  onExited,
  bodyStyle,
  children,
}: Props) {
  const titleId = useId()
  const { t } = useLang()
  const panelRef = useRef<HTMLDivElement>(null)
  const { pos, onPointerDown } = useDraggable({ boundsRef: panelRef })
  const [entered, setEntered] = useState(false)
  const [barHover, setBarHover] = useState(false)
  const [grabbing, setGrabbing] = useState(false)

  // Entrée « ressort » : on monte à scale(0.8)/opacity 0, puis on bascule l'état
  // au frame suivant pour que la transition CSS se déclenche.
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [])

  // Focus sur la fenêtre à l'ouverture, puis rendu du focus à l'élément d'origine.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    panelRef.current?.focus({ preventScroll: true })
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  const onExitedRef = useRef(onExited)
  useLayoutEffect(() => {
    onExitedRef.current = onExited
  }, [onExited])
  useEffect(() => {
    if (!closing) return
    const t = window.setTimeout(() => onExitedRef.current(), reducedMotion ? 0 : 220)
    return () => window.clearTimeout(t)
  }, [closing, reducedMotion])

  useEffect(() => {
    if (!grabbing) return
    const stop = () => setGrabbing(false)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [grabbing])

  const visible = entered && !closing
  const transition = reducedMotion
    ? 'opacity 0.15s ease'
    : closing
      ? 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease'
      : 'transform 0.4s cubic-bezier(0.34, 1.28, 0.64, 1), opacity 0.3s ease'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex,
        pointerEvents: 'none',
      }}
    >
      {/* Le drag (translate) est sur un wrapper sans transition ; l'échelle d'entrée/sortie est sur le panneau. */}
      <div style={{ transform: `translate(${offset.x + pos.x}px, ${offset.y + pos.y}px)`, pointerEvents: 'none' }}>
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          onPointerDownCapture={onFocus}
          onFocusCapture={onFocus}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: isMobile ? 'calc(100vw - 24px)' : wide ? '70vw' : '60vw',
            maxWidth: wide ? 840 : 720,
            maxHeight: isMobile ? '78vh' : '70vh',
            borderRadius: 24,
            background: 'white',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.28)',
            pointerEvents: closing ? 'none' : 'all',
            overflow: 'hidden',
            outline: 'none',
            transform: visible || reducedMotion ? 'scale(1)' : 'scale(0.8)',
            opacity: visible ? 1 : 0,
            transition,
          }}
        >
          <div
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return
              setGrabbing(true)
              onPointerDown(e)
            }}
            onPointerEnter={() => setBarHover(true)}
            onPointerLeave={() => setBarHover(false)}
            style={{
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              height: 40,
              padding: '0 16px',
              borderBottom: '1px solid rgb(229, 229, 234)',
              cursor: grabbing ? 'grabbing' : 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: -4 }}>
              {/* Les trois pastilles ferment la fenêtre ; seule la rouge est exposée au clavier / lecteur d'écran. */}
              {LIGHTS.map((l, i) => (
                <button
                  key={l.color}
                  type="button"
                  aria-label={i === 0 ? t('closeWindow') : undefined}
                  aria-hidden={i === 0 ? undefined : true}
                  tabIndex={i === 0 ? 0 : -1}
                  onClick={onClose}
                  onFocus={() => setBarHover(true)}
                  onBlur={() => setBarHover(false)}
                  style={{
                    width: 20,
                    height: 20,
                    padding: 4,
                    margin: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '50%',
                  }}
                >
                  <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden="true" style={{ display: 'block', borderRadius: '50%', background: l.color }}>
                    <path
                      d={l.glyph}
                      stroke="rgba(0, 0, 0, 0.55)"
                      strokeWidth={1.3}
                      strokeLinecap="round"
                      fill="none"
                      style={{ opacity: barHover ? 1 : 0, transition: 'opacity 0.12s ease' }}
                    />
                  </svg>
                </button>
              ))}
            </div>
            <h2
              id={titleId}
              style={{
                flex: 1,
                margin: 0,
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                letterSpacing: '-0.04em',
                color: 'rgb(134, 134, 139)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '0 8px',
              }}
            >
              {title}
            </h2>
            {/* Contrepoids des pastilles pour centrer le titre. */}
            <div aria-hidden="true" style={{ width: 56, flex: 'none' }} />
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              ...bodyStyle,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
