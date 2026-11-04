import { motion } from 'framer-motion'

// Exact pieces cut from the supplied logo. Coordinates are in source pixels of the 1619×479 logo box.
const W = 1619, H = 479
const P = {
  bar: { x: 0, y: 1, w: 15, h: 366 },
  the: { x: 124, y: 0, w: 385, h: 114 },
  gx: { x: 105, y: 156, w: 508, h: 205 },
  blue: { x: 481, y: 157, w: 131, h: 102 },
  group: { x: 670, y: 153, w: 949, h: 196 },
  tagline: { x: 114, y: 415, w: 1437, h: 64 },
}
const box = (p: { x: number; y: number; w: number; h: number }) => ({
  left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, width: `${(p.w / W) * 100}%`, height: `${(p.h / H) * 100}%`,
})
const ease = [0.76, 0, 0.24, 1] as const

/** Animated brand-kit logo: BUILD (scan-constructs the mark) → LAUNCH (blue slash fires in) → SCALE (wordmark + tagline). */
export function BrandLogo({ play = true, className = '', delay = 0 }: { play?: boolean; className?: string; delay?: number }) {
  const d = (s: number) => delay + s
  const init = play ? 'hidden' : 'show'
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${W}/${H}` }} role="img" aria-label="THE GX GROUP — Build, Launch, Scale">
      {/* BAR */}
      <motion.img src="/brand/bar.svg" alt="" draggable={false} className="absolute origin-top" style={box(P.bar)}
        initial={init} animate="show" variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.6, ease, delay: d(1.45) } } }} />
      {/* THE */}
      <div className="absolute overflow-hidden" style={box(P.the)}>
        <motion.img src="/brand/the.svg" alt="" draggable={false} className="h-full w-full"
          initial={init} animate="show" variants={{ hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.7, ease, delay: d(1.55) } } }} />
      </div>
      {/* blueprint outline of the mark, drawn before it is filled */}
      {play && (
        <motion.img src="/brand/gx-outline.svg" alt="" aria-hidden draggable={false} className="absolute" style={box(P.gx)}
          initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: [0, 0.55, 0.55, 0], clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)', 'inset(0 0 0% 0)', 'inset(0 0 0% 0)'] }}
          transition={{ duration: 1.4, times: [0, 0.3, 0.75, 1], delay: d(0) }} />
      )}
      {/* GX white — constructed by a scan line */}
      <motion.div className="absolute" style={box(P.gx)}
        initial={init} animate="show"
        variants={{ hidden: { clipPath: 'inset(0 100% 0 0)' }, show: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.85, ease: [0.65, 0, 0.35, 1], delay: d(0.25) } } }}>
        <img src="/brand/gx-white.svg" alt="" draggable={false} className="h-full w-full" />
      </motion.div>
      {play && (
        <motion.span aria-hidden className="absolute top-[30%] h-[46%] w-px bg-accent"
          style={{ boxShadow: '0 0 12px 1px rgba(8,124,245,.7)' }}
          initial={{ left: `${(P.gx.x / W) * 100}%`, opacity: 0 }}
          animate={{ left: `${((P.gx.x + P.gx.w) / W) * 100}%`, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1], delay: d(0.25) }} />
      )}
      {/* BLUE slash — launch */}
      {play && (
        <motion.span aria-hidden className="absolute origin-right"
          style={{ ...box(P.blue), background: 'linear-gradient(225deg, rgba(8,124,245,.0), rgba(8,124,245,.55) 60%, rgba(8,124,245,0))', clipPath: 'polygon(78% 0, 100% 0, 22% 100%, 0 100%)', filter: 'blur(2px)' }}
          initial={{ opacity: 0, x: '-260%', y: '260%' }}
          animate={{ opacity: [0, 0.9, 0], x: ['-260%', '0%', '0%'], y: ['260%', '0%', '0%'] }}
          transition={{ duration: 0.5, times: [0, 0.75, 1], ease: 'easeIn', delay: d(1.0) }} />
      )}
      <motion.img src="/brand/gx-blue.svg" alt="" draggable={false} className="absolute" style={box(P.blue)}
        initial={init} animate="show"
        variants={{ hidden: { x: '-260%', y: '260%', opacity: 0, filter: 'blur(6px)' }, show: { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.5, 0, 0.1, 1], delay: d(1.05) } } }} />
      {play && (
        <motion.span aria-hidden className="absolute rounded-full border border-accent"
          style={{ left: `${((P.blue.x + P.blue.w * 0.5) / W) * 100}%`, top: `${((P.blue.y + P.blue.h * 0.5) / H) * 100}%`, width: 8, height: 8, translate: '-50% -50%' }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 14], opacity: [0.8, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: d(1.42) }} />
      )}
      {/* GROUP */}
      <div className="absolute overflow-hidden" style={box(P.group)}>
        <motion.img src="/brand/group.svg" alt="" draggable={false} className="h-full w-full"
          initial={init} animate="show" variants={{ hidden: { x: '-104%' }, show: { x: 0, transition: { duration: 0.8, ease, delay: d(1.5) } } }} />
      </div>
      {/* TAGLINE */}
      <motion.div className="absolute" style={box(P.tagline)} initial={init} animate="show"
        variants={{ hidden: { clipPath: 'inset(0 50% 0 50%)', opacity: 0 }, show: { clipPath: 'inset(0 0% 0 0%)', opacity: 1, transition: { duration: 0.8, ease, delay: d(1.85) } } }}>
        <img src="/brand/tagline.svg" alt="" draggable={false} className="h-full w-full" />
      </motion.div>
    </div>
  )
}
