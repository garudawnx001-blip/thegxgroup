import { motion, useMotionValue, useSpring } from 'framer-motion'
import { type ReactNode, useRef } from 'react'
import { Link } from 'react-router-dom'

const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({ children, delay = 0, className = '', y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, ease, delay }}>
      {children}
    </motion.div>
  )
}

/** Headline that rises line-by-line from a mask. */
export function MaskText({ lines, className = '', delay = 0, as: Tag = 'h2' }: { lines: ReactNode[]; className?: string; delay?: number; as?: 'h1' | 'h2' | 'h3' }) {
  const M = motion[Tag]
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -40px 0px' }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" variants={{ hidden: { y: '105%' }, show: { y: 0, transition: { duration: 0.9, ease, delay: delay + i * 0.09 } } }}>{l}</motion.span>
        </span>
      ))}
    </M>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`flex items-center gap-3 font-display text-[11px] font-semibold tracking-label text-mute ${className}`}><span className="h-px w-6 bg-accent" />{children}</p>
}

type BtnProps = { to?: string; href?: string; onClick?: () => void; children: ReactNode; variant?: 'primary' | 'ghost'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }
export function Button({ to, href, onClick, children, variant = 'primary', className = '', type = 'button', disabled }: BtnProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 }); const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 })
  const move = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') return; const r = ref.current!.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.18); y.set((e.clientY - r.top - r.height / 2) * 0.25) }
  const reset = () => { x.set(0); y.set(0) }
  const base = 'group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden px-6 font-display text-[13px] font-semibold tracking-[0.12em] uppercase transition-colors duration-300 disabled:opacity-50'
  const look = variant === 'primary' ? 'bg-ink text-bg' : 'border border-line text-ink hover:border-ink/60'
  const inner = (
    <>
      {variant === 'primary' && <span className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-100" />}
      <span className={`relative z-10 ${variant === 'primary' ? 'group-hover:text-ink' : ''} transition-colors duration-300`}>{children}</span>
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" aria-hidden>→</span>
    </>
  )
  const cls = `${base} ${look} ${className}`
  return (
    <motion.span ref={ref} style={{ x, y }} onPointerMove={move} onPointerLeave={reset} className="inline-block">
      {to ? <Link to={to} onClick={onClick} className={cls}>{inner}</Link>
        : href ? <a href={href} onClick={onClick} className={cls}>{inner}</a>
        : <button type={type} onClick={onClick} disabled={disabled} className={cls}>{inner}</button>}
    </motion.span>
  )
}

export function Section({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`mx-auto w-full max-w-site px-5 sm:px-8 ${className}`}>{children}</section>
}

/** Card with a cursor-following spotlight border. */
export function SpotCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`); ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`) }
  return <div ref={ref} onPointerMove={move} className={`spot relative border border-line bg-surface ${className}`}>{children}</div>
}

export function Band({ tone, children, className = '' }: { tone: 'light' | 'dark'; children: ReactNode; className?: string }) {
  return <div className={`theme-${tone} ${tone === 'dark' ? 'ambient' : ''} ${className}`}>{children}</div>
}

export function PageHero({ eyebrow, lines, intro }: { eyebrow: string; lines: ReactNode[]; intro?: ReactNode }) {
  return (
    <div className="theme-dark ambient overflow-hidden"><div aria-hidden className="hero-grid absolute inset-0 -z-10" />
    <Section className="pb-10 pt-28 sm:pb-14 sm:pt-36">
      <Eyebrow>{eyebrow}</Eyebrow>
      <MaskText as="h1" lines={lines} className="mt-6 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em]" />
      {intro && <Reveal delay={0.3}><p className="mt-7 max-w-xl text-base leading-relaxed text-mute sm:text-lg">{intro}</p></Reveal>}
    </Section></div>
  )
}
