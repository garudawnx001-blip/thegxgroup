import { motion, useReducedMotion } from 'framer-motion'
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

/** App Store / Google Play badges for the store links in a project. */
export function StoreBadges({ links, slug, className = '' }: { links: L[]; slug: string; className?: string }) {
  const stores = links.filter((l) => isStore(l.url))
  if (!stores.length) return null
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {stores.map((l) => {
        const ios = l.url.includes('apple.com')
        return (
          <a key={l.url} href={l.url} target="_blank" rel="noopener" onClick={() => track('portfolio_outbound', { slug, to: ios ? 'app_store' : 'google_play' })}
            aria-label={ios ? 'Download on the App Store' : 'Get it on Google Play'}
            className="inline-flex h-[52px] items-center gap-3 rounded-xl border border-white/25 bg-black px-4 text-white transition-colors hover:border-white/60">
            {ios ? <Apple /> : <Play />}
            <span className="text-left leading-none"><span className="block text-[10px] tracking-wide opacity-80">{ios ? 'Download on the' : 'GET IT ON'}</span><span className="mt-1 block text-[17px] font-semibold tracking-tight">{ios ? 'App Store' : 'Google Play'}</span></span>
          </a>
        )
      })}
    </div>
  )
}

const ease = [0.22, 1, 0.36, 1] as const

/** Animated brand reveal: the mark wipes in along its own swipe direction, a light sheen passes over it, then the wordmark and tagline settle. */
export function BrandReveal({ b, links, slug }: { b: Brand; links: L[]; slug: string }) {
  const reduce = useReducedMotion()
  const accent = b.accent ?? '#25D366'
  const words = [b.first, b.second].filter(Boolean) as string[]
  let k = 0
  const mask = { WebkitMaskImage: `url(${b.mark})`, maskImage: `url(${b.mark})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' } as const
  return (
    <section aria-label={`${words.join(' ')} brand`} className="relative overflow-hidden border border-line text-white" style={{ background: b.bg ?? '#050505' }}>
      {b.font && <style>{`@font-face{font-family:GXBrand;src:url(${b.font}-800.woff2) format('woff2');font-weight:800;font-display:swap}@font-face{font-family:GXBrand;src:url(${b.font}-400.woff2) format('woff2');font-weight:400;font-display:swap}`}</style>}
      <motion.div initial={reduce ? false : 'hide'} whileInView="show" viewport={{ once: true, amount: 0.4 }}
        className="mx-auto flex max-w-3xl flex-col items-center px-6 py-14 text-center sm:py-20" style={{ fontFamily: b.font ? 'GXBrand, sans-serif' : undefined }}>
        <div className="relative w-[clamp(110px,15vw,180px)]">
          <motion.img src={b.mark} alt="" width={640} height={470} className="block w-full"
            variants={{ hide: { clipPath: 'inset(100% 100% 0% 0%)', opacity: 0, y: 14 }, show: { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, transition: { duration: 1.1, ease } } }} />
          <motion.span aria-hidden className="pointer-events-none absolute inset-0"
            style={{ ...mask, backgroundImage: 'linear-gradient(110deg,transparent 38%,rgba(255,255,255,.65) 50%,transparent 62%)', backgroundSize: '260% 100%', backgroundRepeat: 'no-repeat' }}
            variants={{ hide: { backgroundPosition: '160% 0%' }, show: { backgroundPosition: ['160% 0%', '-60% 0%'], transition: { delay: 1.15, duration: 1.3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 } } }} />
        </div>
        <h2 className="mt-8 flex flex-wrap justify-center gap-x-[0.3em] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-none tracking-[0.04em]">
          {words.map((w, wi) => (
            <span key={w} className="inline-flex overflow-hidden pb-[0.08em]" style={{ color: wi ? accent : undefined }}>
              {[...w].map((ch) => {
                const i = k++
                return <motion.span key={i} className="inline-block" variants={{ hide: { y: '0.9em', opacity: 0, filter: 'blur(6px)' }, show: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { delay: 0.6 + i * 0.045, duration: 0.7, ease } } }}>{ch}</motion.span>
              })}
            </span>
          ))}
        </h2>
        {b.tagline && <motion.p className="mt-4 text-[clamp(1rem,1.5vw,1.2rem)] text-white/65" variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { delay: 1.25, duration: 0.7, ease } } }}>{b.tagline}</motion.p>}
        <motion.div className="mt-6 h-px w-24 origin-left" style={{ background: accent }} variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: 1.35, duration: 0.8, ease } } }} />
        <motion.div variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 1.5, duration: 0.7, ease } } }}>
          <StoreBadges links={links} slug={slug} className="mt-8 justify-center" />
        </motion.div>
      </motion.div>
    </section>
  )
}
