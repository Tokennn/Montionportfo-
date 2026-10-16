/*
 * Portage React de ThinkingText (SwiftUI, WithAnimations.app),
 * lui-même inspiré de « SwiftUI Agent Thinking Text Animations » d'Amos Gyamfi (MIT) :
 * https://github.com/amosgyamfi/SwiftUI-Agent-Thinking-Text-Animations
 * Seule une partie des styles est portée ; les formules sont celles du fichier Swift.
 */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery'

export type ThinkingTextStyle = 'sparkle' | 'pulse' | 'bounce' | 'typewriter' | 'scramble' | 'cycle'

type Props = {
  style?: ThinkingTextStyle
  text?: string
  /** Phrases du style « cycle ». */
  phrases?: string[]
  accentColor?: string
  fontSize?: number
  /** 0.5 à 2. */
  speed?: number
  isActive?: boolean
}

type Motion = { x: number; y: number; scaleX: number; scaleY: number; rotate: number; opacity: number; tint: number }
const baseMotion = (): Motion => ({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, tint: 0.65 })

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const smoothstep = (v: number) => {
  const x = clamp(v, 0, 1)
  return x * x * (3 - 2 * x)
}
const frac = (v: number) => v - Math.floor(v)
const wave = (v: number) => Math.sin(v * Math.PI * 2)
const bell = (v: number) => Math.max(0, wave(v)) ** 2
const sweep = (p: number, i: number, n: number) => Math.max(0, 1 - Math.abs(i - (p * (n + 2) - 1)) / 1.8)
const pulse = (p: number, i: number, n: number) => Math.max(0, 1 - Math.abs(i - (p * (n + 3) - 1.5)) / 1.5)

function glyphMotion(style: ThinkingTextStyle, phase: number, index: number, count: number): Motion {
  const p = frac(phase)
  const lane = index / Math.max(1, count - 1)
  const stagger = p - lane * 0.14
  const m = baseMotion()
  switch (style) {
    case 'sparkle': {
      const beam = sweep(p, index, count)
      m.y = -1.5 * beam
      m.tint = 0.35 + 0.65 * beam
      m.opacity = 0.7 + 0.3 * beam
      break
    }
    case 'pulse': {
      const beat = pulse(p, index, count)
      m.y = -7 * beat
      m.scaleX = m.scaleY = 1 - 0.08 * (1 - beat)
      m.tint = 0.3 + 0.7 * beat
      m.opacity = 0.72 + 0.28 * beat
      break
    }
    case 'bounce':
      m.y = -13 * bell(stagger)
      m.scaleX = 1 - 0.09 * bell(stagger + 0.25)
      m.scaleY = 1 - 0.07 * bell(stagger + 0.25)
      break
    default:
      break
  }
  return m
}

const SYMBOLS = '#@%&*?'

/** Indicateur textuel animé, façon agent « en train de réfléchir ». */
export function ThinkingText({
  style = 'sparkle',
  text = 'Loading',
  phrases = ['Loading', 'Analyzing', 'Writing'],
  accentColor = '#8E2230',
  fontSize = 30,
  speed = 1,
  isActive = true,
}: Props) {
  const reducedMotion = useReducedMotion()
  const running = isActive && !reducedMotion
  const phase = usePhase(running, clamp(speed, 0.5, 2))
  const label = text.trim() || 'Loading'
  const words = phrases.map((w) => w.trim()).filter(Boolean)
  const cleanPhrases = words.length ? words : ['Loading']

  const wrapper: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: fontSize * 0.35,
    color: accentColor,
    fontSize,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }

  if (style === 'cycle') {
    const layers = statusLayers(reducedMotion ? 0 : phase, cleanPhrases.length, reducedMotion)
    const strongest = layers.reduce((a, b) => (b.opacity > a.opacity ? b : a), layers[0])
    return (
      <span role="status" aria-label={cleanPhrases[strongest.index]} style={{ ...wrapper, gap: fontSize * 0.2 }}>
        <span aria-hidden="true" style={{ display: 'inline-grid' }}>
          {layers.map((layer) => {
            const word = cleanPhrases[layer.index]
            return (
              <span key={layer.id} style={{ gridArea: '1 / 1', opacity: layer.opacity }}>
                {[...word].map((ch, i) => {
                  const visible = reducedMotion ? 1 : clamp(layer.reveal * (word.length + 1) - i, 0, 1)
                  return (
                    <span key={i} style={{ display: 'inline-block', opacity: visible, transform: `translateY(${(1 - visible) * 5}px)` }}>
                      {ch === ' ' ? ' ' : ch}
                    </span>
                  )
                })}
              </span>
            )
          })}
        </span>
        <span
          aria-hidden="true"
          style={{
            width: fontSize * 0.19,
            height: fontSize * 0.19,
            borderRadius: '50%',
            background: accentColor,
            opacity: reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(phase * 2.4 * 6),
          }}
        />
      </span>
    )
  }

  const chars = [...label]
  const p = frac(phase)
  const typed = p < 0.5 ? p * 2 : (1 - p) * 2

  return (
    <span role="status" aria-label={label} style={wrapper}>
      {style === 'sparkle' && (
        <Sparkle
          size={fontSize * 0.8}
          color={accentColor}
          rotate={reducedMotion ? 0 : phase * 110}
          scale={reducedMotion ? 1 : 0.94 + 0.06 * Math.sin(phase * 2.4 * 2.6)}
        />
      )}
      <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
        {chars.map((ch, i) => {
          const m = reducedMotion ? baseMotion() : glyphMotion(style, phase, i, chars.length)
          const reveal = style === 'typewriter' && !reducedMotion ? smoothstep((typed * (chars.length + 1) - i) * 3) : 1
          const scrambled =
            style === 'scramble' &&
            !reducedMotion &&
            Math.sin(Math.PI * p) ** 2 * Math.abs(Math.sin((p * 9 + i * 0.37) * Math.PI * 2)) > 0.42
          const shown = scrambled && ch !== ' ' ? SYMBOLS[(Math.floor(p * 12) + i) % SYMBOLS.length] : ch
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: m.opacity * (0.6 + 0.4 * m.tint) * reveal,
                transform: `translate(${m.x}px, ${m.y}px) rotate(${m.rotate}deg) scale(${m.scaleX}, ${m.scaleY})`,
              }}
            >
              {shown === ' ' ? ' ' : shown}
            </span>
          )
        })}
        {style === 'typewriter' && (
          <span
            style={{
              display: 'inline-block',
              width: Math.max(1, fontSize * 0.07),
              height: fontSize,
              marginLeft: 1,
              background: accentColor,
              opacity: reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(phase * 25),
            }}
          />
        )}
      </span>
    </span>
  )
}

/** Étoile à quatre branches (équivalent du symbole SF « sparkle »). */
function Sparkle({ size, color, rotate, scale }: { size: number; color: string; rotate: number; scale: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'block', flex: 'none', transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" fill={color} />
    </svg>
  )
}

function statusLayers(phase: number, count: number, reducedMotion: boolean) {
  if (reducedMotion) return [{ id: 0, index: 0, opacity: 1, reveal: 1 }]
  const base = Math.floor(phase)
  const layers: { id: number; index: number; opacity: number; reveal: number }[] = []
  for (let cycle = base - 1; cycle <= base + 1; cycle++) {
    const local = phase - cycle
    const opacity = smoothstep((local + 0.15) / 0.25) * smoothstep((1.1 - local) / 0.25)
    if (opacity <= 0) continue
    layers.push({ id: cycle, index: ((cycle % count) + count) % count, opacity, reveal: smoothstep((local + 0.15) / 0.6) })
  }
  return layers.length ? layers : [{ id: base, index: ((base % count) + count) % count, opacity: 1, reveal: 1 }]
}

/** Phase de l'animation (temps écoulé × vitesse / 2.4), en pause quand inactive ; reprend où elle s'était arrêtée. */
function usePhase(running: boolean, speed: number) {
  const [phase, setPhase] = useState(0)
  const elapsedRef = useRef(0)
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      elapsedRef.current += (now - last) / 1000
      last = now
      setPhase((elapsedRef.current * speed) / 2.4)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, speed])
  return phase
}
