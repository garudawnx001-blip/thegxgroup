import { useEffect, useRef } from 'react'

type Pt = { x: number; y: number; tx: number; ty: number; vx: number; vy: number; z: number; blue: boolean; d: number }

const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })

/**
 * The GX mark rendered as a field of engineered points.
 * Points assemble into the mark (BUILD), the blue slash streaks in (LAUNCH), and the field
 * expands with scroll (SCALE). Cursor/touch pushes points away. Paused when off-screen.
 */
export function ParticleMark({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current!; const ctx = cv.getContext('2d')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let pts: Pt[] = []; let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now()
    const mouse = { x: -9999, y: -9999 }
    let scroll = 0
    let imgs: [HTMLImageElement, HTMLImageElement] | null = null

    const build = () => {
      if (!imgs) return
      const r = cv.getBoundingClientRect(); w = r.width; h = r.height
      dpr = Math.min(devicePixelRatio || 1, w < 640 ? 1.5 : 2)
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const mobile = w < 640
      const mw = Math.min(w * (mobile ? 0.82 : 0.6), (h * 0.8) * (508 / 205), 640); const mh = mw * (205 / 508)
      const ox = (w - mw) / 2, oy = (h - mh) / 2
      const step = mobile ? 5 : w < 1024 ? 5 : 4
      const off = document.createElement('canvas'); off.width = Math.ceil(mw); off.height = Math.ceil(mh)
      const o = off.getContext('2d', { willReadFrequently: true })!
      const sample = (img: HTMLImageElement, x: number, y: number, iw: number, ih: number, blue: boolean) => {
        o.clearRect(0, 0, off.width, off.height); o.drawImage(img, x, y, iw, ih)
        const data = o.getImageData(0, 0, off.width, off.height).data
        for (let yy = 0; yy < off.height; yy += step) for (let xx = 0; xx < off.width; xx += step) {
          if (data[(yy * off.width + xx) * 4 + 3] > 140) {
            const a = Math.random() * Math.PI * 2, rr = Math.max(w, h) * (0.4 + Math.random() * 0.6)
            pts.push({ tx: ox + xx, ty: oy + yy, x: reduce ? ox + xx : w / 2 + Math.cos(a) * rr, y: reduce ? oy + yy : h / 2 + Math.sin(a) * rr, vx: 0, vy: 0, z: Math.random(), blue, d: blue ? 0.9 + Math.random() * 0.25 : Math.random() * 0.7 })
          }
        }
      }
      pts = []
      sample(imgs[0], 0, 0, mw, mh, false)
      // blue slash sits at (376,1) 131×102 inside the 508×205 mark
      const k = mw / 508
      sample(imgs[1], 376 * k, 1 * k, 131 * k, 102 * k, true)
      t0 = performance.now()
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const t = (now - t0) / 1000
      ctx.clearRect(0, 0, w, h)
      const sp = Math.min(scroll, 1)
      for (const p of pts) {
        const active = t > p.d
        // scale: field expands outward and lifts on scroll
        const ex = (p.tx - w / 2) * sp * 0.9 * (0.6 + p.z), ey = (p.ty - h / 2) * sp * 0.9 * (0.6 + p.z) - sp * 120 * p.z
        const gx = active ? p.tx + ex : p.x, gy = active ? p.ty + ey : p.y
        let ax = (gx - p.x) * (p.blue ? 0.09 : 0.05), ay = (gy - p.y) * (p.blue ? 0.09 : 0.05)
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy
        if (d2 < 9000) { const f = (9000 - d2) / 9000 * 3.2; const dd = Math.sqrt(d2) || 1; ax += dx / dd * f; ay += dy / dd * f }
        p.vx = (p.vx + ax) * 0.78; p.vy = (p.vy + ay) * 0.78
        p.x += p.vx; p.y += p.vy
        const speed = Math.abs(p.vx) + Math.abs(p.vy)
        const alpha = (0.45 + p.z * 0.55) * (1 - sp * 0.85)
        if (p.blue) {
          ctx.fillStyle = `rgba(8,124,245,${Math.min(1, alpha + 0.25)})`
          ctx.fillRect(p.x, p.y, 2.2, 2.2)
          if (speed > 1.5) { ctx.strokeStyle = `rgba(8,124,245,${alpha * 0.6})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4); ctx.stroke() }
        } else {
          ctx.fillStyle = `rgba(255,255,255,${alpha})`
          const s = speed > 2 ? 1 : 1.5 + p.z * 0.6
          ctx.fillRect(p.x, p.y, s, s)
        }
      }
    }

    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const onLeave = () => { mouse.x = mouse.y = -9999 }
    // Coming back up to the hero replays the same assembly you see on load.
    let away = false
    const scatter = () => {
      for (const p of pts) { const a = Math.random() * Math.PI * 2, rr = Math.max(w, h) * (0.4 + Math.random() * 0.6); p.x = w / 2 + Math.cos(a) * rr; p.y = h / 2 + Math.sin(a) * rr; p.vx = p.vy = 0 }
      t0 = performance.now()
    }
    const onScroll = () => {
      scroll = Math.max(0, window.scrollY / (window.innerHeight * 0.9))
      if (scroll >= 1) away = true
      else if (away && scroll < 0.75) { away = false; if (!reduce) scatter() }
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    const vis = () => { visible = document.visibilityState === 'visible' }
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(build, 150) }

    Promise.all([loadImg('/brand/gx-white.svg'), loadImg('/brand/gx-blue.svg')]).then((i) => { imgs = i; build(); raf = requestAnimationFrame(frame) })
    io.observe(cv)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', vis)
    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      window.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={`h-full w-full ${className}`} />
}
