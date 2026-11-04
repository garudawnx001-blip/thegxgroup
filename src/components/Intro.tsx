import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'

const STAGES = ['BUILD', 'LAUNCH', 'SCALE'] as const

/** First-visit onboarding sequence. Plays once per session, skippable, disabled for reduced motion. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true)
  const [stage, setStage] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    document.getElementById('boot')?.remove()
    const t0 = performance.now(); let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 2500)
      setPct(Math.round(p * 100)); setStage(p < 0.4 ? 0 : p < 0.62 ? 1 : 2)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const end = setTimeout(() => setShow(false), 3000)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setShow(false)
    window.addEventListener('keydown', esc)
    return () => { cancelAnimationFrame(raf); clearTimeout(end); window.removeEventListener('keydown', esc) }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div key="intro" className="fixed inset-0 z-[100] overflow-hidden" aria-label="Loading THE GX GROUP" role="status"
          exit={{ opacity: 1 }} transition={{ duration: 0.9 }}>
          {/* split shutters */}
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-bg" exit={{ y: '-100%' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-bg" exit={{ y: '100%' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.span className="absolute inset-x-0 top-1/2 h-px bg-accent/70" initial={{ scaleX: 0 }} animate={{ scaleX: 0 }} exit={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 0.6 }} />

          <motion.div className="absolute inset-0" exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }} transition={{ duration: 0.55, ease: 'easeIn' }}>
            {/* blueprint grid */}
            <div className="blueprint absolute inset-0" />
            <motion.span className="absolute left-0 right-0 top-1/2 h-px bg-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }} />
            <motion.span className="absolute bottom-0 top-0 left-1/2 w-px bg-line" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.1 }} />

            <div className="absolute left-1/2 top-1/2 w-[min(78vw,720px)] -translate-x-1/2 -translate-y-1/2">
              <Corners />
              <BrandLogo play delay={0.15} />
            </div>

            {/* readout */}
            <div className="absolute inset-x-5 bottom-6 flex items-end justify-between font-display text-[11px] tracking-label text-mute sm:inset-x-10 sm:bottom-10">
              <div className="flex gap-4 sm:gap-8">
                {STAGES.map((s, i) => (
                  <span key={s} className={`transition-colors duration-300 ${i === stage ? 'text-ink' : i < stage ? 'text-mute' : 'text-line'}`}>
                    <span className={i === stage ? 'text-accent' : ''}>0{i + 1}</span> {s}
                  </span>
                ))}
              </div>
              <span className="tabular-nums text-ink">{String(pct).padStart(3, '0')}</span>
            </div>
            <button onClick={() => setShow(false)} className="absolute right-5 top-5 font-display text-[11px] tracking-label text-mute hover:text-ink sm:right-10 sm:top-8">SKIP</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Corners() {
  const c = 'absolute h-4 w-4 border-accent'
  return (
    <motion.div aria-hidden className="pointer-events-none absolute -inset-6 sm:-inset-10" initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </motion.div>
  )
}
