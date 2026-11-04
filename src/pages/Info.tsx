import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { CAPABILITIES, PARTNERSHIP_POINTS, PROCESS, SITE } from '../content/site'
import { Band, Button, Eyebrow, MaskText, PageHero, Reveal, Section, SpotCard } from '../components/ui'
import { Faq, STATUS_LABEL, TwoPaths, WorkCard, usePortfolio, type Portfolio } from '../components/blocks'
import { useMeta } from '../lib/seo'
import { sb, track } from '../lib/supabase'

export function About() {
  useMeta('/about')
  const values = [
    { t: 'Ownership', d: 'We act like co-owners of what we build — because sometimes we are.' },
    { t: 'Engineering first', d: 'Production-grade code, security and performance from day one.' },
    { t: 'Plain terms', d: 'Scope, fees, equity and support are written down. No surprises.' },
  ]
  return (
    <>
      <PageHero eyebrow="ABOUT" lines={['We build with founders.', <span className="text-mute">And for businesses.</span>]}
        intro="THE GX GROUP is a technology partnership company. We bring the engineering — strategy, design, development and support — so founders can focus on customers and growth." />
      <Band tone="light" className="py-8">
      <Section className="py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.1}><SpotCard className="h-full p-8"><p className="font-display text-[11px] font-semibold tracking-label text-accent">0{i + 1}</p><h2 className="mt-8 font-display text-2xl font-bold tracking-tight">{v.t}</h2><p className="mt-3 text-mute">{v.d}</p></SpotCard></Reveal>
          ))}
        </div>
      </Section>
      <Section className="py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div><Eyebrow>OUR APPROACH</Eyebrow><MaskText lines={['Build. Launch.', 'Scale.']} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" /></div>
          <div className="space-y-6">{PROCESS.map((p) => <Reveal key={p.k}><div className="border-t border-line pt-5"><p className="font-display text-[11px] font-semibold tracking-label text-accent">{p.k}</p><p className="mt-2 text-lg">{p.d}</p></div></Reveal>)}</div>
        </div>
      </Section>
      <Section className="pb-10">
        <Reveal>
          <a href={SITE.parent.url} target="_blank" rel="noopener" className="spot group flex items-center gap-5 border border-line bg-surface p-6 sm:p-8">
            <span className="flex h-16 w-20 shrink-0 items-center justify-center bg-[#07080A]"><img src="/garudawnx-mark.webp" alt="GarudawnX logo" width={152} height={112} loading="lazy" className="h-12 w-auto" /></span>
            <span><span className="font-display text-[11px] font-semibold tracking-label text-mute">PARENT COMPANY</span><span className="mt-2 block font-display text-xl font-bold">THE GX GROUP is a venture of GarudawnX</span><span className="mt-1 block text-sm text-accent">garudawnx.com ↗</span></span>
          </a>
        </Reveal>
      </Section>
      <TwoPaths />
      </Band>
    </>
  )
}

export function Capabilities() {
  useMeta('/capabilities')
  const { hash } = useLocation()
  const [active, setActive] = useState(CAPABILITIES[0].id)
  useEffect(() => { const id = hash.replace('#', ''); if (CAPABILITIES.some((c) => c.id === id)) setActive(id) }, [hash])
  const c = CAPABILITIES.find((x) => x.id === active)!
  return (
    <>
      <PageHero eyebrow="CAPABILITIES" lines={['Six disciplines.', <span className="text-mute">One build team.</span>]} intro="Pick a capability to see what we deliver, the stack we use and where it fits." />
      <Band tone="light" className="py-10">
      <Section className="pb-12">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div role="tablist" aria-label="Capabilities" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-line lg:px-0">
            {CAPABILITIES.map((x) => (
              <button key={x.id} role="tab" id={`tab-${x.id}`} aria-selected={active === x.id} aria-controls="cap-panel" onClick={() => { setActive(x.id); history.replaceState(null, '', `#${x.id}`) }}
                className={`relative shrink-0 border border-line px-4 py-3 text-left font-display text-sm font-semibold transition-colors lg:border-0 lg:border-b lg:px-0 lg:py-5 lg:text-lg ${active === x.id ? 'text-ink' : 'text-mute hover:text-ink'}`}>
                <span className="mr-3 text-[11px] text-accent">{x.n}</span>{x.title}
                {active === x.id && <motion.span layoutId="capbar" className="absolute bottom-0 left-0 h-px w-full bg-accent lg:-bottom-px" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={c.id} id="cap-panel" role="tabpanel" aria-labelledby={`tab-${c.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
              className="blueprint relative overflow-hidden border border-line bg-surface p-7 sm:p-12">
              <p className="font-display text-[11px] font-semibold tracking-label text-accent">{c.n} / 06</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight tracking-[-0.03em]">{c.title}</h2>
              <p className="mt-3 max-w-lg text-lg text-mute">{c.short}</p>
              <div className="mt-10 grid gap-8 sm:grid-cols-3">
                <Col title="Deliverables" items={c.deliver} />
                <Col title="Technologies" items={c.tech} />
                <div><p className="font-display text-[11px] font-semibold tracking-label text-mute">USE CASES</p><p className="mt-4 text-sm leading-relaxed">{c.use}</p></div>
              </div>
              <div className="mt-12 flex flex-wrap gap-3"><Button to="/technology-services">Scope this with us</Button><Button to="/partner-with-us" variant="ghost">Partner instead</Button></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>
      {/* All capabilities in plain text for search & answer engines */}
      <Section className="py-10">
        <h2 className="font-display text-[11px] font-semibold tracking-label text-mute">AT A GLANCE</h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((x) => <div key={x.id} className="border-t border-line pt-4"><dt className="font-display font-semibold">{x.title}</dt><dd className="mt-1 text-sm text-mute">{x.short} {x.deliver.join(', ')}.</dd></div>)}
        </dl>
      </Section>
      </Band>
    </>
  )
}
const Col = ({ title, items }: { title: string; items: string[] }) => (
  <div><p className="font-display text-[11px] font-semibold tracking-label text-mute">{title.toUpperCase()}</p><ul className="mt-4 space-y-2">{items.map((i) => <li key={i} className="flex gap-2.5 text-sm"><span className="mt-[7px] h-1 w-1 rotate-45 bg-accent" />{i}</li>)}</ul></div>
)

export function PartnershipModel() {
  useMeta('/partnership-model')
  const faqs = [
    { q: 'Do you publish a fixed equity percentage?', a: 'No. Equity is negotiated individually based on the venture, scope, risk and the reduced fee.' },
    { q: 'Does applying guarantee a partnership?', a: 'No. Applications are evaluated selectively. Any partnership is created only by a signed legal agreement, never by this website.' },
    { q: 'What happens after I apply?', a: 'We review your application, may shortlist it, contact you for a meeting and, if there is a fit, send a written proposal.' },
  ]
  return (
    <>
      <PageHero eyebrow="PARTNERSHIP MODEL" lines={['Reduced fee.', <span className="text-gradient">Shared upside.</span>]} intro="For selected ventures, we invest engineering effort alongside founders — lowering our fee in exchange for negotiated equity." />
      <Band tone="light" className="py-10">
      <Section className="py-8">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERSHIP_POINTS.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 0.08} className="bg-bg p-7 sm:p-9"><p className="font-display text-[11px] font-semibold tracking-label text-accent">0{i + 1}</p><h2 className="mt-8 font-display text-xl font-bold tracking-tight">{p.t}</h2><p className="mt-2 text-sm leading-relaxed text-mute">{p.d}</p></Reveal>
          ))}
        </div>
        <Reveal><p className="mt-6 text-xs leading-relaxed text-mute">This page describes how we typically structure partnerships. It is not an offer. Any equity arrangement requires a separate written agreement reviewed under Indian law, including valuation, issuance and shareholder approvals.</p></Reveal>
      </Section>
      <Faq items={faqs} title={['Before', 'you apply.']} />
      <Section><div className="flex flex-wrap gap-3"><Button to="/partner-with-us" onClick={() => track('partner_cta_click', { where: 'model' })}>Apply for a Partnership</Button><Button to="/technology-services" variant="ghost">Prefer paid development?</Button></div></Section>
      </Band>
    </>
  )
}

export function Work() {
  useMeta('/work')
  const rows = usePortfolio()
  return (
    <>
      <PageHero eyebrow="OUR WORK" lines={['Selected work.', <span className="text-mute">Real status only.</span>]} intro="Internal products, client work and prototypes — each clearly labelled." />
      <Band tone="light" className="py-10">
      <Section className="pb-12">
        {rows === null ? <div className="h-64 animate-pulse border border-line bg-surface" /> : rows.length ? (
          <div className="grid gap-12 md:grid-cols-2">{rows.map((p, i) => <WorkCard key={p.id} p={p} i={i} />)}</div>
        ) : (
          <div className="blueprint border border-line px-6 py-20 text-center"><p className="font-display text-[11px] font-semibold tracking-label text-accent">CASE STUDIES IN PREPARATION</p><p className="mx-auto mt-4 max-w-md text-mute">We publish only verified projects. Check back soon, or ask us about our work directly.</p><div className="mt-8 flex justify-center"><Button to="/contact" variant="ghost">Ask about our work</Button></div></div>
        )}
      </Section>
      </Band>
    </>
  )
}

export function WorkDetail() {
  const { slug } = useParams()
  const [p, setP] = useState<Portfolio | null | undefined>(undefined)
  useEffect(() => { sb().from('portfolio_projects').select('*').eq('slug', slug!).eq('published', true).maybeSingle().then(({ data }) => setP(data as Portfolio | null)) }, [slug])
  useMeta(`/work/${slug}`, p ? { title: `${p.name} — ${p.category} | THE GX GROUP`, description: p.description.slice(0, 155) } : undefined)
  if (p === undefined) return <Section className="pt-44"><div className="h-64 animate-pulse bg-surface" /></Section>
  if (!p) return <NotFound />
  return (
    <>
      <PageHero eyebrow={`${p.category.toUpperCase()} · ${(STATUS_LABEL[p.status] ?? p.status).toUpperCase()}`} lines={[p.name]} intro={p.description} />
      <Section className="pb-12">
        {p.images?.[0] && <Reveal><img src={p.images[0]} alt={p.name} className="w-full border border-line" /></Reveal>}
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {p.challenge && <Block t="Challenge" d={p.challenge} />}
          {p.solution && <Block t="Solution" d={p.solution} />}
          <div className="border-t border-line pt-5"><p className="font-display text-[11px] font-semibold tracking-label text-accent">TECHNOLOGY</p><p className="mt-3 flex flex-wrap gap-2">{p.technology?.map((t) => <span key={t} className="border border-line px-2.5 py-1 text-xs">{t}</span>)}</p>
            <p className="mt-5 text-sm text-mute">{p.ownership === 'client' ? 'Client project' : 'Internal product'}</p>
            {p.link && <a href={p.link} target="_blank" rel="noopener" className="mt-4 inline-block text-sm text-accent">Visit live →</a>}</div>
        </div>
        {p.images?.slice(1).map((src) => <img key={src} src={src} alt={p.name} loading="lazy" className="mt-6 w-full border border-line" />)}
        <div className="mt-16"><Link to="/work" className="navlink text-sm text-mute">← All work</Link></div>
      </Section>
    </>
  )
}
const Block = ({ t, d }: { t: string; d: string }) => <div className="border-t border-line pt-5"><p className="font-display text-[11px] font-semibold tracking-label text-accent">{t.toUpperCase()}</p><p className="mt-3 leading-relaxed text-mute">{d}</p></div>

export function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  useMeta(kind === 'privacy' ? '/privacy-policy' : '/terms')
  const P = kind === 'privacy' ? [
    ['What we collect', 'Information you submit in our forms: name, contact details, business and project information, and any documents you upload. We also collect basic analytics (pages visited, device type) if you accept analytics.'],
    ['Why we collect it', 'To evaluate partnership applications, respond to project enquiries and general messages, and to improve this website.'],
    ['Storage & security', 'Submissions are stored in a secured database with row-level access controls. Uploaded documents are kept in private storage accessible only to authorised administrators.'],
    ['Retention', 'Applications and enquiries are kept for up to 24 months after last contact, unless a project or partnership agreement requires longer. You can request deletion earlier.'],
    ['Sharing', 'We do not sell your information. We share it only with service providers that host or operate this website, under confidentiality obligations, or where required by law.'],
    ['Your rights', `You may request access, correction or deletion of your information by emailing ${SITE.email}. This policy is designed with India’s Digital Personal Data Protection Act, 2023 in mind.`],
    ['Cookies & analytics', 'We use essential storage for site functionality and, if enabled, Google Analytics 4 to understand usage in aggregate.'],
  ] : [
    ['Use of this website', 'This website provides information about THE GX GROUP. You agree not to misuse it, attempt unauthorised access or submit false information.'],
    ['Enquiries are not agreements', 'Submitting a partnership application or service enquiry does not create a contract, partnership, equity right or obligation for either party. Any engagement is governed only by a separate signed agreement.'],
    ['Partnership applications', 'Applications are evaluated selectively and may be declined without reasons. No fixed equity percentage, fee or outcome is promised.'],
    ['Paid-service enquiries', 'Quotations are indicative until a signed statement of work defines scope, fees, milestones and support.'],
    ['Your materials', 'You keep ownership of ideas and documents you submit. We use them only to evaluate your enquiry and treat them as confidential.'],
    ['Liability', 'Website content is provided as is. To the extent permitted by law, we are not liable for decisions made solely on the basis of this website.'],
    ['Governing law', 'These terms are governed by the laws of India, with courts in Bengaluru, Karnataka having jurisdiction.'],
  ]
  return (
    <>
      <PageHero eyebrow="LEGAL" lines={[kind === 'privacy' ? 'Privacy Policy' : 'Terms of Use']} intro={`Last updated ${new Date('2026-11-04').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`} />
      <Band tone="light" className="py-10"><Section className="pb-12"><div className="max-w-3xl space-y-10">{P.map(([t, d]) => <div key={t} className="border-t border-line pt-6"><h2 className="font-display text-xl font-bold">{t}</h2><p className="mt-3 leading-relaxed text-mute">{d}</p></div>)}</div></Section></Band>
    </>
  )
}

export function NotFound() {
  useMeta('/404', { title: 'Page not found | THE GX GROUP', description: 'This page does not exist.' })
  return (
    <Section className="flex min-h-[80svh] flex-col justify-center pt-24">
      <p className="font-display text-[11px] font-semibold tracking-label text-accent">ERROR 404</p>
      <MaskText as="h1" lines={['Nothing built', 'here yet.']} className="mt-5 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]" />
      <div className="mt-10"><Button to="/">Back home</Button></div>
    </Section>
  )
}
