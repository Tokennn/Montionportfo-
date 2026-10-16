import { useState } from 'react'
import { NOTES_ICON, PROFILE_PHOTO, SOCIALS } from '../data'
import { useLang } from '../i18n'
import { THEME } from '../theme'

type DockIconProps = {
  label: string
  icon: string
  href?: string
  onClick?: () => void
  open?: boolean
  size: number
  reducedMotion: boolean
}

function DockIcon({ label, icon, href, onClick, open, size, reducedMotion }: DockIconProps) {
  const { t } = useLang()
  const [hover, setHover] = useState(false)

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && setHover(true),
    onPointerLeave: () => setHover(false),
    onFocus: (e: React.FocusEvent<HTMLElement>) => e.currentTarget.matches(':focus-visible') && setHover(true),
    onBlur: () => setHover(false),
  }

  const buttonStyle: React.CSSProperties = {
    display: 'block',
    width: size,
    height: size,
    borderRadius: '28%',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transform: hover && !reducedMotion ? 'scale(1.12)' : 'scale(1)',
    transition: reducedMotion ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    WebkitTapHighlightColor: 'transparent',
  }

  const img = (
    <img
      src={icon}
      alt=""
      draggable={false}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.15s ease',
          pointerEvents: 'none',
          background: 'white',
          padding: '6px 12px',
          borderRadius: 64,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: '-0.04em',
          color: 'black',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <span
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
          }}
        />
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (${t('newTab')})`}
          style={buttonStyle}
          {...handlers}
        >
          {img}
        </a>
      ) : (
        <button
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={onClick}
          style={buttonStyle}
          {...handlers}
        >
          {img}
        </button>
      )}

      {/* Point « app ouverte », comme dans le Dock de macOS. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -8,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: THEME.dockDot,
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </div>
  )
}

type DockProps = {
  isMobile: boolean
  reducedMotion: boolean
  aboutOpen: boolean
  notesOpen: boolean
  onOpenAbout: () => void
  onOpenNotes: () => void
}

export function Dock({ isMobile, reducedMotion, aboutOpen, notesOpen, onOpenAbout, onOpenNotes }: DockProps) {
  const size = isMobile ? 44 : 48
  const common = { size, reducedMotion }

  return (
    <nav
      aria-label="Dock"
      style={{
        position: 'absolute',
        bottom: isMobile ? 'calc(24px + env(safe-area-inset-bottom))' : 64,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
      }}
    >
      <div
        className="spring-in"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: isMobile ? 10 : 16,
          padding: isMobile ? 10 : 12,
          borderRadius: 24,
          background: THEME.glassBg,
          border: `1px solid ${THEME.glassBorder}`,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          animationDelay: '80ms',
          animationFillMode: 'both',
        }}
      >
        <DockIcon label="About Me" icon={PROFILE_PHOTO} onClick={onOpenAbout} open={aboutOpen} {...common} />
        <DockIcon label="Notes" icon={NOTES_ICON} onClick={onOpenNotes} open={notesOpen} {...common} />
        <div
          role="separator"
          aria-orientation="vertical"
          style={{ width: 1, height: size, background: THEME.dockSeparator, borderRadius: 64 }}
        />
        {SOCIALS.map((s) => (
          <DockIcon key={s.id} label={s.label} icon={s.icon} href={s.href} {...common} />
        ))}
      </div>
    </nav>
  )
}
