import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'

const STAGES = ['BUILD', 'LAUNCH', 'SCALE'] as const
const ease = [0.76, 0, 0.24, 1] as const
// Diagonal cut that matches the angle of the blue slash in the GX mark.
const TOP = 'polygon(0 0, 100% 0, 100% 38%, 0 62%)'
const BOTTOM = 'polygon(0 62%, 100% 38%, 100% 100%, 0 100%)'

/** First-visit onboarding: kinetic BUILD → LAUNCH → SCALE type, the logo assembling, then an X-angle split reveal. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true)
  const [stage, setStage] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    document.getElementById('boot')?.remove()
    const t0 = performance.now(); let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 2500)
      const e = 1 - Math.pow(1 - p, 1.6)
      setPct(Math.round(e * 100)); setStage(p < 0.36 ? 0 : p < 0.66 ? 1 : 2)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const end = setTimeout(() => setShow(false), 2900)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setShow(false)
    window.addEventListener('keydown', esc)
    return () => { cancelAnimationFrame(raf); clearTimeout(end); window.removeEventListener('keydown', esc) }
  }, [])

  const Panel = ({ clip, dir }: { clip: string; dir: 1 | -1 }) => (
    <motion.div className="absolute inset-0 bg-[#07080A]" style={{ clipPath: clip }}
      exit={{ x: `${-dir * 18}%`, y: `${-dir * 100}%` }} transition={{ duration: 1, ease }}>
      <div className="blueprint absolute inset-0" />
    </motion.div>
  )

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div key="intro" className="fixed inset-0 z-[100] overflow-hidden" role="status" aria-label="Loading THE GX GROUP" exit={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Panel clip={TOP} dir={1} />
          <Panel clip={BOTTOM} dir={-1} />
          {/* the cut line flashes blue as the panels part */}
          <motion.svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" initial={{ opacity: 0 }} exit={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8 }}>
            <line x1="0" y1="62" x2="100" y2="38" stroke="#087CF5" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
          </motion.svg>

          <motion.div className="absolute inset-0" exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.45, ease: 'easeIn' }}>
            {/* kinetic stage word */}
            <div aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p key={STAGES[stage]}
                  className="select-none whitespace-nowrap text-center font-display font-extrabold leading-none tracking-[-0.06em] text-transparent"
                  style={{ fontSize: 'clamp(4rem, 19vw, 20rem)', WebkitTextStroke: '1px rgba(255,255,255,.18)' }}
                  initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.65, ease }}>
                  {STAGES[stage]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="absolute left-1/2 top-1/2 w-[min(72vw,600px)] -translate-x-1/2 -translate-y-1/2">
              <BrandLogo play delay={0.1} />
            </div>

            {/* readout */}
            <div className="absolute inset-x-5 bottom-6 sm:inset-x-10 sm:bottom-10">
              <div className="flex items-end justify-between">
                <div className="flex gap-4 font-display text-[11px] font-semibold tracking-label sm:gap-8">
                  {STAGES.map((s, i) => (
                    <span key={s} className={`transition-colors duration-300 ${i === stage ? 'text-ink' : i < stage ? 'text-mute' : 'text-line'}`}><span className={i <= stage ? 'text-accent' : ''}>0{i + 1}</span> {s}</span>
                  ))}
                </div>
                <span className="font-display text-4xl font-extrabold tabular-nums leading-none tracking-tight text-ink sm:text-6xl">{pct}<span className="text-accent">%</span></span>
              </div>
              <div className="mt-4 h-px w-full bg-line"><div className="h-px bg-accent" style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(8,124,245,.8)' }} /></div>
            </div>
            <button onClick={() => setShow(false)} className="absolute right-5 top-5 font-display text-[11px] tracking-label text-mute hover:text-ink sm:right-10 sm:top-8">SKIP →</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
