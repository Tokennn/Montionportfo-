import { useState } from 'react'
import type { ReactNode } from 'react'
import { ABOUT, PROFILE_PHOTO, PROJECTS, SOCIALS } from '../../data'
import { useLang } from '../../i18n'

const label: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: 'rgb(134, 134, 139)',
}

const paragraph: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.6,
  letterSpacing: '-0.01em',
  color: 'rgb(60, 60, 67)',
}

export function AboutWindow({ isMobile }: { isMobile: boolean }) {
  const { t, pick } = useLang()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ABOUT.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${ABOUT.email}`
    }
  }

  const twoCols: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 16,
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
        <img
          src={PROFILE_PHOTO}
          alt={`${t('portraitOf')} ${ABOUT.name}`}
          style={{ width: 112, height: 112, objectFit: 'cover', objectPosition: 'center 30%', borderRadius: 24, flex: 'none', border: '1px solid rgba(0, 0, 0, 0.06)' }}
        />
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Inter Display', 'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '-0.04em',
              color: 'rgb(29, 29, 31)',
            }}
          >
            {ABOUT.name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 15, letterSpacing: '-0.02em', color: 'rgb(60, 60, 67)' }}>{pick(ABOUT.title)}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <Pill>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(52, 199, 90)' }} />
              {pick(ABOUT.status)}
            </Pill>
            <Pill>{ABOUT.location}</Pill>
            <Pill>{pick(ABOUT.role)}</Pill>
            <Pill>
              {PROJECTS.length} {t('projectsCount')}
            </Pill>
          </div>
        </div>
      </div>

      <p style={paragraph}>{pick(ABOUT.intro)}</p>

      <Section title={pick(ABOUT.style.title)}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
            borderRadius: 16,
            background: 'rgb(242, 242, 240)',
            border: '1px solid rgb(229, 229, 234)',
          }}
        >
          {pick(ABOUT.style.body).map((p) => (
            <p key={p} style={paragraph}>
              {p}
            </p>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pick(ABOUT.style.tags).map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 24,
                  padding: '0 8px',
                  borderRadius: 4,
                  border: '1px solid rgb(200, 200, 198)',
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                  fontSize: 11,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: 'rgb(58, 58, 60)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }} aria-label={t('palette')} role="list">
            {ABOUT.style.palette.map((c) => (
              <div key={c.color} role="listitem" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ height: 28, borderRadius: 6, background: c.color, border: '1px solid rgba(0, 0, 0, 0.08)' }} />
                <span
                  style={{
                    display: 'block',
                    marginTop: 4,
                    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                    fontSize: 10,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'rgb(134, 134, 139)',
                  }}
                >
                  {pick(c.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div style={twoCols}>
        <Section title={t('education')}>
          <p style={paragraph}>{pick(ABOUT.school)}</p>
        </Section>
        <Section title={t('process')}>
          <p style={paragraph}>{pick(ABOUT.process)}</p>
        </Section>
      </div>

      <Section title={t('whatIBring')}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pick(ABOUT.contribute).map((c) => (
            <li key={c} style={{ ...paragraph, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span aria-hidden="true" style={{ color: 'rgb(0, 102, 221)' }}>
                ✓
              </span>
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <div style={twoCols}>
        <Section title={t('technologies')}>
          <Chips items={ABOUT.tech} />
        </Section>
        <Section title={t('tools')}>
          <Chips items={ABOUT.tools} />
        </Section>
        <Section title={t('values')}>
          <Chips items={pick(ABOUT.values)} />
        </Section>
        <Section title={t('keywords')}>
          <Chips items={pick(ABOUT.keywords)} />
        </Section>
      </div>

      <Section title={t('outsideWork')}>
        <p style={{ ...paragraph, marginBottom: 10 }}>{pick(ABOUT.outside)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {ABOUT.outsideItems.map((o) => (
            <div key={o.title.fr} style={{ padding: 12, borderRadius: 12, background: 'rgb(242, 242, 247)' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'rgb(29, 29, 31)' }}>{pick(o.title)}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgb(134, 134, 139)' }}>{pick(o.text)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('contact')}>
        <p style={{ ...paragraph, marginBottom: 10 }}>{pick(ABOUT.contactTagline)}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <a
            href={`mailto:${ABOUT.email}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 36,
              padding: '0 16px',
              borderRadius: 64,
              background: 'rgb(0, 102, 221)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              textDecoration: 'none',
            }}
          >
            {t('writeEmail')}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-live="polite"
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 64,
              border: '1px solid rgb(229, 229, 234)',
              background: 'white',
              color: 'rgb(29, 29, 31)',
              fontSize: 14,
              letterSpacing: '-0.02em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {copied ? t('copied') : ABOUT.email}
          </button>
          <div style={{ display: 'flex', gap: 8, marginLeft: isMobile ? 0 : 'auto' }}>
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (${t('newTab')})`}
                style={{ display: 'block', width: 36, height: 36, borderRadius: '28%', overflow: 'hidden' }}
              >
                <img src={s.icon} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
              </a>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 style={label}>{title}</h4>
      {children}
    </section>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((i) => (
        <Pill key={i}>{i}</Pill>
      ))}
    </div>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: '0 10px',
        borderRadius: 64,
        background: 'rgb(242, 242, 247)',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: 'rgb(60, 60, 67)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
