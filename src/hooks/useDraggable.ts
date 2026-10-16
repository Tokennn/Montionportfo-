import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

type Options = {
  /** Élément à garder entièrement visible dans la fenêtre (sinon : pas de contrainte). */
  boundsRef?: RefObject<HTMLElement | null>
  /** Marge minimale (px) entre l'élément et les bords de l'écran. */
  margin?: number
}

/** Distance (px) au-delà de laquelle un appui devient un déplacement et plus un clic. */
export const DRAG_THRESHOLD = 5

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/**
 * Drag souris + tactile (pointer events). L'état du geste vit dans un ref pour
 * ne pas re-rendre à chaque mousemove ; seule la position passe par le state.
 */
export function useDraggable({ boundsRef, margin = 8 }: Options = {}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const posRef = useRef(pos)
  useLayoutEffect(() => {
    posRef.current = pos
  }, [pos])

  const drag = useRef({
    dragging: false,
    sx: 0, // point de départ du pointeur
    sy: 0,
    ox: 0, // offset au début du geste
    oy: 0,
    cx: 0, // dernier delta appliqué
    cy: 0,
    minDx: -Infinity,
    maxDx: Infinity,
    minDy: -Infinity,
    maxDy: Infinity,
  })
  // true dès que le geste a dépassé le seuil ; reste vrai jusqu'au prochain appui
  // pour que le onClick qui suit puisse l'ignorer.
  const isDraggingRef = useRef(false)
  const detachRef = useRef<(() => void) | null>(null)

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const d = drag.current
      d.dragging = true
      d.sx = e.clientX
      d.sy = e.clientY
      d.ox = posRef.current.x
      d.oy = posRef.current.y
      d.cx = 0
      d.cy = 0
      isDraggingRef.current = false

      const el = boundsRef?.current
      if (el) {
        const r = el.getBoundingClientRect()
        d.minDx = margin - r.left
        d.maxDx = window.innerWidth - margin - r.right
        d.minDy = margin - r.top
        d.maxDy = window.innerHeight - margin - r.bottom
      } else {
        d.minDx = d.minDy = -Infinity
        d.maxDx = d.maxDy = Infinity
      }

      const move = (ev: PointerEvent) => {
        if (!d.dragging) return
        const rawX = ev.clientX - d.sx
        const rawY = ev.clientY - d.sy
        if (!isDraggingRef.current && Math.hypot(rawX, rawY) < DRAG_THRESHOLD) return
        isDraggingRef.current = true
        d.cx = clamp(rawX, d.minDx, d.maxDx)
        d.cy = clamp(rawY, d.minDy, d.maxDy)
        setPos({ x: d.ox + d.cx, y: d.oy + d.cy })
      }
      const up = () => {
        d.dragging = false
        detach()
      }
      const detach = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        detachRef.current = null
      }
      detachRef.current?.()
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
      detachRef.current = detach
    },
    [boundsRef, margin],
  )

  /** Ramène l'élément dans l'écran s'il en dépasse (montage, redimensionnement). */
  const keepInView = useCallback(() => {
    const el = boundsRef?.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let dx = 0
    let dy = 0
    if (r.left < margin) dx = margin - r.left
    else if (r.right > vw - margin) dx = Math.max(margin - r.left, vw - margin - r.right)
    if (r.top < margin) dy = margin - r.top
    else if (r.bottom > vh - margin) dy = Math.max(margin - r.top, vh - margin - r.bottom)
    if (dx || dy) setPos((p) => ({ x: p.x + dx, y: p.y + dy }))
  }, [boundsRef, margin])

  useLayoutEffect(() => {
    if (!boundsRef) return
    keepInView()
    window.addEventListener('resize', keepInView)
    return () => window.removeEventListener('resize', keepInView)
  }, [boundsRef, keepInView])

  useEffect(() => () => detachRef.current?.(), [])

  return { pos, setPos, onPointerDown, isDraggingRef }
}
