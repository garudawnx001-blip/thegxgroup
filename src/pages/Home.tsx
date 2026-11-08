import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CAPABILITIES, FAQS, PROCESS } from '../content/site'
import { ParticleMark } from '../components/ParticleMark'
import { Band, Button, Eyebrow, MaskText, Reveal, Section, SpotCard } from '../components/ui'
import { Faq, TwoPaths, WorkStrip } from '../components/blocks'
import { useMeta } from '../lib/seo'
import { track } from '../lib/supabase'

export default function Home() {
  useMeta('/')
  return (
    <>
      <Band tone="dark"><Hero /><Marquee /></Band>
      <Band tone="light" className="pb-14 sm:pb-20">
      <Section className="py-14 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow>WHO WE ARE</Eyebrow>
            <MaskText lines={['A technology partner,', <span className="text-mute">not a vendor.</span>]} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" />
          </div>
          <Reveal delay={0.15} className="self-end">
            <p className="text-lg leading-relaxed text-mute">THE GX GROUP helps entrepreneurs and businesses turn viable ideas into technology products — with engineering expertise and flexible commercial partnerships. <span className="text-ink">Two ways in: share the upside with us, or hire us outright.</span></p>
          </Reveal>
        </div>
      </Section>
      <TwoPaths />
      </Band>
      <Band tone="dark"><Process /></Band>
      <Band tone="light"><Capabilities /></Band>
      <Band tone="dark"><WorkStrip /></Band>
      <Band tone="light" className="pb-14"><Faq items={FAQS} /><FinalCta /></Band>
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const o = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16 sm:pt-20">
      <div aria-hidden className="hero-grid absolute inset-0" />
      <motion.div style={{ opacity: o }} className="relative min-h-[34svh] flex-1 sm:min-h-[40svh]"><div className="absolute inset-0"><ParticleMark /></div></motion.div>
      <motion.div style={{ y, opacity: o }} className="relative mx-auto w-full max-w-site px-5 pb-8 sm:px-8 sm:pb-12">
        <div className="grid items-end gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
          <div>
            <h1 className="font-display text-[clamp(2.3rem,6.4vw,5rem)] font-extrabold leading-[0.96] tracking-[-0.045em]">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-4 block text-[10px] font-semibold uppercase tracking-label text-accent sm:text-[11px]">The GX Group · Technology Partner · Bengaluru, India</motion.span>
              {['Your Vision.', 'Our Technology.', 'Shared Growth.'].map((l, i) => (
                <span key={l} className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
                  <motion.span className={`inline-block ${i === 2 ? 'text-gradient' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}>{l}</motion.span>
                </span>
              ))}
            </h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="lg:pb-2">
            <p className="max-w-md text-[15px] leading-relaxed text-mute sm:text-base">We partner with entrepreneurs and businesses to transform viable ideas into technology-driven products through product development, engineering expertise and strategic partnerships.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/partner-with-us" onClick={() => track('partner_cta_click', { where: 'hero' })}>Partner With Us</Button>
              <Button to="/technology-services" variant="ghost" onClick={() => track('service_cta_click', { where: 'hero' })}>Request Services</Button>
            </div>
          </motion.div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-line pt-5 font-display text-[10px] font-semibold tracking-label text-mute sm:mt-10 sm:text-[11px]">
          <span>BUILD <span className="text-accent">|</span> LAUNCH <span className="text-accent">|</span> SCALE</span>
          <span className="hidden sm:inline">BENGALURU · INDIA</span>
          <span className="flex items-center gap-2"><span className="scroll-dot" />SCROLL</span>
        </div>
      </motion.div>
    </section>
  )
}

function Marquee() {
  const items = ['Mobile Apps', 'Web Platforms', 'SaaS', 'AI & Automation', 'Backend & Cloud', 'Product Design', 'Equity Partnerships']
  return (
    <div className="overflow-hidden border-y border-line py-5" aria-hidden>
      <div className="marquee flex w-max gap-12 font-display text-xl font-semibold tracking-tight text-mute sm:text-2xl">
        {[...items, ...items, ...items].map((t, i) => <span key={i} className="flex items-center gap-12">{t}<span className="h-1.5 w-1.5 rotate-45 bg-accent" /></span>)}
      </div>
    </div>
  )
}

function Process() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] })
  const w = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <Section className="py-14 sm:py-20">
      <Eyebrow>HOW IT WORKS</Eyebrow>
      <MaskText lines={['Three moves.', 'One product.']} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" />
      <div ref={ref} className="relative mt-10">
        <div className="absolute left-0 right-0 top-0 hidden h-px bg-line md:block" />
        <motion.div style={{ width: w }} className="absolute left-0 top-0 hidden h-px bg-accent md:block" />
        <div className="grid gap-px md:grid-cols-3">
          {PROCESS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.12} className="relative border-l border-line py-2 pl-6 md:border-l-0 md:pl-0 md:pr-10 md:pt-10">
              <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rotate-45 border border-accent bg-bg md:-top-[5px] md:left-0" />
              <p className="font-display text-[11px] font-semibold tracking-label text-accent">0{i + 1} — {p.k}</p>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">{p.t}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-mute">{p.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Capabilities() {
  return (
    <Section className="py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>CAPABILITIES</Eyebrow>
          <MaskText lines={['Everything a product', 'needs to ship.']} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" />
        </div>
        <Link to="/capabilities" className="navlink text-sm text-mute hover:text-ink">All capabilities →</Link>
      </div>
      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08} className="bg-bg">
            <Link to={`/capabilities#${c.id}`} className="block h-full">
              <SpotCard className="group h-full border-0 bg-bg p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <span className="font-display text-[11px] font-semibold tracking-label text-mute">{c.n}</span>
                  <span className="text-mute transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent">↗</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight sm:mt-12">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{c.short}</p>
                <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-mute/70 transition-colors group-hover:text-ink/80">{c.tech.map((t) => <span key={t}>{t}</span>)}</p>
              </SpotCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function FinalCta() {
  return (
    <Section className="pt-4">
      <div className="theme-dark ambient relative overflow-hidden border border-line px-6 py-12 sm:px-14 sm:py-16">
        <div aria-hidden className="cta-slash" />
        <Eyebrow>START HERE</Eyebrow>
        <MaskText lines={['Have something', 'worth building?']} className="relative mt-5 font-display text-[clamp(2.2rem,6vw,4.8rem)] font-extrabold leading-[0.98] tracking-[-0.04em]" />
        <div className="relative mt-10 flex flex-wrap gap-3">
          <Button to="/partner-with-us" onClick={() => track('partner_cta_click', { where: 'final' })}>Apply for a Partnership</Button>
          <Button to="/technology-services" variant="ghost" onClick={() => track('service_cta_click', { where: 'final' })}>Request a Consultation</Button>
        </div>
      </div>
    </Section>
  )
}
