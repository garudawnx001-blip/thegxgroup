import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Brand } from './blocks'
import { track } from '../lib/supabase'

type L = { label: string; url: string }
export const isStore = (u: string) => /apps\.apple\.com|play\.google\.com/.test(u)

const Apple = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden><path d="M16.37 1.43c0 1.14-.5 2.27-1.18 3.08-.74.9-1.99 1.57-2.99 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.57-2.27 1.2-2.98.81-.94 2.15-1.64 3.25-1.68.03.13.06.28.06.43zm4.56 15.71c-.03.07-.46 1.58-1.52 3.12-.94 1.34-1.94 2.71-3.43 2.71-1.52 0-1.9-.88-3.63-.88-1.7 0-2.3.91-3.67.91-1.38 0-2.33-1.26-3.43-2.8C2.96 18.38 1.93 15.57 1.93 12.92c0-4.28 2.8-6.55 5.55-6.55 1.45 0 2.67.95 3.6.95.86 0 2.22-1.01 3.9-1.01.61 0 2.89.06 4.37 2.19-.13.09-2.38 1.37-2.38 4.19 0 3.26 2.85 4.42 2.96 4.45z" /></svg>
)
const Play = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
    <path fill="#00D7FE" d="M3.6 1.8 13.4 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z" />
    <path fill="#FFD400" d="M16.8 8.6 13.4 12l3.4 3.4 3.9-2.2c1.1-.6 1.1-1.8 0-2.4z" />
    <path fill="#00F076" d="M3.6 1.8c.3-.1.7-.1 1.1.1l12.1 6.7L13.4 12z" />
    <path fill="#FF3A44" d="M13.4 12l3.4 3.4-12.1 6.7c-.4.2-.8.2-1.1.1z" />
  </svg>
)

const OFFICIAL = {
  ios: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
  android: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
}

function Badge({ l, slug }: { l: L; slug: string }) {
  const ios = l.url.includes('apple.com')
  const [ok, setOk] = useState(true)
  const label = ios ? 'Download on the App Store' : 'Get it on Google Play'
  return (
    <a href={l.url} target="_blank" rel="noopener" aria-label={label} title={label}
      onClick={() => track('portfolio_outbound', { slug, to: ios ? 'app_store' : 'google_play' })}
      className="inline-block h-[52px] origin-center transition-opacity hover:opacity-85 max-[400px]:-mx-[8px] max-[400px]:scale-[0.86]">
      {ok ? (ios
        // official Apple badge (120x40 artwork)
        ? <img src={OFFICIAL.ios} alt={label} width={156} height={52} className="h-[52px] w-[156px]" onError={() => setOk(false)} />
        // official Google Play badge; the PNG carries built-in padding, cropped here to the badge itself
        : <span className="block h-[52px] w-[175px] overflow-hidden rounded-[9px]"><img src={OFFICIAL.android} alt={label} width={200} height={77} className="-ml-[12.7px] -mt-[12.7px] h-[77.4px] w-[200px] max-w-none" onError={() => setOk(false)} /></span>)
        : (
          <span className="inline-flex h-[52px] items-center gap-3 rounded-xl border border-white/25 bg-black px-4 text-white">
            {ios ? <Apple /> : <Play />}
            <span className="text-left leading-none"><span className="block text-[10px] tracking-wide opacity-80">{ios ? 'Download on the' : 'GET IT ON'}</span><span className="mt-1 block text-[17px] font-semibold tracking-tight">{ios ? 'App Store' : 'Google Play'}</span></span>
          </span>
        )}
    </a>
  )
}

/** App Store / Google Play badges (official artwork) for the store links in a project. */
export function StoreBadges({ links, slug, className = '' }: { links: L[]; slug: string; className?: string }) {
  const stores = links.filter((l) => isStore(l.url)).sort((a) => (a.url.includes('apple.com') ? -1 : 1))
  if (!stores.length) return null
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{stores.map((l) => <Badge key={l.url} l={l} slug={slug} />)}</div>
}

const ease = [0.22, 1, 0.36, 1] as const
const finger = [0.65, 0, 0.35, 1] as const

/**
 * Brand reveal that tells the product story: a live session lights up, a "Swipe to bid" slider is dragged,
 * and on release the knob flies up the diagonal to become the arrowhead of the logo while the mark wipes in
 * along the same rising path. Then the wordmark, tagline and store badges settle.
 */
export function BrandReveal({ b, links, slug }: { b: Brand; links: L[]; slug: string }) {
  const reduce = useReducedMotion()
  const accent = b.accent ?? '#25D366'
  const words = [b.first, b.second].filter(Boolean) as string[]
  const box = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const seen = useInView(box, { once: true, amount: 0.55 })
  const [run, setRun] = useState(0)
  // geometry: mark width, slider width, and the arrowhead position measured from the panel centre
  const [g, setG] = useState({ w: 170, track: 300, tip: { x: 70, y: -120 } })
  useEffect(() => { if (seen) setRun((r) => r || 1) }, [seen])
  useEffect(() => {
    const el = box.current; if (!el) return
    const fit = () => {
      const W = el.clientWidth
      const w = Math.round(Math.min(190, Math.max(130, W * 0.17))), h = (w * 470) / 640
      const sr = el.getBoundingClientRect(), mr = slot.current?.getBoundingClientRect()
      const tip = mr ? { x: mr.left + mr.width / 2 - w / 2 + 0.97 * w - (sr.left + sr.width / 2), y: mr.top + 0.08 * h - (sr.top + sr.height / 2) } : { x: 70, y: -120 }
      setG({ w, track: Math.min(300, W - 56), tip })
    }
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); document.fonts?.ready.then(fit); return () => ro.disconnect()
  }, [])
  const { w, track: TRACK, tip } = g
  const h = Math.round(w * 470 / 640) // mark artwork ratio
  const KNOB = 52, PAD = 4, TH = KNOB + 2 * PAD, travel = TRACK - 2 * PAD - KNOB
  const x0 = -travel / 2, x1 = travel / 2
  const play = run > 0 && !reduce
  const done = reduce || run > 0
  // knob timeline (s): appear .3 → drag .9–1.7 → hold → fly to arrowhead 1.85–2.35
  const T = 2.35, at = (s: number) => s / T
  const times = [0, at(0.3), at(0.9), at(1.7), at(1.85), 1]
  let k = 0
  const mask = { WebkitMaskImage: `url(${b.mark})`, maskImage: `url(${b.mark})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' } as const
  const hidden = !done
  return (
    <section ref={box} aria-label={`${words.join(' ')} brand`} className="relative overflow-hidden border border-line text-white" style={{ background: b.bg ?? '#050505' }}>
      {b.font && <style>{`@font-face{font-family:GXBrand;src:url(${b.font}-800.woff2) format('woff2');font-weight:800;font-display:swap}@font-face{font-family:GXBrand;src:url(${b.font}-400.woff2) format('woff2');font-weight:400;font-display:swap}`}</style>}
      {/* act 1 — live session + swipe-to-bid, centred in the panel */}
      {play && (
        <div key={`s${run}`} aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ fontFamily: b.font ? 'GXBrand, sans-serif' : undefined }}>
          <div className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
            <div className="absolute left-0 flex -translate-x-1/2 justify-center" style={{ top: -TH / 2 - 40 }}>
              <motion.span className="block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-extrabold tracking-[0.16em]" style={{ background: accent, color: '#04140a' }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }} transition={{ duration: 2.3, times: [0, 0.12, 0.8, 1], ease: 'easeOut' }}>● LIVE</motion.span>
            </div>
            <motion.div className="absolute overflow-hidden rounded-full border border-[#262626] bg-[#121212]" style={{ width: TRACK, height: TH, left: -TRACK / 2, top: -TH / 2 }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: [0, 1, 1, 1, 1, 0], scale: [0.96, 1, 1, 1, 1, 0.98] }} transition={{ duration: T - 0.15, times }}>
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}33, ${accent}88)` }}
                initial={{ width: TH }} animate={{ width: [TH, TH, TH, TRACK, TRACK, TRACK] }} transition={{ duration: T - 0.15, times, ease: ['linear', 'linear', finger, 'linear', 'linear'] }} />
              <motion.span className="absolute inset-0 flex items-center justify-center pl-10 text-[15px] font-normal tracking-wide text-white/80"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.35, times: [0, 0.22, 0.66, 1] }}>Swipe to bid</motion.span>
            </motion.div>
            <motion.span className="absolute flex items-center justify-center rounded-full" style={{ width: KNOB, height: KNOB, left: -KNOB / 2, top: -KNOB / 2, background: accent }}
              initial={{ x: x0, y: 0, opacity: 0, scale: 0.6 }}
              animate={{ x: [x0, x0, x0, x1, x1, tip.x], y: [0, 0, 0, 0, 0, tip.y], scale: [0.6, 1, 1, 1, 0.92, 0.3], opacity: [0, 1, 1, 1, 1, 0] }}
              transition={{ duration: T, times, ease: ['easeOut', 'linear', finger, 'easeOut', [0.55, 0, 0.25, 1]] }}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#04140a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </motion.span>
          </div>
        </div>
      )}
      <div key={run} className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-14 pt-16 text-center sm:pb-16 sm:pt-20" style={{ fontFamily: b.font ? 'GXBrand, sans-serif' : undefined }}>
        {/* act 2 — the mark wipes in along its own rising diagonal, where the knob lands */}
        <div ref={slot} className="relative" style={{ width: w, height: h }}>
          <motion.div className="absolute inset-0"
            initial={hidden || play ? { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%)', scale: 0.94 } : false}
            animate={done ? { clipPath: 'polygon(0% 100%, 0% -110%, 210% 100%)', scale: 1 } : undefined}
            transition={play ? { delay: 1.95, duration: 0.8, ease: [0.3, 0.7, 0.2, 1] } : { duration: 0 }}>
            <img src={b.mark} alt="" width={640} height={470} className="block h-full w-full" />
            {play && <motion.span aria-hidden className="pointer-events-none absolute inset-0"
              style={{ ...mask, backgroundImage: 'linear-gradient(115deg,transparent 40%,rgba(255,255,255,.6) 50%,transparent 60%)', backgroundSize: '260% 100%', backgroundRepeat: 'no-repeat' }}
              initial={{ backgroundPosition: '160% 0%' }} animate={{ backgroundPosition: '-60% 0%' }} transition={{ delay: 2.75, duration: 1.1, ease: 'easeInOut' }} />}
          </motion.div>
        </div>
        <h2 className="mt-8 flex flex-wrap justify-center gap-x-[0.3em] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-none tracking-[0.04em]">
          {words.map((wd, wi) => (
            <span key={wd} className="inline-flex overflow-hidden pb-[0.08em]" style={{ color: wi ? accent : undefined }}>
              {[...wd].map((ch) => {
                const i = k++
                return <motion.span key={i} className="inline-block" initial={hidden || play ? { y: '0.9em', opacity: 0 } : false} animate={done ? { y: 0, opacity: 1 } : undefined}
                  transition={play ? { delay: 2.5 + i * 0.045, duration: 0.7, ease } : { duration: 0 }}>{ch}</motion.span>
              })}
            </span>
          ))}
        </h2>
        {b.tagline && <motion.p className="mt-4 text-[clamp(1rem,1.5vw,1.2rem)] font-normal text-white/65" initial={hidden || play ? { opacity: 0, y: 8 } : false} animate={done ? { opacity: 1, y: 0 } : undefined} transition={play ? { delay: 3.05, duration: 0.7, ease } : { duration: 0 }}>{b.tagline}</motion.p>}
        <motion.div className="mt-6 h-px w-24 origin-left" style={{ background: accent }} initial={hidden || play ? { scaleX: 0 } : false} animate={done ? { scaleX: 1 } : undefined} transition={play ? { delay: 3.2, duration: 0.8, ease } : { duration: 0 }} />
        <motion.div initial={hidden || play ? { opacity: 0, y: 10 } : false} animate={done ? { opacity: 1, y: 0 } : undefined} transition={play ? { delay: 3.4, duration: 0.7, ease } : { duration: 0 }}>
          <StoreBadges links={links} slug={slug} className="mt-8 justify-center max-[400px]:flex-nowrap max-[400px]:gap-1" />
        </motion.div>
      </div>
      {!reduce && run > 0 && <button type="button" onClick={() => setRun((r) => r + 1)} className="absolute bottom-3 right-4 text-[11px] font-semibold tracking-[0.14em] text-white/40 transition-colors hover:text-white/80">↻ REPLAY</button>}
    </section>
  )
}
