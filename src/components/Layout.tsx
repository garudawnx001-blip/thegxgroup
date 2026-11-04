import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
const useLayoutEffectSafe = typeof window === 'undefined' ? useEffect : useLayoutEffect
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SITE } from '../content/site'
import { track } from '../lib/supabase'

const NAV = [
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/partnership-model', label: 'Partnership' },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24); f()
    window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : '' }, [open])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? 'border-b border-line/80 bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-site items-center justify-between px-5 sm:h-20 sm:px-8">
          <Link to="/" aria-label="THE GX GROUP home" className="relative z-10 block">
            <img src="/brand/logo.svg" alt="THE GX GROUP" width={1619} height={479} className="h-8 w-auto sm:h-9" />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `navlink text-[13px] font-medium tracking-wide ${isActive ? 'text-ink is-active' : 'text-mute hover:text-ink'}`}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/technology-services" onClick={() => track('service_cta_click', { where: 'header' })} className="px-3 py-2 text-[13px] font-medium text-mute hover:text-ink">Hire us</Link>
            <Link to="/partner-with-us" onClick={() => track('partner_cta_click', { where: 'header' })} className="bg-ink px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-accent hover:text-ink">Partner with us</Link>
          </div>
          <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="relative z-10 flex h-11 w-11 items-center justify-center lg:hidden">
            <span className={`absolute h-px w-6 bg-ink transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
            <span className={`absolute h-px w-6 bg-ink transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 flex flex-col bg-bg px-5 pb-8 pt-24 lg:hidden" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
            <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1">
              {[{ to: '/', label: 'Home' }, ...NAV].map((n, i) => (
                <motion.div key={n.to} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}>
                  <NavLink to={n.to} className={({ isActive }) => `flex items-baseline gap-4 border-b border-line py-4 font-display text-3xl font-semibold tracking-tight ${isActive ? 'text-ink' : 'text-mute'}`}>
                    <span className="text-[11px] text-accent">0{i + 1}</span>{n.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/partner-with-us" className="bg-ink py-4 text-center font-display text-[12px] font-bold uppercase tracking-[0.14em] text-bg">Partner</Link>
              <Link to="/technology-services" className="border border-line py-4 text-center font-display text-[12px] font-bold uppercase tracking-[0.14em]">Hire us</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto grid max-w-site gap-12 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img src="/brand/logo.svg" alt="THE GX GROUP" width={1619} height={479} loading="lazy" className="h-12 w-auto" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mute">Technology partnership company. We build products with founders — and for businesses.</p>
        </div>
        <FooterCol title="Work with us" links={[['Partner with us', '/partner-with-us'], ['Technology services', '/technology-services'], ['Partnership model', '/partnership-model']]} />
        <FooterCol title="Company" links={[['Capabilities', '/capabilities'], ['Our work', '/work'], ['About', '/about'], ['Contact', '/contact']]} />
        <div>
          <p className="font-display text-[11px] font-semibold tracking-label text-mute">REACH US</p>
          <a href={`mailto:${SITE.email}`} className="mt-5 block text-sm hover:text-accent">{SITE.email}</a>
          <a href={`tel:${SITE.phoneHref}`} className="mt-2 block text-sm hover:text-accent">{SITE.phone} <span className="text-mute">· Call / WhatsApp</span></a>
          <a href={`tel:${SITE.phone2Href}`} className="mt-1 block text-sm hover:text-accent">{SITE.phone2}</a>
          <a href={SITE.whatsapp} target="_blank" rel="noopener" className="mt-2 block text-sm text-accent">WhatsApp us ↗</a>
          <p className="mt-2 text-sm text-mute">{SITE.location}</p>
        </div>
      </div>
      <a href={SITE.parent.url} target="_blank" rel="noopener" aria-label="GarudawnX — garudawnx.com" className="group mx-auto flex max-w-site items-center gap-4 border-t border-line px-5 py-6 sm:px-8">
        <img src="/garudawnx-mark.webp" alt="GarudawnX logo" width={152} height={112} loading="lazy" className="h-10 w-auto transition-transform duration-500 group-hover:-translate-y-0.5" />
        <span className="text-sm leading-snug text-mute">A <span className="font-display font-semibold text-[#E8B53A]">GarudawnX</span> company<span className="block text-xs text-mute/80 transition-colors group-hover:text-ink">garudawnx.com ↗</span></span>
      </a>
      <div className="mx-auto flex max-w-site flex-col gap-3 border-t border-line px-5 py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} THE GX GROUP. All rights reserved.</p>
        <div className="flex gap-6"><Link to="/privacy-policy" className="hover:text-ink">Privacy</Link><Link to="/terms" className="hover:text-ink">Terms</Link></div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap px-5 pb-4 text-center font-display text-[8.4vw] font-extrabold leading-none tracking-[-0.05em] text-surface sm:px-8 xl:text-[7.6rem]">BUILD · LAUNCH · SCALE</p>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="font-display text-[11px] font-semibold tracking-label text-mute">{title.toUpperCase()}</p>
      <ul className="mt-5 space-y-3">{links.map(([l, h]) => <li key={h}><Link to={h} className="text-sm hover:text-accent">{l}</Link></li>)}</ul>
    </div>
  )
}

/** Route transition: a thin accent wipe + fade. */
export function PageShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useLayoutEffectSafe(() => {
    const w = window as unknown as { __lenis?: { scrollTo: (y: number, o: { immediate: boolean; force: boolean }) => void } }
    w.__lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return (
    <motion.main id="main" key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.span aria-hidden className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-accent" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
      {children}
    </motion.main>
  )
}
