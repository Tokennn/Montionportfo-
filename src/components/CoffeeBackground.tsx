import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

/** Dimensions de l'image et position de la crème (en pixels de l'image d'origine). */
const IMG_W = 736
const IMG_H = 1104
const CREMA = { cx: 364, cy: 530, r: 130 }

/** Durée du tourbillon de la crème, après l'entrée de la tasse. */
const SWIRL_MS = 2800
const SWIRL_DELAY_MS = 250

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** Souris : décalage max de la surface du café (px de l'image) et de la vapeur (px écran). */
const CREMA_SHIFT = 10
const STEAM_SHIFT_PX = 24

type Props = {
  src: string
  /** Hauteur disponible (100vh sur desktop, 100dvh sur mobile). */
  viewportHeight: string
  reducedMotion: boolean
}

/**
 * Fond « café » animé :
 * 1. entrée de la tasse (fondu + léger zoom/rotation, effet ressort) ;
 * 2. la crème tourne puis se pose (SVG : rotation + déformation liquide qui s'amortit) ;
 * 3. vapeur très légère en boucle ;
 * 4. souris sur le café : le liquide glisse vers le curseur et ondule ; la vapeur suit légèrement.
 *    La tasse ne bouge plus après son entrée.
 * Avec prefers-reduced-motion, l'image reste fixe.
 */
export function CoffeeBackground({ src, viewportHeight, reducedMotion }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const steamLayerRef = useRef<HTMLDivElement>(null)
  const cremaSvgRef = useRef<SVGSVGElement>(null)
  const swirlGroupRef = useRef<SVGGElement>(null)
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null)
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)
  const steamRefs = useRef<(HTMLDivElement | null)[]>([])
  const swirlDoneRef = useRef(reducedMotion)

  // 1. Entrée de la tasse.
  useEffect(() => {
    if (reducedMotion || !frameRef.current) return
    const anim = frameRef.current.animate(
      [
        { opacity: 0, transform: 'scale(0.96) rotate(-4deg)' },
        { opacity: 1, transform: 'scale(1) rotate(0deg)' },
      ],
      { duration: 1100, easing: 'cubic-bezier(0.34, 1.28, 0.64, 1)', fill: 'both' },
    )
    return () => anim.cancel()
  }, [reducedMotion])

  // 2. Tourbillon de la crème : rotation + déformation qui ralentissent jusqu'à l'arrêt.
  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const start = performance.now() + SWIRL_DELAY_MS
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / SWIRL_MS))
      const rest = 1 - easeOutCubic(t)
      swirlGroupRef.current?.setAttribute('transform', `rotate(${-140 * rest} ${CREMA.cx} ${CREMA.cy})`)
      displaceRef.current?.setAttribute('scale', String(26 * rest))
      // La texture du bruit dérive pour donner un mouvement de liquide.
      turbulenceRef.current?.setAttribute('baseFrequency', `${0.012 + 0.006 * rest} ${0.02 + 0.01 * rest}`)
      if (t < 1) raf = requestAnimationFrame(tick)
      else {
        swirlDoneRef.current = true
        // Posée : la copie est identique à la photo, on la masque jusqu'au passage de la souris.
        cremaSvgRef.current?.style.setProperty('visibility', 'hidden')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  // 3. Vapeur : volutes floues qui montent et s'effacent, en boucle.
  useEffect(() => {
    if (reducedMotion) return
    const anims = steamRefs.current.map((el, i) =>
      el?.animate(
        [
          { opacity: 0, transform: 'translate(-50%, 0) scale(0.7) rotate(0deg)' },
          { opacity: 0.55, transform: `translate(${-50 + (i - 1) * 8}%, -18%) scale(1) rotate(${(i - 1) * 8}deg)`, offset: 0.4 },
          { opacity: 0, transform: `translate(${-50 + (i - 1) * 14}%, -42%) scale(1.25) rotate(${(i - 1) * 14}deg)` },
        ],
        { duration: 5200 + i * 900, delay: 1200 + i * 1400, iterations: Infinity, easing: 'ease-in-out', fill: 'both' },
      ),
    )
    return () => anims.forEach((a) => a?.cancel())
  }, [reducedMotion])

  // 4. Souris sur le café : la surface du liquide suit le curseur et ondule (la tasse reste fixe).
  useEffect(() => {
    if (reducedMotion) return
    const target = { x: 0, y: 0 } // décalage voulu de la crème (-1 → 1)
    const cur = { x: 0, y: 0 }
    const steamTarget = { x: 0, y: 0 }
    const steam = { x: 0, y: 0 }
    let last: { x: number; y: number } | null = null
    let energy = 0 // agitation du liquide (0 → 1)
    let raf = 0

    const tick = (now: number) => {
      raf = 0
      cur.x += (target.x - cur.x) * 0.08
      cur.y += (target.y - cur.y) * 0.08
      steam.x += (steamTarget.x - steam.x) * 0.06
      steam.y += (steamTarget.y - steam.y) * 0.06
      energy *= 0.95

      steamLayerRef.current?.style.setProperty('transform', `translate3d(${steam.x * STEAM_SHIFT_PX}px, ${steam.y * STEAM_SHIFT_PX}px, 0)`)

      // Pendant le tourbillon d'entrée, la crème lui appartient.
      const svg = cremaSvgRef.current
      if (swirlDoneRef.current && svg) {
        const active = energy > 0.01 || Math.abs(cur.x) > 0.002 || Math.abs(cur.y) > 0.002
        svg.style.visibility = active ? 'visible' : 'hidden'
        if (active) {
          swirlGroupRef.current?.setAttribute('transform', `translate(${cur.x * CREMA_SHIFT} ${cur.y * CREMA_SHIFT})`)
          displaceRef.current?.setAttribute('scale', String(18 * energy))
          const drift = Math.sin(now / 600) * 0.004
          turbulenceRef.current?.setAttribute('baseFrequency', `${0.014 + drift} ${0.024 - drift}`)
        }
      }

      const settled =
        Math.abs(target.x - cur.x) < 0.001 &&
        Math.abs(target.y - cur.y) < 0.001 &&
        Math.abs(steamTarget.x - steam.x) < 0.001 &&
        Math.abs(steamTarget.y - steam.y) < 0.001 &&
        energy < 0.01
      if (!settled) raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      steamTarget.x = (e.clientX / window.innerWidth) * 2 - 1
      steamTarget.y = (e.clientY / window.innerHeight) * 2 - 1

      const rect = frameRef.current?.getBoundingClientRect()
      if (rect) {
        const k = rect.width / IMG_W
        const r = CREMA.r * k * 1.2
        const rx = e.clientX - (rect.left + CREMA.cx * k)
        const ry = e.clientY - (rect.top + CREMA.cy * k)
        if (rx * rx + ry * ry < r * r) {
          // Sur le café : le liquide glisse vers le curseur, et la vitesse le fait onduler.
          target.x = rx / r
          target.y = ry / r
          if (last) energy = Math.min(1, energy + Math.hypot(e.clientX - last.x, e.clientY - last.y) / 70)
        } else {
          target.x = 0
          target.y = 0
        }
      }
      last = { x: e.clientX, y: e.clientY }
      wake()
    }
    const onLeave = () => {
      target.x = target.y = steamTarget.x = steamTarget.y = 0
      last = null
      wake()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  const edgeMask =
    'linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
  const pct = (v: number, total: number) => `${(v / total) * 100}%`

  const frame: CSSProperties = {
    position: 'relative',
    width: `min(100%, calc(${viewportHeight} * ${IMG_W} / ${IMG_H}))`,
    aspectRatio: `${IMG_W} / ${IMG_H}`,
    maskImage: edgeMask,
    WebkitMaskImage: edgeMask,
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div ref={frameRef} style={frame}>
        <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

        {/* Copie de la crème par-dessus : tourbillon d'entrée, puis surface remuée par la souris (masquée au repos). */}
        {!reducedMotion && (
          <svg ref={cremaSvgRef} viewBox={`0 0 ${IMG_W} ${IMG_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="crema-fade">
                <stop offset="82%" stopColor="white" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="crema-mask">
                <circle cx={CREMA.cx} cy={CREMA.cy} r={CREMA.r} fill="url(#crema-fade)" />
              </mask>
              <filter id="crema-liquid" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g mask="url(#crema-mask)">
              <g filter="url(#crema-liquid)">
                <g ref={swirlGroupRef} transform={`rotate(-140 ${CREMA.cx} ${CREMA.cy})`}>
                  <image href={src} width={IMG_W} height={IMG_H} />
                </g>
              </g>
            </g>
          </svg>
        )}

        {/* Vapeur : elle suit légèrement la souris. */}
        {!reducedMotion && (
          <div ref={steamLayerRef} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  steamRefs.current[i] = el
                }}
                style={{
                  position: 'absolute',
                  left: pct(CREMA.cx + (i - 1) * 40, IMG_W),
                  top: pct(CREMA.cy - 60, IMG_H),
                  width: pct(170, IMG_W),
                  height: pct(220, IMG_H),
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(255, 250, 242, 0.5) 0%, rgba(255, 250, 242, 0) 70%)',
                  filter: 'blur(14px)',
                  opacity: 0,
                  mixBlendMode: 'screen',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
