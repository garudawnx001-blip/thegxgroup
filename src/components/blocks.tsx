import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, track } from '../lib/supabase'
import { Button, Eyebrow, MaskText, Reveal, Section, SpotCard } from './ui'

const PATHS = [
  { n: '01', k: 'PARTNER WITH US', t: 'Technology + equity partnership', who: 'For founders, startups and businesses ready to share the upside.', pts: ['Reduced development fee', 'Negotiated equity participation', 'Full product development', 'Agreed ongoing technical support'], cta: 'Apply for a Partnership', to: '/partner-with-us', ev: 'partner_cta_click' },
  { n: '02', k: 'TECHNOLOGY SERVICES', t: 'Paid product development', who: 'For businesses that want to hire an experienced build team.', pts: ['Clearly scoped development', 'Commercial project quotation', 'Agreed delivery milestones', 'Separate maintenance agreement'], cta: 'Request a Consultation', to: '/technology-services', ev: 'service_cta_click' },
]

export function TwoPaths() {
  return (
    <Section className="py-8">
      <Eyebrow>TWO WAYS TO WORK WITH US</Eyebrow>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {PATHS.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.1}>
            <SpotCard className="group flex h-full flex-col p-7 sm:p-10">
              <div className="flex items-center justify-between font-display text-[11px] font-semibold tracking-label">
                <span className="text-accent">PATH {p.n}</span><span className="text-mute">{p.k}</span>
              </div>
              <h3 className="mt-6 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-tight tracking-[-0.02em]">{p.t}</h3>
              <p className="mt-3 text-mute">{p.who}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {p.pts.map((x) => <li key={x} className="flex gap-3 text-sm"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />{x}</li>)}
              </ul>
              <div className="mt-auto pt-8"><Button to={p.to} variant={i === 0 ? 'primary' : 'ghost'} onClick={() => track(p.ev, { where: 'paths' })}>{p.cta}</Button></div>
            </SpotCard>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Faq({ items, title = ['Questions,', 'answered.'] }: { items: { q: string; a: string }[]; title?: string[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Section className="py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <MaskText lines={title} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" />
        </div>
        <div className="border-t border-line">
          {items.map((f, i) => (
            <div key={f.q} className="border-b border-line">
              <h3>
                <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-lg font-semibold tracking-tight">
                  {f.q}
                  <span className={`relative h-4 w-4 shrink-0 transition-transform duration-500 ${open === i ? 'rotate-[135deg]' : ''}`}><span className="absolute left-0 top-1/2 h-px w-4 bg-accent" /><span className="absolute left-1/2 top-0 h-4 w-px bg-accent" /></span>
                </button>
              </h3>
              {/* answer stays in the DOM for crawlers & answer engines */}
              <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <p className="max-w-2xl pb-6 leading-relaxed text-mute">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

export type Portfolio = { id: string; slug: string; name: string; category: string; ownership: string; status: string; description: string; challenge: string | null; solution: string | null; technology: string[]; images: string[]; link: string | null; client?: string | null; services?: string[]; features?: string[]; links?: { label: string; url: string }[]; brand?: Brand | null }
export type Brand = { mark: string; first: string; second?: string; tagline?: string; accent?: string; bg?: string; font?: string }
/** Published portfolio baked into each pre-rendered page (SEO + no loading flash); refreshed from the database after load. */
export const preloadedPortfolio = () => (globalThis as { __GX_PF?: Portfolio[] }).__GX_PF
export const STATUS_LABEL: Record<string, string> = { live: 'Live', in_development: 'In development', prototype: 'Prototype' }

export function usePortfolio() {
  const [rows, setRows] = useState<Portfolio[] | null>(preloadedPortfolio() ?? null)
  useEffect(() => {
    db().then((c) => c.from('portfolio_projects').select('*').eq('published', true).order('sort_order')).then(({ data, error }) => { if (!error) setRows((data as Portfolio[]) ?? []) })
  }, [])
  return rows
}

export function WorkCard({ p, i = 0 }: { p: Portfolio; i?: number }) {
  return (
    <Reveal delay={(i % 2) * 0.1}>
      <Link to={`/work/${p.slug}`} onClick={() => track('portfolio_view', { slug: p.slug })} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden border border-line bg-surface">
          {p.images?.[0] ? <img src={p.images[0]} alt={`${p.name} — ${p.category}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
            : <div className="blueprint flex h-full items-center justify-center font-display text-4xl font-extrabold tracking-tight text-line">{p.name}</div>}
          <span className="absolute left-4 top-4 bg-bg/80 px-2.5 py-1 font-display text-[10px] font-semibold tracking-label backdrop-blur">{(STATUS_LABEL[p.status] ?? p.status).toUpperCase()}</span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div><h3 className="font-display text-xl font-bold tracking-tight">{p.name}</h3><p className="mt-1 text-sm text-mute">{p.category} · {p.ownership === 'client' ? 'Client work' : 'Internal product'}</p></div>
          <span className="text-mute transition-colors group-hover:text-accent">↗</span>
        </div>
      </Link>
    </Reveal>
  )
}

export function WorkStrip() {
  const rows = usePortfolio()
  return (
    <Section className="py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><Eyebrow>SELECTED WORK</Eyebrow><MaskText lines={['Real products.', <span className="text-mute">Honest status.</span>]} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" /></div>
        <Link to="/work" className="navlink text-sm text-mute hover:text-ink">View all work →</Link>
      </div>
      <AnimatePresence mode="wait">
        {rows && rows.length > 0 ? (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 grid gap-10 md:grid-cols-2">{rows.slice(0, 4).map((p, i) => <WorkCard key={p.id} p={p} i={i} />)}</motion.div>
        ) : rows ? (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="blueprint mt-12 border border-line px-6 py-16 text-center sm:py-24">
            <p className="font-display text-[11px] font-semibold tracking-label text-accent">CASE STUDIES IN PREPARATION</p>
            <p className="mx-auto mt-4 max-w-md text-mute">We only publish verified projects with accurate status. Detailed case studies are being prepared.</p>
          </motion.div>
        ) : <div className="mt-12 h-48 animate-pulse border border-line bg-surface" />}
      </AnimatePresence>
    </Section>
  )
}
