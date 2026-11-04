import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_TYPES, SITE } from '../content/site'
import { Band, Button, Eyebrow, PageHero, Section } from '../components/ui'
import { useMeta } from '../lib/seo'
import { sb, track, uploadFiles } from '../lib/supabase'

type Vals = Record<string, string>
const MAX = 10 * 1024 * 1024
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.doc,.docx'

// ---------- primitives ----------
function Field({ label, name, v, set, err, type = 'text', req, area, hint, opts, auto }: { label: string; name: string; v: Vals; set: (n: string, x: string) => void; err?: string; type?: string; req?: boolean; area?: boolean; hint?: string; opts?: string[]; auto?: string }) {
  const id = `f-${name}`
  const cls = `peer w-full border-b bg-transparent pb-3 pt-6 text-[16px] outline-none transition-colors placeholder:text-transparent focus:border-accent ${err ? 'border-red-500' : 'border-line'}`
  return (
    <div className="relative">
      {opts ? (
        <select id={id} value={v[name] ?? ''} onChange={(e) => set(name, e.target.value)} className={`${cls} appearance-none [&>option]:bg-elev`} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined}>
          <option value="" disabled>Select</option>{opts.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : area ? (
        <textarea id={id} rows={3} value={v[name] ?? ''} onChange={(e) => set(name, e.target.value)} placeholder={label} className={`${cls} resize-none`} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} />
      ) : (
        <input id={id} type={type} autoComplete={auto} value={v[name] ?? ''} onChange={(e) => set(name, e.target.value)} placeholder={label} className={cls} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} />
      )}
      <label htmlFor={id} className={`pointer-events-none absolute left-0 transition-all duration-200 ${opts || v[name] ? 'top-0 text-[11px] tracking-wider text-mute' : 'top-6 text-[15px] text-mute peer-focus:top-0 peer-focus:text-[11px] peer-focus:tracking-wider'}`}>
        {label}{req && <span className="text-accent"> *</span>}
      </label>
      {opts && <span aria-hidden className="pointer-events-none absolute right-0 top-7 text-mute">▾</span>}
      {err ? <p id={`${id}-e`} className="mt-2 text-xs text-red-500">{err}</p> : hint ? <p className="mt-2 text-xs text-mute">{hint}</p> : null}
    </div>
  )
}

function Files({ files, setFiles, label }: { files: File[]; setFiles: (f: File[]) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null); const [e, setE] = useState('')
  const add = (list: FileList | null) => {
    if (!list) return; const next = [...files]
    for (const f of Array.from(list)) {
      if (f.size > MAX) { setE(`${f.name} is over 10 MB`); continue }
      if (!/\.(pdf|png|jpe?g|webp|pptx?|docx?)$/i.test(f.name)) { setE(`${f.name}: unsupported type`); continue }
      if (next.length < 6) next.push(f)
    }
    setFiles(next)
  }
  return (
    <div>
      <button type="button" onClick={() => ref.current?.click()} onDragOver={(ev) => ev.preventDefault()} onDrop={(ev) => { ev.preventDefault(); add(ev.dataTransfer.files) }}
        className="blueprint flex w-full flex-col items-center justify-center gap-2 border border-dashed border-line px-4 py-8 text-center transition-colors hover:border-accent">
        <span className="font-display text-sm font-semibold">{label}</span>
        <span className="text-xs text-mute">PDF, image, PPT or DOC · up to 10 MB each · max 6</span>
      </button>
      <input ref={ref} type="file" multiple accept={ACCEPT} className="hidden" onChange={(ev) => { add(ev.target.files); ev.target.value = '' }} />
      {e && <p className="mt-2 text-xs text-red-500">{e}</p>}
      {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((f, i) => <li key={i} className="flex items-center justify-between border border-line px-3 py-2 text-sm"><span className="truncate">{f.name}</span><button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="ml-3 text-mute hover:text-ink" aria-label={`Remove ${f.name}`}>✕</button></li>)}</ul>}
    </div>
  )
}

function Consent({ v, set, err, kind }: { v: Vals; set: (n: string, x: string) => void; err?: string; kind: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-mute">
      <input type="checkbox" checked={v.consent === 'true'} onChange={(e) => set('consent', String(e.target.checked))} className="mt-0.5 h-5 w-5 shrink-0 accent-[#087CF5]" />
      <span>I agree that THE GX GROUP may store and use this information to evaluate my {kind}, as described in the <Link to="/privacy-policy" className="text-ink underline">Privacy Policy</Link>. Submitting does not create any agreement.{err && <span className="block text-red-500">{err}</span>}</span>
    </label>
  )
}
const Honeypot = ({ v, set }: { v: Vals; set: (n: string, x: string) => void }) => (
  <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website_url_hp ?? ''} onChange={(e) => set('website_url_hp', e.target.value)} /></label></div>
)

const emailOk = (s = '') => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim())
const phoneOk = (s = '') => /^\d{8,15}$/.test(s.replace(/\D/g, ''))

function check(v: Vals, req: string[]) {
  const e: Vals = {}
  for (const k of req) if (!(v[k] ?? '').trim()) e[k] = 'Required'
  if (req.includes('email') && v.email && !emailOk(v.email)) e.email = 'Enter a valid email'
  if (req.includes('phone') && v.phone && !phoneOk(v.phone)) e.phone = 'Enter a valid phone number'
  if (req.includes('consent') && v.consent !== 'true') e.consent = 'Please accept to continue'
  return e
}

function useForm() {
  const [v, setV] = useState<Vals>({}); const [e, setE] = useState<Vals>({}); const started = useRef(false)
  const set = (n: string, x: string) => { setV((p) => ({ ...p, [n]: x })); setE((p) => ({ ...p, [n]: '' })) }
  return { v, e, setE, set, started }
}

function Success({ refNo, dup, kind }: { refNo: string; dup: boolean; kind: 'partnership' | 'service' | 'contact' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="theme-dark ambient relative overflow-hidden border border-line p-8 sm:p-14">
      <div aria-hidden className="cta-slash" />
      <motion.svg width="56" height="56" viewBox="0 0 56 56" className="relative"><motion.circle cx="28" cy="28" r="26" fill="none" stroke="#087CF5" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} /><motion.path d="M17 29l7 7 15-16" fill="none" stroke="#fff" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} /></motion.svg>
      <h2 className="relative mt-8 font-display text-3xl font-bold tracking-tight sm:text-4xl">{kind === 'contact' ? 'Message received.' : 'Submission received.'}</h2>
      {refNo && <p className="relative mt-4 text-mute">Your reference number is <span className="font-display font-bold text-ink">{refNo}</span>. Please keep it for future communication.</p>}
      {dup && <p className="relative mt-3 text-sm text-mute">We noticed a similar earlier submission — we’ll review them together.</p>}
      <p className="relative mt-3 text-mute">{kind === 'partnership' ? 'Our team reviews every application selectively. If there is a fit, we will contact you.' : kind === 'service' ? 'We will review your requirements and get back to you to discuss scope.' : 'We will reply as soon as we can.'}</p>
      <div className="relative mt-10"><Button to="/" variant="ghost">Back to home</Button></div>
    </motion.div>
  )
}

const errMsg = (m?: string) => (m && !/rejected/i.test(m) ? m.replace(/^.*?:\s?(?=[A-Z])/, '') : 'Something went wrong. Please try again.')

// ---------- PATH 01: partnership ----------
const STEPS = [
  { t: 'Founder', req: ['founder_name', 'email', 'phone'] },
  { t: 'Business', req: ['business_name', 'industry', 'stage'] },
  { t: 'Idea', req: ['description', 'problem', 'solution', 'target_customers'] },
  { t: 'Technology', req: ['requirements', 'features'] },
  { t: 'Partnership', req: ['equity_openness', 'consent'] },
]

export function PartnerWithUs() {
  useMeta('/partner-with-us')
  const f = useForm(); const [step, setStep] = useState(0); const [dir, setDir] = useState(1)
  const [deck, setDeck] = useState<File[]>([]); const [docs, setDocs] = useState<File[]>([])
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState<{ reference: string; duplicate: boolean } | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const set = (n: string, x: string) => { if (!f.started.current) { f.started.current = true; track('partnership_form_start') } f.set(n, x) }
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const next = () => { const e = check(f.v, STEPS[step].req); f.setE(e); if (Object.values(e).some(Boolean)) return; if (step < 4) go(step + 1); else submit() }
  async function submit() {
    setBusy(true); setErr('')
    try {
      const uploaded = await uploadFiles('partnership', [...deck.map((file) => ({ file, kind: 'pitch_deck' })), ...docs.map((file) => ({ file, kind: 'supporting' }))])
      const { data, error } = await sb().rpc('submit_partnership_application', { payload: { ...f.v, consent: f.v.consent === 'true', documents: uploaded } })
      if (error) throw new Error(error.message)
      track('partnership_form_submit'); setDone(data as { reference: string; duplicate: boolean })
    } catch (x) { setErr(errMsg((x as Error).message)) } finally { setBusy(false) }
  }
  const p = { v: f.v, set }
  return (
    <>
      <PageHero eyebrow="PATH 01 — PARTNER WITH US" lines={['Apply for a', <span className="text-gradient">partnership.</span>]} intro="Five short steps. We review every application selectively — no fixed equity, no promises, just a straight conversation if there’s a fit." />
      <Band tone="light" className="py-10">
      <Section className="pb-12">
        <div ref={top} className="scroll-mt-28">
          {done ? <Success refNo={done.reference} dup={done.duplicate} kind="partnership" /> : (
            <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
              <ol className="flex gap-2 lg:flex-col lg:gap-0" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s.t} className="flex-1 lg:flex-none">
                    <button type="button" disabled={i > step} onClick={() => go(i)} className={`group flex w-full flex-col gap-2 text-left lg:flex-row lg:items-center lg:gap-4 lg:border-l lg:py-4 lg:pl-5 ${i === step ? 'lg:border-accent' : 'lg:border-line'}`} aria-current={i === step ? 'step' : undefined}>
                      <span className={`h-[2px] w-full transition-colors lg:hidden ${i <= step ? 'bg-accent' : 'bg-line'}`} />
                      <span className={`font-display text-[10px] font-semibold tracking-label ${i === step ? 'text-accent' : 'text-mute'}`}>0{i + 1}</span>
                      <span className={`hidden font-display text-sm font-semibold lg:block ${i <= step ? 'text-ink' : 'text-mute'}`}>{s.t}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <form noValidate onSubmit={(e) => { e.preventDefault(); next() }} className="relative">
                <Honeypot {...p} />
                <p className="font-display text-[11px] font-semibold tracking-label text-mute lg:hidden">STEP 0{step + 1} — {STEPS[step].t.toUpperCase()}</p>
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div key={step} custom={dir} initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="grid gap-7 sm:grid-cols-2">
                    {step === 0 && <><Field {...p} label="Full name" name="founder_name" req err={f.e.founder_name} auto="name" /><Field {...p} label="Email" name="email" type="email" req err={f.e.email} auto="email" /><Field {...p} label="Phone" name="phone" type="tel" req err={f.e.phone} auto="tel" /><Field {...p} label="City" name="city" auto="address-level2" /><div className="sm:col-span-2"><Field {...p} label="LinkedIn profile" name="linkedin" type="url" /></div></>}
                    {step === 1 && <><Field {...p} label="Business name" name="business_name" req err={f.e.business_name} auto="organization" /><Field {...p} label="Industry" name="industry" req err={f.e.industry} /><Field {...p} label="Website (if any)" name="website" type="url" /><Field {...p} label="Stage" name="stage" req err={f.e.stage} opts={['Idea', 'Validated idea', 'Prototype / MVP', 'Early revenue', 'Growing business']} /></>}
                    {step === 2 && <><div className="sm:col-span-2"><Field {...p} area label="Describe the business" name="description" req err={f.e.description} /></div><Field {...p} area label="Problem you solve" name="problem" req err={f.e.problem} /><Field {...p} area label="Your solution" name="solution" req err={f.e.solution} /><div className="sm:col-span-2"><Field {...p} area label="Target customers" name="target_customers" req err={f.e.target_customers} /></div></>}
                    {step === 3 && <><div className="sm:col-span-2"><Field {...p} area label="Technology requirements" name="requirements" req err={f.e.requirements} hint="e.g. mobile app + admin panel, integrations" /></div><div className="sm:col-span-2"><Field {...p} area label="Key features" name="features" req err={f.e.features} /></div><Field {...p} label="Estimated budget" name="estimated_budget" opts={['Under ₹5 lakh', '₹5–15 lakh', '₹15–50 lakh', 'Above ₹50 lakh', 'Not sure yet']} /></>}
                    {step === 4 && <><Field {...p} label="Open to equity partnership?" name="equity_openness" req err={f.e.equity_openness} opts={['Yes, open to discuss', 'Possibly, need details', 'Prefer minimal equity']} /><Field {...p} label="Co-founders (names / roles)" name="cofounders" /><div className="sm:col-span-2"><Field {...p} area label="Anything else we should know" name="additional_details" /></div><Files files={deck} setFiles={setDeck} label="Pitch deck (optional)" /><Files files={docs} setFiles={setDocs} label="Wireframes / documents (optional)" /><div className="sm:col-span-2"><Consent {...p} err={f.e.consent} kind="application" /></div></>}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">{err}</p>}
                <div className="mt-10 flex items-center justify-between gap-4">
                  {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="text-sm text-mute hover:text-ink">← Back</button> : <span />}
                  <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : step < 4 ? 'Continue' : 'Submit application'}</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Section>
      </Band>
    </>
  )
}

// ---------- PATH 02: paid services ----------
const SREQ = ['name', 'email', 'phone', 'project_name', 'project_type', 'description', 'features', 'budget_range', 'consent']
export function TechnologyServices() {
  useMeta('/technology-services')
  const f = useForm(); const [docs, setDocs] = useState<File[]>([])
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState<{ reference: string; duplicate: boolean } | null>(null)
  const set = (n: string, x: string) => { if (!f.started.current) { f.started.current = true; track('service_form_start') } f.set(n, x) }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); const er = check(f.v, SREQ); f.setE(er); if (Object.values(er).some(Boolean)) { document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    setBusy(true); setErr('')
    try {
      const uploaded = await uploadFiles('service', docs.map((file) => ({ file })))
      const { data, error } = await sb().rpc('submit_service_enquiry', { payload: { ...f.v, consent: f.v.consent === 'true', documents: uploaded } })
      if (error) throw new Error(error.message)
      track('service_form_submit'); setDone(data as { reference: string; duplicate: boolean }); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (x) { setErr(errMsg((x as Error).message)) } finally { setBusy(false) }
  }
  const p = { v: f.v, set }
  return (
    <>
      <PageHero eyebrow="PATH 02 — TECHNOLOGY SERVICES" lines={['Request a project', 'consultation.']} intro="Tell us what you need built. We’ll scope it, quote it and agree milestones before any work starts." />
      <Band tone="light" className="py-10">
      <Section className="pb-12">
        {done ? <Success refNo={done.reference} dup={done.duplicate} kind="service" /> : (
          <form noValidate onSubmit={submit} className="relative space-y-14">
            <Honeypot {...p} />
            <Group n="01" t="You"><Field {...p} label="Name" name="name" req err={f.e.name} auto="name" /><Field {...p} label="Email" name="email" type="email" req err={f.e.email} auto="email" /><Field {...p} label="Phone" name="phone" type="tel" req err={f.e.phone} auto="tel" /><Field {...p} label="Company" name="company" auto="organization" /></Group>
            <Group n="02" t="Project"><Field {...p} label="Project name" name="project_name" req err={f.e.project_name} /><Field {...p} label="Project type" name="project_type" req err={f.e.project_type} opts={PROJECT_TYPES} /><div className="sm:col-span-2"><Field {...p} area label="Project description" name="description" req err={f.e.description} /></div><div className="sm:col-span-2"><Field {...p} area label="Features required" name="features" req err={f.e.features} /></div></Group>
            <Group n="03" t="Budget & timing"><Field {...p} label="Budget range" name="budget_range" req err={f.e.budget_range} opts={['Under ₹2 lakh', '₹2–5 lakh', '₹5–15 lakh', '₹15–50 lakh', 'Above ₹50 lakh', 'Undecided']} /><Field {...p} label="Expected timeline" name="timeline" opts={['ASAP', '1–3 months', '3–6 months', '6+ months', 'Flexible']} /><div className="sm:col-span-2"><Field {...p} area label="Reference links" name="reference_links" hint="Apps or sites you like, one per line" /></div><div className="sm:col-span-2"><Files files={docs} setFiles={setDocs} label="Supporting documents (optional)" /></div></Group>
            <Consent {...p} err={f.e.consent} kind="enquiry" />
            {err && <p role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">{err}</p>}
            <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Request consultation'}</Button>
          </form>
        )}
      </Section>
      </Band>
    </>
  )
}
const Group = ({ n, t, children }: { n: string; t: string; children: ReactNode }) => (
  <fieldset className="grid gap-8 border-t border-line pt-8 lg:grid-cols-[260px_1fr]">
    <legend className="contents"><span className="font-display text-sm font-semibold"><span className="mr-3 text-[11px] text-accent">{n}</span>{t}</span></legend>
    <div className="grid gap-7 sm:grid-cols-2">{children}</div>
  </fieldset>
)

// ---------- contact ----------
export function Contact() {
  useMeta('/contact')
  const f = useForm(); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); const er = check(f.v, ['name', 'email', 'message', 'consent']); f.setE(er); if (Object.values(er).some(Boolean)) return
    setBusy(true); setErr('')
    const { error } = await sb().rpc('submit_contact', { payload: { ...f.v, consent: f.v.consent === 'true' } })
    setBusy(false); if (error) return setErr(errMsg(error.message)); track('contact_submit'); setDone(true)
  }
  const p = { v: f.v, set: f.set }
  return (
    <>
      <PageHero eyebrow="CONTACT" lines={['Let’s talk.']} intro="For partnerships or projects, the dedicated forms are fastest. For anything else, write to us here." />
      <Band tone="light" className="py-10">
      <Section className="pb-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            <Link to="/partner-with-us" className="spot group block border border-line bg-surface p-6"><Eyebrow>PATH 01</Eyebrow><p className="mt-4 font-display text-xl font-bold">Partner with us →</p></Link>
            <Link to="/technology-services" className="spot group block border border-line bg-surface p-6"><Eyebrow>PATH 02</Eyebrow><p className="mt-4 font-display text-xl font-bold">Request services →</p></Link>
            <div className="border-t border-line pt-6 text-sm"><p className="text-mute">Email</p><a href={`mailto:${SITE.email}`} className="mt-1 block font-display text-lg hover:text-accent">{SITE.email}</a><p className="mt-5 text-mute">Phone / WhatsApp</p><a href={`tel:${SITE.phoneHref}`} className="mt-1 block font-display text-lg hover:text-accent">{SITE.phone}</a><a href={SITE.whatsapp} target="_blank" rel="noopener" className="mt-1 inline-block text-accent">Chat on WhatsApp ↗</a><p className="mt-5 text-mute">Location</p><p className="mt-1">{SITE.location}</p></div>
          </div>
          {done ? <Success refNo="" dup={false} kind="contact" /> : (
            <form noValidate onSubmit={submit} className="relative grid gap-7 sm:grid-cols-2">
              <Honeypot {...p} />
              <Field {...p} label="Name" name="name" req err={f.e.name} auto="name" /><Field {...p} label="Email" name="email" type="email" req err={f.e.email} auto="email" />
              <div className="sm:col-span-2"><Field {...p} label="Subject" name="subject" /></div>
              <div className="sm:col-span-2"><Field {...p} area label="Message" name="message" req err={f.e.message} /></div>
              <div className="sm:col-span-2"><Consent {...p} err={f.e.consent} kind="message" /></div>
              {err && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{err}</p>}
              <div><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button></div>
            </form>
          )}
        </div>
      </Section>
      </Band>
    </>
  )
}
