import { Link } from 'react-router-dom'
import { LANDINGS, type Landing as L } from '../content/landings'
import { PROCESS, SITE } from '../content/site'
import { Band, Button, Eyebrow, MaskText, PageHero, Reveal, Section } from '../components/ui'
import { Faq } from '../components/blocks'
import { useMeta } from '../lib/seo'
import { track } from '../lib/supabase'

/** One search-intent page: a direct answer first, then what you get, how it works, a comparison and FAQs. */
export default function Landing({ l }: { l: L }) {
  useMeta(l.path)
  const others = LANDINGS.filter((x) => x.path !== l.path)
  return (
    <>
      <PageHero eyebrow={l.eyebrow} lines={[l.h1[0], <span className="text-gradient">{l.h1[1]}</span>]} intro={l.answer} />
      <Band tone="light" className="py-10">
        <Section className="py-8">
          <Eyebrow>WHAT YOU GET</Eyebrow>
          <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {l.points.map((p, i) => (
              <Reveal key={p.t} delay={(i % 3) * 0.08} className="bg-bg p-7 sm:p-9">
                <p className="font-display text-[11px] font-semibold tracking-label text-accent">0{i + 1}</p>
                <h2 className="mt-8 font-display text-xl font-bold tracking-tight">{p.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-mute">{p.d}</p>
              </Reveal>
            ))}
          </div>
        </Section>
        {l.table && (
          <Section className="py-8">
            <Eyebrow>COMPARE</Eyebrow>
            <Reveal>
              <div className="mt-6 overflow-x-auto border border-line">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead><tr>{l.table.head.map((h, i) => <th key={i} scope="col" className="border-b border-line bg-surface px-5 py-4 font-display text-[11px] font-semibold tracking-label text-mute">{h.toUpperCase()}</th>)}</tr></thead>
                  <tbody>{l.table.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => i === 0 ? <th key={i} scope="row" className="border-b border-line px-5 py-4 font-display font-semibold">{c}</th> : <td key={i} className="border-b border-line px-5 py-4 text-mute">{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </Reveal>
          </Section>
        )}
        <Section className="py-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div><Eyebrow>HOW IT WORKS</Eyebrow><MaskText lines={['Build. Launch.', 'Scale.']} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" /></div>
            <div className="space-y-6">{PROCESS.map((p) => <Reveal key={p.k}><div className="border-t border-line pt-5"><p className="font-display text-[11px] font-semibold tracking-label text-accent">{p.k}</p><p className="mt-2 text-lg">{p.d}</p></div></Reveal>)}</div>
          </div>
        </Section>
        <Faq items={l.faqs} />
        <Section className="pb-6">
          <div className="flex flex-wrap gap-3">
            {l.cta === 'partner'
              ? <><Button to="/partner-with-us" onClick={() => track('partner_cta_click', { where: l.path })}>Pitch Your Idea</Button><Button to="/technology-services" variant="ghost">Prefer paid development?</Button></>
              : <><Button to="/technology-services" onClick={() => track('services_cta_click', { where: l.path })}>Request a Quotation</Button><Button to="/partner-with-us" variant="ghost">Founder? Apply for a partnership</Button></>}
            <Button href={SITE.instagram} variant="ghost">Instagram @thegxgroup ↗</Button>
          </div>
        </Section>
        <Section className="py-8">
          <Eyebrow>MORE FROM THE GX GROUP</Eyebrow>
          <nav aria-label="Related pages" className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {others.map((o) => <Link key={o.path} to={o.path} className="text-mute underline decoration-line underline-offset-4 hover:text-accent">{o.short}</Link>)}
          </nav>
        </Section>
      </Band>
    </>
  )
}
