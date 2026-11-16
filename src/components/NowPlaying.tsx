import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'

/** Morceau joué par la barre son. */
const VIDEO_ID = 'mKVwNOz_JfA'
/**
 * Fichier audio hébergé sur le site (ex. '/audio/je-change-de-theme.mp3', dans public/audio).
 * S'il est renseigné, il remplace le lecteur YouTube et l'onde suit le vrai son du morceau.
 * Sinon (YouTube), le navigateur ne donne pas accès au signal : l'onde est simulée.
 */
const AUDIO_SRC: string | null = '/audio/je-change-de-theme.mp3'
const TITLE = 'Je change de thème'
const ARTIST = 'Jeanne Bringtown'
const ARTWORK = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`

// Typage minimal de l'API IFrame YouTube (seulement ce qu'on utilise).
type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (s: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      width: number
      height: number
      playerVars: Record<string, string | number>
      events: { onReady: () => void; onStateChange: (e: { data: number }) => void }
    },
  ) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT)
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT!)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    document.head.appendChild(s)
  })
  return apiPromise
}

/** Lecteur commun aux deux sources (fichier audio ou YouTube). */
type Player = {
  play: () => void
  pause: () => void
  seek: (s: number) => void
  current: () => number
  duration: () => number
  destroy: () => void
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

type Props = { isMobile: boolean; reducedMotion: boolean }

/**
 * Barre son façon Apple (Dynamic Island) en haut au centre, et onde sinusoïdale en bas à droite :
 * elle suit le son pendant la lecture, réagit à la souris, et un clic dessus lance / met en pause.
 */
export function NowPlaying({ isMobile, reducedMotion }: Props) {
  const { t } = useLang()
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const analyserRef = useRef<{ node: AnalyserNode; buf: Uint8Array<ArrayBuffer> } | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState({ cur: 0, dur: 0 })
  const [hover, setHover] = useState(false)

  // Lecteur : fichier audio (avec analyse du signal) ou YouTube invisible.
  useEffect(() => {
    let cancelled = false

    if (AUDIO_SRC) {
      const audio = new Audio(AUDIO_SRC)
      audio.loop = true
      audio.preload = 'metadata'
      let ctx: AudioContext | null = null
      audio.addEventListener('loadedmetadata', () => {
        setReady(true)
        setTime({ cur: 0, dur: audio.duration })
      })
      audio.addEventListener('play', () => setPlaying(true))
      audio.addEventListener('pause', () => setPlaying(false))
      playerRef.current = {
        play: () => {
          // L'analyse du son ne peut démarrer qu'après un geste de l'utilisateur.
          if (!ctx) {
            ctx = new AudioContext()
            const node = ctx.createAnalyser()
            node.fftSize = 512
            ctx.createMediaElementSource(audio).connect(node).connect(ctx.destination)
            analyserRef.current = { node, buf: new Uint8Array(node.fftSize) }
          }
          void ctx.resume()
          void audio.play()
        },
        pause: () => audio.pause(),
        seek: (sec) => {
          audio.currentTime = sec
        },
        current: () => audio.currentTime,
        duration: () => audio.duration || 0,
        destroy: () => {
          audio.pause()
          audio.removeAttribute('src')
          void ctx?.close()
          analyserRef.current = null
        },
      }
      return () => {
        playerRef.current?.destroy()
        playerRef.current = null
      }
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return
      const mount = document.createElement('div')
      hostRef.current.appendChild(mount)
      const yt = new YT.Player(mount, {
        videoId: VIDEO_ID,
        width: 1,
        height: 1,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, loop: 1, playlist: VIDEO_ID, rel: 0 },
        events: {
          onReady: () => {
            if (cancelled) return
            setReady(true)
            setTime({ cur: 0, dur: yt.getDuration() })
          },
          // 1 = lecture, 2 = pause, 0 = fin.
          onStateChange: (e) => setPlaying(e.data === 1),
        },
      })
      playerRef.current = {
        play: () => yt.playVideo(),
        pause: () => yt.pauseVideo(),
        seek: (sec) => yt.seekTo(sec, true),
        current: () => yt.getCurrentTime(),
        duration: () => yt.getDuration(),
        destroy: () => yt.destroy(),
      }
    })
    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  /** Volume instantané du morceau (0 → 1), ou null si le signal n'est pas accessible (YouTube). */
  const getLevel = useCallback(() => {
    const a = analyserRef.current
    if (!a) return null
    a.node.getByteTimeDomainData(a.buf)
    let sum = 0
    for (const v of a.buf) sum += ((v - 128) / 128) ** 2
    return Math.min(1, Math.sqrt(sum / a.buf.length) * 3.2)
  }, [])

  // Progression pendant la lecture.
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (p) setTime({ cur: p.current(), dur: p.duration() })
    }, 500)
    return () => window.clearInterval(id)
  }, [playing])

  const toggle = () => {
    const p = playerRef.current
    if (!p || !ready) return
    if (playing) p.pause()
    else p.play()
  }

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = playerRef.current
    if (!p || !time.dur) return
    const r = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    p.seek(ratio * time.dur)
    setTime((tm) => ({ ...tm, cur: ratio * tm.dur }))
  }

  const progress = time.dur ? time.cur / time.dur : 0
  const expanded = hover || playing
  const width = isMobile ? (expanded ? 220 : 180) : expanded ? 240 : 190

  return (
    <>
      <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: -10, top: -10 }} />

      {/* Barre son, en haut au centre (sous l'en-tête sur mobile). */}
      <div
        role="region"
        aria-label={t('nowPlaying')}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
        style={{
          position: 'absolute',
          zIndex: 5,
          top: isMobile ? 'calc(50px + env(safe-area-inset-top))' : 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width,
          padding: '5px 7px 5px 5px',
          borderRadius: 16,
          background: 'rgba(12, 12, 12, 0.92)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 0.5px rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          color: 'white',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
          transition: reducedMotion ? 'none' : 'width 0.45s cubic-bezier(0.34, 1.3, 0.64, 1)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <img
            src={ARTWORK}
            alt=""
            draggable={false}
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: 6,
              objectFit: 'cover',
              transform: playing && !reducedMotion ? 'scale(1)' : 'scale(0.92)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {TITLE}
            </div>
            <div style={{ fontSize: 9.5, color: 'rgba(235, 235, 245, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ARTIST}
            </div>
          </div>
          <Equalizer playing={playing} reducedMotion={reducedMotion} />
          <button
            type="button"
            onClick={toggle}
            disabled={!ready}
            aria-label={playing ? t('pause') : t('play')}
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              display: 'grid',
              placeItems: 'center',
              border: 'none',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              cursor: ready ? 'pointer' : 'default',
              opacity: ready ? 1 : 0.5,
              padding: 0,
            }}
          >
            {playing ? (
              <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true">
                <rect x="1.5" y="1" width="3" height="10" rx="1" fill="currentColor" />
                <rect x="7.5" y="1" width="3" height="10" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 1.6v8.8a.8.8 0 0 0 1.2.7l7-4.4a.8.8 0 0 0 0-1.4l-7-4.4A.8.8 0 0 0 3 1.6Z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>

        {/* Progression (cliquable pour avancer), visible quand la barre est ouverte. */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: reducedMotion ? 'none' : 'grid-template-rows 0.35s ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 5, fontSize: 8.5, color: 'rgba(235, 235, 245, 0.55)', fontVariantNumeric: 'tabular-nums' }}>
              <span>{fmt(time.cur)}</span>
              <div
                role="slider"
                aria-label={t('progress')}
                aria-valuemin={0}
                aria-valuemax={Math.round(time.dur)}
                aria-valuenow={Math.round(time.cur)}
                aria-valuetext={`${fmt(time.cur)} / ${fmt(time.dur)}`}
                onPointerDown={seek}
                style={{ flex: 1, height: 10, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <div style={{ width: '100%', height: 3, borderRadius: 3, background: 'rgba(255, 255, 255, 0.18)', overflow: 'hidden' }}>
                  <div style={{ width: `${progress * 100}%`, height: '100%', background: 'rgba(255, 255, 255, 0.9)', borderRadius: 4, transition: 'width 0.5s linear' }} />
                </div>
              </div>
              <span>{fmt(time.dur)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Onde du morceau, en bas à droite (au-dessus du dock sur mobile). Cliquable : lecture / pause. */}
      <SineWave
        playing={playing}
        reducedMotion={reducedMotion}
        getLevel={getLevel}
        onToggle={toggle}
        label={playing ? t('pause') : t('play')}
        width={isMobile ? 52 : 64}
        height={isMobile ? 16 : 18}
        style={{
          position: 'absolute',
          zIndex: 4,
          // La zone cliquable déborde de l'onde (padding) : on compense la position.
          right: (isMobile ? 16 : 24) - WAVE_PAD,
          bottom: isMobile ? `calc(${100 - WAVE_PAD}px + env(safe-area-inset-bottom))` : 44 - WAVE_PAD,
        }}
      />
    </>
  )
}

/** Petites barres d'égaliseur, comme dans la Dynamic Island. */
function Equalizer({ playing, reducedMotion }: { playing: boolean; reducedMotion: boolean }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    if (!playing || reducedMotion) return
    const anims = refs.current.map((el, i) =>
      el?.animate([{ transform: 'scaleY(0.3)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0.45)' }], {
        duration: 620 + i * 170,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
      }),
    )
    return () => anims.forEach((a) => a?.cancel())
  }, [playing, reducedMotion])
  return (
    <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 11, flexShrink: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          style={{
            width: 2,
            height: 11,
            borderRadius: 1,
            background: 'rgb(255, 69, 58)',
            transform: 'scaleY(0.3)',
            opacity: playing ? 1 : 0.5,
          }}
        />
      ))}
    </span>
  )
}

const WAVE_PAD = 8

type SineWaveProps = {
  playing: boolean
  reducedMotion: boolean
  getLevel: () => number | null
  onToggle: () => void
  label: string
  width: number
  height: number
  style: React.CSSProperties
}

/**
 * Onde sinusoïdale (3 couches façon Siri) :
 * - pendant la lecture, l'amplitude suit le volume du morceau (simulé si le son n'est pas accessible) ;
 * - au survol, l'onde se soulève sous le curseur ; un clic la fait vibrer et lance / met en pause.
 */
function SineWave({ playing, reducedMotion, getLevel, onToggle, label, width, height, style }: SineWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  const pointer = useRef({ x: 0.5, inside: false, strength: 0, pluck: 0 })
  const wakeRef = useRef<() => void>(() => {})
  useEffect(() => {
    playingRef.current = playing
    wakeRef.current()
  }, [playing])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let raf = 0
    let amp = 0.06
    const layers = [
      { freq: 1.6, speed: 2.1, alpha: 0.95, width: 1.5, phase: 0 },
      { freq: 2.4, speed: -1.5, alpha: 0.5, width: 1, phase: 1.3 },
      { freq: 3.3, speed: 2.8, alpha: 0.3, width: 0.75, phase: 2.6 },
    ]

    const draw = (now: number) => {
      raf = 0
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const s = now / 1000
      const p = pointer.current
      p.strength += ((p.inside ? 1 : 0) - p.strength) * 0.12
      p.pluck *= 0.93

      // Volume : vrai signal si disponible, sinon somme de sinus lents (entre ~0.45 et 1).
      const level = playingRef.current ? (getLevel() ?? 0.72 + 0.18 * Math.sin(s * 2.7) + 0.1 * Math.sin(s * 7.3 + 1)) : 0.06
      amp += (Math.max(0.06, level) - amp) * (playingRef.current ? 0.25 : 0.08)

      ctx.shadowColor = 'rgba(52, 40, 30, 0.35)'
      ctx.shadowBlur = 4
      for (const l of layers) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 1) {
          const u = x / w
          // Enveloppe : l'onde s'écrase aux deux bouts, comme un signal qui entre et sort.
          const env = Math.sin(Math.PI * u) ** 2
          // Bosse sous le curseur + vibration du clic.
          const bump = Math.exp(-((u - p.x) ** 2) / 0.03) * (0.7 * p.strength + 0.9 * p.pluck)
          const a = Math.min(1, amp + bump)
          const wobble = 1 + 0.6 * p.pluck * Math.sin(s * 40)
          const y = h / 2 + Math.sin(u * Math.PI * 2 * l.freq * wobble + s * l.speed * (1 + p.strength) + l.phase) * env * a * (h / 2 - 2)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha})`
        ctx.lineWidth = l.width
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Au repos (rien ne joue, pas de souris), on ne redessine plus une fois la ligne posée.
      const settled = !playingRef.current && Math.abs(amp - 0.06) < 0.002 && p.strength < 0.01 && p.pluck < 0.01
      if (!reducedMotion && !settled) raf = requestAnimationFrame(draw)
    }

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    wakeRef.current = wake
    wake()
    return () => {
      cancelAnimationFrame(raf)
      wakeRef.current = () => {}
    }
  }, [reducedMotion, getLevel])

  const track = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return
    pointer.current.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    pointer.current.inside = e.pointerType === 'mouse'
    wakeRef.current()
  }

  return (
    <button
      type="button"
      aria-label={label}
      onPointerEnter={track}
      onPointerMove={track}
      onPointerLeave={() => {
        pointer.current.inside = false
        wakeRef.current()
      }}
      onClick={(e) => {
        if (e.detail !== 0) track(e as unknown as React.PointerEvent<HTMLButtonElement>)
        pointer.current.pluck = 1
        wakeRef.current()
        onToggle()
      }}
      style={{
        ...style,
        padding: WAVE_PAD,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        borderRadius: 10,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width, height }} />
    </button>
  )
}
