import { useState } from 'react'
import { PROJECTS } from '../../data'
import type { Project } from '../../data'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { useLang } from '../../i18n'

type Props = {
  project: Project
  isMobile: boolean
  onNavigate: (id: string) => void
}

const navButton: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: '1px solid rgb(229, 229, 234)',
  background: 'white',
  color: 'rgb(29, 29, 31)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  padding: 0,
  flex: 'none',
}

const pillButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 36,
  padding: '0 16px',
  borderRadius: 64,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  textDecoration: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }

/** Lien direct vers un projet : https://…/#airmap */
const projectUrl = (id: string) => `${window.location.origin}${window.location.pathname}#${id}`

export function ProjectWindow({ project, isMobile, onNavigate }: Props) {
  const { t, pick } = useLang()
  const [copied, setCopied] = useState(false)
  const index = PROJECTS.findIndex((p) => p.id === project.id)
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(index + 1) % PROJECTS.length]
  const others = PROJECTS.filter((p) => p.id !== project.id)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl(project.id))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* presse-papiers indisponible : l'URL reste dans la barre d'adresse */
    }
  }

  return (
    <>
      {project.video ? <HeroVideo key={project.id} project={project} /> : <HeroImage key={project.id} project={project} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Inter Display', 'Inter', sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? 24 : 30,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: 'rgb(29, 29, 31)',
            }}
          >
            {project.title}
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 24,
              marginTop: 8,
              padding: '0 10px',
              borderRadius: 64,
              background: 'rgb(242, 242, 247)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'rgb(60, 60, 67)',
            }}
          >
            {pick(project.tag)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" aria-label={`${t('prevProject')} : ${prev.title}`} onClick={() => onNavigate(prev.id)} style={navButton}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label={`${t('nextProject')} : ${next.title}`} onClick={() => onNavigate(next.id)} style={navButton}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, letterSpacing: '-0.01em', color: 'rgb(60, 60, 67)', maxWidth: 620 }}>
        {pick(project.description)}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...pillButton, background: 'rgb(0, 102, 221)', color: 'white' }}
          >
            {t('viewProject')}
            <span aria-hidden="true">↗</span>
            <span style={srOnly}>({t('newTab')})</span>
          </a>
        ) : (
          <p style={{ margin: '0 8px 0 0', fontSize: 14, fontWeight: 500, color: 'rgb(134, 134, 139)' }}>{t('comingSoon')}</p>
        )}
        <button
          type="button"
          onClick={copyLink}
          aria-live="polite"
          style={{ ...pillButton, border: '1px solid rgb(229, 229, 234)', background: 'white', color: 'rgb(29, 29, 31)' }}
        >
          <LinkIcon />
          {copied ? t('linkCopied') : t('copyLink')}
        </button>
      </div>

      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: 'rgb(134, 134, 139)',
          }}
        >
          {t('otherProjects')}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
            gap: 8,
          }}
        >
          {others.map((p) => (
            <GalleryThumb key={p.id} project={p} label={`${t('viewProject')} ${p.title}`} onClick={() => onNavigate(p.id)} />
          ))}
        </div>
      </div>
    </>
  )
}

const heroFrame: React.CSSProperties = {
  position: 'relative',
  flex: 'none',
  aspectRatio: '16 / 10',
  borderRadius: 14,
  overflow: 'hidden',
  background: 'rgb(242, 242, 247)',
}

function HeroImage({ project }: { project: Project }) {
  const { t } = useLang()
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={heroFrame}>
      {/* Fond flou (même image, en cover) derrière le visuel entier, affiché en contain. */}
      <img
        src={project.thumb}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) saturate(1.1)', transform: 'scale(1.15)', opacity: 0.7 }}
      />
      <img
        src={project.image}
        alt={`${t('projectVisual')} ${project.title}`}
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
    </div>
  )
}

/** Vidéo muette en boucle (lecture auto, sauf si l'utilisateur réduit les animations). */
function HeroVideo({ project }: { project: Project }) {
  const { t } = useLang()
  const reducedMotion = useReducedMotion()
  const video = project.video!
  return (
    <div style={{ ...heroFrame, background: 'black' }}>
      <video
        src={video.src}
        poster={video.poster}
        aria-label={`${t('projectVideo')} ${project.title}`}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        controls={reducedMotion}
        preload="metadata"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}

function GalleryThumb({ project, label, onClick }: { project: Project; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-label={label}
      style={{
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
      }}
    >
      <img
        src={project.thumb}
        alt=""
        loading="lazy"
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '1',
          objectFit: 'cover',
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transform: hover ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      <span
        style={{
          display: 'block',
          marginTop: 6,
          fontSize: 12,
          letterSpacing: '-0.02em',
          color: hover ? 'rgb(0, 102, 221)' : 'rgb(60, 60, 67)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.15s ease',
        }}
      >
        {project.title}
      </span>
    </button>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M8.5 3L4.5 7l4 4' : 'M5.5 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M6 8a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 8 2.5l-.7.7M8 6a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 6 11.5l.7-.7"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
