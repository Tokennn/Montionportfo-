import { useMemo, useState } from 'react'
import { NOTES } from '../../data'
import { useLang } from '../../i18n'
import { ThinkingText } from '../ThinkingText'

const SELECTED = 'rgba(250, 201, 0, 0.32)'

export function NotesWindow({ isMobile }: { isMobile: boolean }) {
  const { t, pick } = useLang()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(isMobile ? null : NOTES[0].id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NOTES
    return NOTES.filter((n) => pick(n.title).toLowerCase().includes(q) || pick(n.body).toLowerCase().includes(q))
  }, [query, pick])

  const selected = NOTES.find((n) => n.id === selectedId) ?? null
  const showList = !isMobile || !selected
  const showDetail = !isMobile || !!selected

  return (
    <div
      style={{
        display: 'flex',
        height: isMobile ? 'calc(78vh - 40px)' : 'min(calc(70vh - 40px), 480px)',
        minHeight: 0,
      }}
    >
      {showList && (
        <div
          style={{
            width: isMobile ? '100%' : 240,
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgb(246, 246, 246)',
            borderRight: isMobile ? 'none' : '1px solid rgb(229, 229, 234)',
            minHeight: 0,
          }}
        >
          <div style={{ padding: 12 }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              aria-label={t('searchNotes')}
              style={{
                width: '100%',
                height: 30,
                padding: '0 10px',
                borderRadius: 8,
                border: '1px solid rgb(229, 229, 234)',
                background: 'white',
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'rgb(29, 29, 31)',
              }}
            />
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 8px 8px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {filtered.length === 0 && (
              <li style={{ padding: '16px 8px', fontSize: 13, color: 'rgb(134, 134, 139)' }}>{t('noNotes')}</li>
            )}
            {filtered.map((n) => {
              const active = n.id === selectedId
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(n.id)}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 10px',
                      marginBottom: 2,
                      border: 'none',
                      borderRadius: 8,
                      background: active ? SELECTED : 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'rgb(29, 29, 31)' }}>
                      {pick(n.title)}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        marginTop: 2,
                        fontSize: 12,
                        color: 'rgb(134, 134, 139)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span style={{ color: 'rgb(60, 60, 67)' }}>{pick(n.date)}</span>&nbsp;&nbsp;{pick(n.body).split('\n')[0]}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {showDetail && (
        <article style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: isMobile ? 16 : '20px 28px' }}>
          {isMobile && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              style={{
                border: 'none',
                background: 'none',
                padding: '4px 0',
                marginBottom: 8,
                color: 'rgb(200, 150, 0)',
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              ‹ Notes
            </button>
          )}
          {selected ? (
            <>
              <p style={{ margin: '0 0 12px', textAlign: 'center', fontSize: 12, color: 'rgb(134, 134, 139)' }}>{pick(selected.date)}</p>
              <h3
                style={{
                  margin: '0 0 12px',
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 24,
                  letterSpacing: '-0.04em',
                  color: 'rgb(29, 29, 31)',
                }}
              >
                {pick(selected.title)}
              </h3>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.6, letterSpacing: '-0.01em', color: 'rgb(60, 60, 67)' }}>
                {pick(selected.body)}
                {selected.status && (
                  <span style={{ marginLeft: 10 }}>
                    <ThinkingText style="sparkle" text={pick(selected.status)} fontSize={15} accentColor="rgb(36, 138, 61)" />
                  </span>
                )}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: 'rgb(134, 134, 139)' }}>{t('selectNote')}</p>
          )}
        </article>
      )}
    </div>
  )
}
