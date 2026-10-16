import { useRef, useState } from 'react'
import type { Project } from '../data'
import { useDraggable } from '../hooks/useDraggable'
import { THEME } from '../theme'

type Props = {
  project: Project
  index: number
  isMobile: boolean
  active: boolean
  onActivate: (id: string) => void
  onOpen: (id: string) => void
}

export function ProjectCard({ project, index, isMobile, active, onActivate, onOpen }: Props) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const { pos, onPointerDown, isDraggingRef } = useDraggable({ boundsRef: rootRef })
  const [hover, setHover] = useState(false)
  const anchor = isMobile ? project.mobileAnchor : project.anchor

  return (
    <button
      ref={rootRef}
      type="button"
      aria-haspopup="dialog"
      onPointerDown={(e) => {
        onActivate(project.id)
        onPointerDown(e)
      }}
      onClick={(e) => {
        // Un clic n'ouvre le projet que si la carte a bougé de moins de 5px.
        // detail === 0 : activation clavier (Entrée/Espace), toujours acceptée.
        if (e.detail === 0 || !isDraggingRef.current) onOpen(project.id)
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: 'absolute',
        left: `calc(${anchor.x}% - 52px)`,
        top: `calc(${anchor.y}% - 64px)`,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: active ? 3 : 2,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        borderRadius: 8,
      }}
    >
      <span
        className="spring-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animationDelay: `${150 + index * 70}ms`,
          animationFillMode: 'both',
        }}
      >
        <span
          style={{
            display: 'block',
            padding: 12,
            borderRadius: 8,
            border: `2px solid ${hover ? THEME.cardHoverBorder : 'transparent'}`,
            background: hover ? THEME.cardHoverBg : 'transparent',
            transition: 'background 0.18s ease, border-color 0.18s ease',
          }}
        >
          <img
            src={project.thumb}
            alt=""
            draggable={false}
            loading="eager"
            decoding="async"
            style={{
              display: 'block',
              width: 80,
              height: 'auto',
              borderRadius: 8,
              border: `1px solid ${THEME.thumbBorder}`,
              boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.08)',
              pointerEvents: 'none',
            }}
          />
        </span>
        <span
          style={{
            display: 'block',
            background: hover ? 'rgb(0, 102, 221)' : 'transparent',
            padding: hover ? '4px 8px' : '4px 0',
            borderRadius: 4,
            transition: 'background 0.18s ease, padding 0.18s ease',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: isMobile ? 14 : 16,
            lineHeight: '1.4em',
            letterSpacing: '-0.04em',
            color: hover ? 'rgb(247, 247, 247)' : THEME.cardTitle,
            whiteSpace: 'nowrap',
            textShadow: hover ? 'none' : THEME.cardTitleShadow,
          }}
        >
          {project.title}
        </span>
      </span>
    </button>
  )
}
