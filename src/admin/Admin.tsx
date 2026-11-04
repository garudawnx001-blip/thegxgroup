import type { Session } from '@supabase/supabase-js'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { PARTNERSHIP_STATUSES, SERVICE_STATUSES, label } from '../content/site'
import { sb } from '../lib/supabase'
import { Area, Badge, Btn, Card, Empty, H, In, KV, Sel, fmtDT, fmtDate, inputCls, toCSV } from './kit'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [admin, setAdmin] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    sb().auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb().auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) { setAdmin(session === null ? false : undefined); return }
    sb().from('profiles').select('is_admin').eq('id', session.user.id).maybeSingle().then(({ data }) => setAdmin(!!data?.is_admin))
  }, [session])
  return { session, admin }
}

export default function Admin() {
  useEffect(() => { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m); document.title = 'Admin | THE GX GROUP'; return () => m.remove() }, [])
  const { session, admin } = useAuth()
  if (session === undefined || (session && admin === undefined)) return <div className="flex min-h-screen items-center justify-center text-sm text-mute">Loading…</div>
  return (
    <Routes>
      <Route path="login" element={session && admin ? <Navigate to="/admin" replace /> : <Login denied={!!session && !admin} />} />
      <Route path="*" element={session && admin ? <Shell /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

function Login({ denied }: { denied: boolean }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(denied ? 'This account does not have admin access.' : ''); const [busy, setBusy] = useState(false); const [mode, setMode] = useState<'login' | 'reset'>('login'); const [msg, setMsg] = useState('')
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    if (mode === 'reset') { const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/settings` }); setBusy(false); return error ? setErr(error.message) : setMsg('If that account exists, a reset link has been sent.') }
    const { error } = await sb().auth.signInWithPassword({ email, password: pw }); setBusy(false); if (error) setErr('Invalid email or password.')
  }
  return (
    <div className="blueprint flex min-h-screen items-center justify-center px-5">
      <form onSubmit={go} className="w-full max-w-sm border border-line bg-surface p-8">
        <img src="/brand/logo.svg" alt="THE GX GROUP" className="h-10 w-auto" />
        <p className="mt-8 font-display text-[11px] font-semibold tracking-label text-mute">{mode === 'login' ? 'ADMIN SIGN IN' : 'RESET PASSWORD'}</p>
        <div className="mt-5 space-y-4">
          <In l="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          {mode === 'login' && <In l="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />}
        </div>
        {err && <p className="mt-4 text-sm text-red-300">{err}</p>}{msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}
        <div className="mt-6 flex items-center justify-between"><Btn type="submit" disabled={busy}>{mode === 'login' ? 'Sign in' : 'Send link'}</Btn>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'reset' : 'login')} className="text-xs text-mute hover:text-ink">{mode === 'login' ? 'Forgot password?' : 'Back to sign in'}</button></div>
        {denied && <button type="button" onClick={() => sb().auth.signOut()} className="mt-4 text-xs text-mute underline">Sign out</button>}
      </form>
    </div>
  )
}

const NAV: [string, string][] = [['', 'Dashboard'], ['applications', 'Applications'], ['enquiries', 'Service enquiries'], ['follow-ups', 'Follow-ups'], ['partnerships', 'Partnerships'], ['projects', 'Projects'], ['portfolio', 'Portfolio'], ['contacts', 'Contact messages'], ['settings', 'Settings']]

function Shell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[240px] border-r border-line bg-surface p-5 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/"><img src="/brand/logo.svg" alt="THE GX GROUP" className="h-8 w-auto" /></Link>
        <nav className="mt-10 space-y-1" onClick={() => setOpen(false)}>
          {NAV.map(([to, l]) => <NavLink key={to} end to={`/admin/${to}`.replace(/\/$/, '')} className={({ isActive }) => `block px-3 py-2 text-sm ${isActive ? 'bg-elev text-ink' : 'text-mute hover:text-ink'}`}>{l}</NavLink>)}
        </nav>
        <button onClick={() => sb().auth.signOut()} className="absolute bottom-5 left-5 text-xs text-mute hover:text-ink">Sign out</button>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex h-14 items-center border-b border-line bg-bg/90 px-5 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} className="text-sm">☰ Menu</button></div>
        <main className="p-5 sm:p-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Pipeline kind="partnership" />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="enquiries" element={<Pipeline kind="service" />} />
            <Route path="enquiries/:id" element={<EnquiryDetail />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="partnerships" element={<Partnerships />} />
            <Route path="partnerships/:id" element={<PartnershipDetail />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="portfolio" element={<PortfolioAdmin />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const count = async (t: string, f?: (q: any) => any) => { let q: any = sb().from(t).select('id', { count: 'exact', head: true }); if (f) q = f(q); const { count: c } = await q; return c ?? 0 } // eslint-disable-line @typescript-eslint/no-explicit-any

function Dashboard() {
  const [s, setS] = useState<Record<string, number> | null>(null)
  const [recent, setRecent] = useState<Row[]>([])
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      count('partnership_applications'), count('partnership_applications', (q) => q.eq('status', 'new')), count('partnership_applications', (q) => q.eq('status', 'shortlisted')),
      count('follow_ups', (q) => q.eq('completed', false)), count('follow_ups', (q) => q.eq('completed', false).lt('due_date', today)),
      count('service_enquiries'), count('service_enquiries', (q) => q.eq('status', 'quotation_sent')),
      count('partnerships', (q) => q.eq('archived', false)), count('projects', (q) => q.eq('archived', false).not('dev_status', 'in', '(launched,paused)')),
    ]).then(([a, an, as, f, fo, e, eq, p, pr]) => setS({ a, an, as, f, fo, e, eq, p, pr }))
    sb().from('notifications').select('*').order('created_at', { ascending: false }).limit(8).then(({ data }) => setRecent(data ?? []))
  }, [])
  const tiles: [string, string, string][] = s ? [['Partnership applications', String(s.a), 'applications'], ['New applications', String(s.an), 'applications?status=new'], ['Shortlisted', String(s.as), 'applications?status=shortlisted'], ['Pending follow-ups', `${s.f}${s.fo ? ` · ${s.fo} overdue` : ''}`, 'follow-ups'], ['Service enquiries', String(s.e), 'enquiries'], ['Quotations sent', String(s.eq), 'enquiries?status=quotation_sent'], ['Active partnerships', String(s.p), 'partnerships'], ['Active projects', String(s.pr), 'projects']] : []
  return (
    <>
      <H t="Dashboard" sub="All figures are live from the database." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {s ? tiles.map(([l, v, to]) => <Link key={l} to={`/admin/${to}`} className="border border-line bg-surface p-5 transition-colors hover:border-accent"><p className="text-xs text-mute">{l}</p><p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{v}</p></Link>) : Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-surface" />)}
      </div>
      <h2 className="mb-3 mt-10 font-display text-sm font-semibold">Recent activity</h2>
      {recent.length ? <div className="divide-y divide-line border border-line">{recent.map((n) => <Link key={n.id} to={n.ref_table === 'partnership_applications' ? `/admin/applications/${n.ref_id}` : n.ref_table === 'service_enquiries' ? `/admin/enquiries/${n.ref_id}` : '/admin/contacts'} className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-surface"><span>{n.title}</span><span className="shrink-0 text-xs text-mute">{fmtDT(n.created_at)}</span></Link>)}</div> : <Empty t="No submissions yet." />}
    </>
  )
}

// ---------- pipelines ----------
const CFG = {
  partnership: { table: 'partnership_applications', title: 'Partnership applications', base: 'applications', statuses: PARTNERSHIP_STATUSES, who: (r: Row) => r.founder_name, what: (r: Row) => r.business_name, extra: (r: Row) => r.industry, search: ['founder_name', 'business_name', 'email'] },
  service: { table: 'service_enquiries', title: 'Service enquiries', base: 'enquiries', statuses: SERVICE_STATUSES, who: (r: Row) => r.name, what: (r: Row) => r.project_name, extra: (r: Row) => r.project_type, search: ['name', 'project_name', 'email', 'company'] },
}

function Pipeline({ kind }: { kind: 'partnership' | 'service' }) {
  const c = CFG[kind]
  const params = new URLSearchParams(location.search)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [q, setQ] = useState(''); const [status, setStatus] = useState(params.get('status') ?? ''); const [extra, setExtra] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [sel, setSel] = useState<Set<string>>(new Set())
  useEffect(() => {
    let qq = sb().from(c.table).select('*').eq('archived', false).order('created_at', { ascending: false }).limit(500)
    if (status) qq = qq.eq('status', status)
    if (from) qq = qq.gte('created_at', from)
    if (to) qq = qq.lte('created_at', `${to}T23:59:59`)
    if (q.trim()) { const s = q.trim().replace(/[,()]/g, ' '); qq = qq.or(c.search.map((f) => `${f}.ilike.%${s}%`).join(',')) }
    const t = setTimeout(() => qq.then(({ data }) => setRows(data ?? [])), 200); return () => clearTimeout(t)
  }, [c.table, status, q, from, to]) // eslint-disable-line react-hooks/exhaustive-deps
  const extras = useMemo(() => [...new Set((rows ?? []).map(c.extra).filter(Boolean))].sort(), [rows]) // eslint-disable-line react-hooks/exhaustive-deps
  const list = (rows ?? []).filter((r) => !extra || c.extra(r) === extra)
  const exportRows = list.filter((r) => !sel.size || sel.has(r.id))
  return (
    <>
      <H t={c.title} sub={rows ? `${list.length} records` : 'Loading…'} right={<Btn kind="ghost" onClick={() => toCSV(exportRows, c.base)}>Export {sel.size ? `${sel.size} selected` : 'all'} CSV</Btn>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input placeholder="Search name, business, email" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} lg:col-span-2`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}><option value="">All statuses</option>{c.statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select value={extra} onChange={(e) => setExtra(e.target.value)} className={inputCls}><option value="">{kind === 'partnership' ? 'All industries' : 'All types'}</option>{extras.map((x) => <option key={x}>{x}</option>)}</select>
        <div className="flex gap-2"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} aria-label="From date" /><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} aria-label="To date" /></div>
      </div>
      {rows && !list.length ? <Empty t="No records match." /> : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-mute"><tr><th className="w-10 p-3"><input type="checkbox" aria-label="Select all" checked={!!list.length && sel.size === list.length} onChange={(e) => setSel(e.target.checked ? new Set(list.map((r) => r.id)) : new Set())} /></th><th className="p-3">Ref</th><th className="p-3">Name</th><th className="p-3">{kind === 'partnership' ? 'Business' : 'Project'}</th><th className="p-3">{kind === 'partnership' ? 'Industry' : 'Type'}</th><th className="p-3">Status</th><th className="p-3">Received</th></tr></thead>
            <tbody className="divide-y divide-line">
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-surface">
                  <td className="p-3"><input type="checkbox" aria-label={`Select ${r.reference}`} checked={sel.has(r.id)} onChange={(e) => { const n = new Set(sel); e.target.checked ? n.add(r.id) : n.delete(r.id); setSel(n) }} /></td>
                  <td className="p-3 font-mono text-xs"><Link to={`/admin/${c.base}/${r.id}`} className="hover:text-accent">{r.reference}</Link>{r.is_duplicate && <span className="ml-2 text-[10px] text-amber-300">DUP</span>}</td>
                  <td className="p-3"><Link to={`/admin/${c.base}/${r.id}`} className="hover:text-accent">{c.who(r)}</Link><p className="text-xs text-mute">{r.email}</p></td>
                  <td className="p-3">{c.what(r)}</td><td className="p-3 text-mute">{c.extra(r)}</td><td className="p-3"><Badge s={r.status} /></td><td className="p-3 text-mute">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function useRecord(table: string, id?: string) {
  const [r, setR] = useState<Row | null>(null)
  const load = useCallback(() => { if (id) sb().from(table).select('*').eq('id', id).maybeSingle().then(({ data }) => setR(data)) }, [table, id])
  useEffect(load, [load])
  return [r, load, setR] as const
}
function useChildren(table: string, fk: string, id?: string) {
  const [rows, setRows] = useState<Row[]>([])
  const load = useCallback(() => { if (id) sb().from(table).select('*').eq(fk, id).order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? [])) }, [table, fk, id])
  useEffect(load, [load])
  return [rows, load] as const
}

function Docs({ table, fk, id }: { table: string; fk: string; id: string }) {
  const [docs] = useChildren(table, fk, id)
  const open = async (path: string) => { const { data } = await sb().storage.from('uploads').createSignedUrl(path, 120); if (data) window.open(data.signedUrl, '_blank', 'noopener') }
  return <Card><h3 className="mb-3 text-sm font-semibold">Documents</h3>{docs.length ? <ul className="space-y-2">{docs.map((d) => <li key={d.id}><button onClick={() => open(d.path)} className="text-left text-sm text-accent hover:underline">{d.file_name}</button><span className="ml-2 text-xs text-mute">{d.kind ?? ''} {d.size_bytes ? `· ${(d.size_bytes / 1024).toFixed(0)} KB` : ''}</span></li>)}</ul> : <p className="text-sm text-mute">None uploaded.</p>}<p className="mt-3 text-[11px] text-mute">Links are private and expire in 2 minutes.</p></Card>
}

function Notes({ table, fk, id }: { table: string; fk: string; id: string }) {
  const [rows, load] = useChildren(table, fk, id); const [body, setBody] = useState('')
  const add = async () => { if (!body.trim()) return; const { data: u } = await sb().auth.getUser(); await sb().from(table).insert({ [fk]: id, body, author: u.user?.id }); setBody(''); load() }
  return <Card><h3 className="mb-3 text-sm font-semibold">Internal notes</h3><Area value={body} onChange={(e) => setBody(e.target.value)} placeholder="Private — never shown to the applicant" /><div className="mt-2"><Btn onClick={add}>Add note</Btn></div><ul className="mt-4 space-y-3">{rows.map((n) => <li key={n.id} className="border-t border-line pt-3 text-sm"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-[11px] text-mute">{fmtDT(n.created_at)}</p></li>)}</ul></Card>
}

function Activity({ table, fk, id, reload }: { table: string; fk: string; id: string; reload: number }) {
  const [rows, load] = useChildren(table, fk, id)
  useEffect(load, [reload, load])
  const [detail, setDetail] = useState(''); const [method, setMethod] = useState('call')
  const log = async () => { if (!detail.trim()) return; const { data: u } = await sb().auth.getUser(); await sb().from(table).insert({ [fk]: id, kind: `contact_${method}`, detail, actor: u.user?.id }); setDetail(''); load() }
  return <Card><h3 className="mb-3 text-sm font-semibold">Activity & contact log</h3>
    <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto]"><select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>{['call', 'email', 'whatsapp', 'meeting'].map((m) => <option key={m}>{m}</option>)}</select><input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Record a contact attempt or communication" className={inputCls} /><Btn onClick={log}>Log</Btn></div>
    <ol className="mt-4 space-y-3">{rows.map((a) => <li key={a.id} className="flex gap-3 border-t border-line pt-3 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" /><div><p>{a.kind === 'status_change' ? <>Status: {label(a.from_status ?? '')} → <b>{label(a.to_status)}</b></> : a.kind.startsWith('contact_') ? <><b>{label(a.kind.slice(8))}</b> — {a.detail}</> : a.detail ?? label(a.kind)}</p><p className="text-[11px] text-mute">{fmtDT(a.created_at)}</p></div></li>)}</ol></Card>
}

function FollowUpBox({ fk, id }: { fk: 'application_id' | 'enquiry_id'; id: string }) {
  const [rows, load] = useChildren('follow_ups', fk, id)
  const [f, setF] = useState({ due_date: '', method: 'call', notes: '', responsible: 'Founder' })
  const add = async () => { if (!f.due_date) return; await sb().from('follow_ups').insert({ ...f, [fk]: id }); setF({ ...f, due_date: '', notes: '' }); load() }
  const toggle = async (r: Row) => { await sb().from('follow_ups').update({ completed: !r.completed, completed_at: r.completed ? null : new Date().toISOString() }).eq('id', r.id); load() }
  const today = new Date().toISOString().slice(0, 10)
  return <Card><h3 className="mb-3 text-sm font-semibold">Follow-ups</h3>
    <div className="grid gap-2 sm:grid-cols-2"><In l="Date" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /><Sel l="Method" value={f.method} onChange={(v) => setF({ ...f, method: v })} opts={['call', 'email', 'whatsapp', 'meeting']} /><In l="Responsible" value={f.responsible} onChange={(e) => setF({ ...f, responsible: e.target.value })} /><In l="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
    <div className="mt-2"><Btn onClick={add}>Schedule</Btn></div>
    <ul className="mt-4 space-y-2">{rows.map((r) => <li key={r.id} className="flex items-center gap-3 border-t border-line pt-2 text-sm"><input type="checkbox" checked={r.completed} onChange={() => toggle(r)} /><span className={r.completed ? 'text-mute line-through' : !r.completed && r.due_date < today ? 'text-red-300' : ''}>{fmtDate(r.due_date)} · {r.method}{r.notes ? ` — ${r.notes}` : ''}</span></li>)}</ul></Card>
}

function StatusBar({ table, r, statuses, onChange }: { table: string; r: Row; statuses: readonly string[]; onChange: () => void }) {
  const [saving, setSaving] = useState(false)
  const set = async (s: string) => { setSaving(true); await sb().from(table).update({ status: s }).eq('id', r.id); setSaving(false); onChange() }
  return <div className="flex flex-wrap gap-1.5">{statuses.map((s) => <button key={s} disabled={saving} onClick={() => set(s)} className={`border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${r.status === s ? 'border-accent bg-accent/15 text-accent' : 'border-line text-mute hover:text-ink'}`}>{label(s)}</button>)}</div>
}

function ApplicationDetail() {
  const { id } = useParams(); const nav = useNavigate()
  const [r, load] = useRecord('partnership_applications', id); const [tick, setTick] = useState(0)
  if (!r) return <p className="text-sm text-mute">Loading…</p>
  const toPartnership = async () => {
    const { data, error } = await sb().from('partnerships').insert({ application_id: r.id, founder_name: r.founder_name, founder_email: r.email, business_name: r.business_name, business_details: `${r.industry} · ${r.stage}\n${r.description}` }).select('id').single()
    if (!error && data) { await sb().from('partnership_terms').insert({ partnership_id: data.id }); nav(`/admin/partnerships/${data.id}`) }
  }
  return (
    <>
      <Link to="/admin/applications" className="text-xs text-mute hover:text-ink">← Applications</Link>
      <H t={r.business_name} sub={`${r.reference} · ${r.founder_name} · received ${fmtDT(r.created_at)}${r.is_duplicate ? ' · possible duplicate' : ''}`} right={r.status === 'accepted' && <Btn onClick={toPartnership}>Create partnership record</Btn>} />
      <Card className="mb-4"><p className="mb-3 text-xs text-mute">Status (every change is logged)</p><StatusBar table="partnership_applications" r={r} statuses={PARTNERSHIP_STATUSES} onChange={() => { load(); setTick(tick + 1) }} /></Card>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Card><h3 className="text-sm font-semibold">Founder</h3><dl className="mt-2 grid gap-x-6 sm:grid-cols-2"><KV k="Name" v={r.founder_name} /><KV k="Email" v={<a href={`mailto:${r.email}`} className="text-accent">{r.email}</a>} /><KV k="Phone" v={<a href={`tel:${r.phone}`} className="text-accent">{r.phone}</a>} /><KV k="City" v={r.city} /><KV k="LinkedIn" v={r.linkedin && <a href={r.linkedin} target="_blank" rel="noopener" className="text-accent">{r.linkedin}</a>} /></dl></Card>
          <Card><h3 className="text-sm font-semibold">Business & idea</h3><dl className="mt-2 grid gap-x-6 sm:grid-cols-2"><KV k="Industry" v={r.industry} /><KV k="Stage" v={r.stage} /><KV k="Website" v={r.website} /><KV k="Target customers" v={r.target_customers} /></dl><dl><KV k="Description" v={r.description} /><KV k="Problem" v={r.problem} /><KV k="Solution" v={r.solution} /></dl></Card>
          <Card><h3 className="text-sm font-semibold">Technology & partnership</h3><dl><KV k="Requirements" v={r.requirements} /><KV k="Features" v={r.features} /><KV k="Estimated budget" v={r.estimated_budget} /><KV k="Equity openness" v={r.equity_openness} /><KV k="Co-founders" v={r.cofounders} /><KV k="Additional details" v={r.additional_details} /><KV k="Consent recorded" v={fmtDT(r.consent_at)} /></dl></Card>
        </div>
        <div className="space-y-4"><Docs table="partnership_documents" fk="application_id" id={r.id} /><FollowUpBox fk="application_id" id={r.id} /><Notes table="partnership_notes" fk="application_id" id={r.id} /><Activity table="partnership_activity" fk="application_id" id={r.id} reload={tick} />
          <Btn kind="danger" onClick={async () => { if (confirm('Archive this application?')) { await sb().from('partnership_applications').update({ archived: true }).eq('id', r.id); nav('/admin/applications') } }}>Archive</Btn></div>
      </div>
    </>
  )
}

function EnquiryDetail() {
  const { id } = useParams(); const nav = useNavigate()
  const [r, load, setR] = useRecord('service_enquiries', id); const [tick, setTick] = useState(0); const [saved, setSaved] = useState(false)
  if (!r) return <p className="text-sm text-mute">Loading…</p>
  const saveQuote = async () => { await sb().from('service_enquiries').update({ internal_estimate: r.internal_estimate || null, estimated_effort: r.estimated_effort, quotation_amount: r.quotation_amount || null, quotation_notes: r.quotation_notes }).eq('id', r.id); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  const toProject = async () => { const { data } = await sb().from('projects').insert({ enquiry_id: r.id, name: r.project_name, kind: 'paid', scope: r.description, deliverables: r.features }).select('id').single(); if (data) nav(`/admin/projects/${data.id}`) }
  return (
    <>
      <Link to="/admin/enquiries" className="text-xs text-mute hover:text-ink">← Service enquiries</Link>
      <H t={r.project_name} sub={`${r.reference} · ${r.name}${r.company ? ` · ${r.company}` : ''} · received ${fmtDT(r.created_at)}${r.is_duplicate ? ' · possible duplicate' : ''}`} right={r.status === 'won' && <Btn onClick={toProject}>Convert to project</Btn>} />
      <Card className="mb-4"><p className="mb-3 text-xs text-mute">Status (every change is logged)</p><StatusBar table="service_enquiries" r={r} statuses={SERVICE_STATUSES} onChange={() => { load(); setTick(tick + 1) }} /></Card>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Card><h3 className="text-sm font-semibold">Client</h3><dl className="mt-2 grid gap-x-6 sm:grid-cols-2"><KV k="Name" v={r.name} /><KV k="Email" v={<a href={`mailto:${r.email}`} className="text-accent">{r.email}</a>} /><KV k="Phone" v={<a href={`tel:${r.phone}`} className="text-accent">{r.phone}</a>} /><KV k="Company" v={r.company} /></dl></Card>
          <Card><h3 className="text-sm font-semibold">Requirements</h3><dl className="mt-2 grid gap-x-6 sm:grid-cols-2"><KV k="Type" v={r.project_type} /><KV k="Budget" v={r.budget_range} /><KV k="Timeline" v={r.timeline} /></dl><dl><KV k="Description" v={r.description} /><KV k="Features" v={r.features} /><KV k="Reference links" v={r.reference_links} /></dl></Card>
          <Card><h3 className="mb-3 text-sm font-semibold">Estimate & quotation (internal)</h3><div className="grid gap-3 sm:grid-cols-2"><In l="Internal estimate (₹)" type="number" value={r.internal_estimate ?? ''} onChange={(e) => setR({ ...r, internal_estimate: e.target.value })} /><In l="Expected effort" value={r.estimated_effort ?? ''} onChange={(e) => setR({ ...r, estimated_effort: e.target.value })} placeholder="e.g. 6 weeks, 2 devs" /><In l="Quotation amount (₹)" type="number" value={r.quotation_amount ?? ''} onChange={(e) => setR({ ...r, quotation_amount: e.target.value })} /><div className="sm:col-span-2"><Area l="Quotation notes" value={r.quotation_notes ?? ''} onChange={(e) => setR({ ...r, quotation_notes: e.target.value })} /></div></div><div className="mt-3 flex items-center gap-3"><Btn onClick={saveQuote}>Save</Btn>{saved && <span className="text-xs text-emerald-300">Saved</span>}</div></Card>
        </div>
        <div className="space-y-4"><Docs table="service_documents" fk="enquiry_id" id={r.id} /><FollowUpBox fk="enquiry_id" id={r.id} /><Notes table="service_notes" fk="enquiry_id" id={r.id} /><Activity table="service_activity" fk="enquiry_id" id={r.id} reload={tick} />
          <Btn kind="danger" onClick={async () => { if (confirm('Archive this enquiry?')) { await sb().from('service_enquiries').update({ archived: true }).eq('id', r.id); nav('/admin/enquiries') } }}>Archive</Btn></div>
      </div>
    </>
  )
}

function FollowUps() {
  const [rows, setRows] = useState<Row[]>([]); const [all, setAll] = useState(false)
  const load = useCallback(() => { let q = sb().from('follow_ups').select('*, partnership_applications(reference,business_name), service_enquiries(reference,project_name)').order('due_date'); if (!all) q = q.eq('completed', false); q.then(({ data }) => setRows(data ?? [])) }, [all])
  useEffect(load, [load])
  const today = new Date().toISOString().slice(0, 10)
  return (
    <>
      <H t="Follow-ups" sub="Overdue items are highlighted." right={<label className="flex items-center gap-2 text-xs text-mute"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Show completed</label>} />
      {rows.length ? <div className="divide-y divide-line border border-line">{rows.map((r) => {
        const pa = r.partnership_applications, se = r.service_enquiries; const over = !r.completed && r.due_date < today
        return <div key={r.id} className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm"><input type="checkbox" checked={r.completed} onChange={async () => { await sb().from('follow_ups').update({ completed: !r.completed, completed_at: r.completed ? null : new Date().toISOString() }).eq('id', r.id); load() }} />
          <span className={`w-28 ${over ? 'font-semibold text-red-300' : 'text-mute'}`}>{fmtDate(r.due_date)}{over && ' · overdue'}</span><span className="w-20 text-mute">{r.method}</span>
          <Link to={pa ? `/admin/applications/${r.application_id}` : `/admin/enquiries/${r.enquiry_id}`} className="flex-1 hover:text-accent">{pa ? `${pa.reference} · ${pa.business_name}` : se ? `${se.reference} · ${se.project_name}` : '—'}{r.notes && <span className="text-mute"> — {r.notes}</span>}</Link><span className="text-xs text-mute">{r.responsible}</span></div>
      })}</div> : <Empty t="Nothing scheduled." />}
    </>
  )
}

function SimpleList({ table, title, base, cols, newRow }: { table: string; title: string; base: string; cols: [string, (r: Row) => ReactNode][]; newRow?: Row }) {
  const [rows, setRows] = useState<Row[] | null>(null); const nav = useNavigate()
  useEffect(() => { sb().from(table).select('*').eq('archived', false).order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? [])) }, [table])
  const create = async () => { const { data } = await sb().from(table).insert(newRow!).select('id').single(); if (data) nav(`/admin/${base}/${data.id}`) }
  return (
    <>
      <H t={title} right={newRow && <Btn onClick={create}>New</Btn>} />
      {rows && !rows.length ? <Empty t="No records yet." /> : <div className="overflow-x-auto border border-line"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-surface text-[11px] uppercase tracking-wider text-mute"><tr>{cols.map(([h]) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-line">{(rows ?? []).map((r) => <tr key={r.id} onClick={() => nav(`/admin/${base}/${r.id}`)} className="cursor-pointer hover:bg-surface">{cols.map(([h, f]) => <td key={h} className="p-3">{f(r)}</td>)}</tr>)}</tbody></table></div>}
    </>
  )
}

function Partnerships() {
  return <SimpleList table="partnerships" title="Partnerships" base="partnerships" cols={[['Business', (r) => r.business_name], ['Founder', (r) => r.founder_name], ['Approval', (r) => <Badge s={r.approval_status} />], ['Created', (r) => fmtDate(r.created_at)]]} />
}

function PartnershipDetail() {
  const { id } = useParams()
  const [p, , setP] = useRecord('partnerships', id)
  const [t, setT] = useState<Row | null>(null); const [ags, loadAgs] = useChildren('agreements', 'partnership_id', id); const [msg, setMsg] = useState('')
  useEffect(() => { if (id) sb().from('partnership_terms').select('*').eq('partnership_id', id).maybeSingle().then(({ data }) => setT(data ?? { partnership_id: id })) }, [id])
  if (!p || !t) return <p className="text-sm text-mute">Loading…</p>
  const save = async () => {
    await sb().from('partnerships').update({ founder_name: p.founder_name, founder_email: p.founder_email, business_name: p.business_name, business_details: p.business_details, approval_status: p.approval_status, support_obligations: p.support_obligations }).eq('id', p.id)
    const tt = { partnership_id: p.id, development_fee: t.development_fee || null, equity_percentage: t.equity_percentage || null, share_class: t.share_class, issuance_details: t.issuance_details, commercial_terms: t.commercial_terms }
    if (t.id) await sb().from('partnership_terms').update(tt).eq('id', t.id); else { const { data } = await sb().from('partnership_terms').insert(tt).select('*').single(); if (data) setT(data) }
    setMsg('Saved'); setTimeout(() => setMsg(''), 1500)
  }
  const upload = async (f: File) => { const path = `agreements/${p.id}/${Date.now()}_${f.name.replace(/[^\w.\-]+/g, '_')}`; const { error } = await sb().storage.from('uploads').upload(path, f); if (!error) { await sb().from('agreements').insert({ partnership_id: p.id, title: f.name, path }); loadAgs() } else setMsg('Upload failed: ' + error.message) }
  const openDoc = async (path: string) => { const { data } = await sb().storage.from('uploads').createSignedUrl(path, 120); if (data) window.open(data.signedUrl, '_blank', 'noopener') }
  return (
    <>
      <Link to="/admin/partnerships" className="text-xs text-mute hover:text-ink">← Partnerships</Link>
      <H t={p.business_name} sub="Status here is for internal tracking only — it does not issue shares or complete any legal transaction." right={<div className="flex items-center gap-3">{msg && <span className="text-xs text-emerald-300">{msg}</span>}<Btn onClick={save}>Save</Btn></div>} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><h3 className="mb-3 text-sm font-semibold">Founder & business</h3><div className="grid gap-3 sm:grid-cols-2"><In l="Founder" value={p.founder_name ?? ''} onChange={(e) => setP({ ...p, founder_name: e.target.value })} /><In l="Founder email" value={p.founder_email ?? ''} onChange={(e) => setP({ ...p, founder_email: e.target.value })} /><In l="Business" value={p.business_name ?? ''} onChange={(e) => setP({ ...p, business_name: e.target.value })} /><Sel l="Approval / issuance" value={p.approval_status} onChange={(v) => setP({ ...p, approval_status: v })} opts={['draft', 'terms_agreed', 'agreement_signed', 'board_approved', 'shares_issued', 'terminated']} /><div className="sm:col-span-2"><Area l="Business details" value={p.business_details ?? ''} onChange={(e) => setP({ ...p, business_details: e.target.value })} /></div><div className="sm:col-span-2"><Area l="Support obligations" value={p.support_obligations ?? ''} onChange={(e) => setP({ ...p, support_obligations: e.target.value })} /></div></div>{p.application_id && <Link to={`/admin/applications/${p.application_id}`} className="mt-3 inline-block text-xs text-accent">View original application →</Link>}</Card>
        <Card><h3 className="mb-3 text-sm font-semibold">Commercial & equity terms</h3><div className="grid gap-3 sm:grid-cols-2"><In l="Development fee (₹)" type="number" value={t.development_fee ?? ''} onChange={(e) => setT({ ...t, development_fee: e.target.value })} /><In l="Negotiated equity %" type="number" step="0.01" min="0" max="100" value={t.equity_percentage ?? ''} onChange={(e) => setT({ ...t, equity_percentage: e.target.value })} /><In l="Share class" value={t.share_class ?? ''} onChange={(e) => setT({ ...t, share_class: e.target.value })} /><In l="Proposed issuance" value={t.issuance_details ?? ''} onChange={(e) => setT({ ...t, issuance_details: e.target.value })} /><div className="sm:col-span-2"><Area l="Agreed commercial terms" value={t.commercial_terms ?? ''} onChange={(e) => setT({ ...t, commercial_terms: e.target.value })} /></div></div></Card>
        <Card><h3 className="mb-3 text-sm font-semibold">Agreement documents</h3><input type="file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-xs" /><ul className="mt-3 space-y-2">{ags.map((a) => <li key={a.id} className="text-sm">{a.path ? <button onClick={() => openDoc(a.path)} className="text-accent hover:underline">{a.title}</button> : a.title} <span className="text-xs text-mute">· {fmtDate(a.created_at)}</span></li>)}</ul></Card>
        <LinkedProjects field="partnership_id" id={p.id} name={p.business_name} kind="partnership" />
      </div>
    </>
  )
}

function LinkedProjects({ field, id, name, kind }: { field: string; id: string; name: string; kind: string }) {
  const [rows] = useChildren('projects', field, id); const nav = useNavigate()
  const create = async () => { const { data } = await sb().from('projects').insert({ [field]: id, name, kind }).select('id').single(); if (data) nav(`/admin/projects/${data.id}`) }
  return <Card><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Linked projects</h3><Btn kind="ghost" onClick={create}>New project</Btn></div>{rows.length ? rows.map((r) => <Link key={r.id} to={`/admin/projects/${r.id}`} className="block border-t border-line py-2 text-sm hover:text-accent">{r.name} · <span className="text-mute">{label(r.dev_status)}</span></Link>) : <p className="text-sm text-mute">None yet.</p>}</Card>
}

const DEV = ['planning', 'in_progress', 'testing', 'launched', 'support', 'paused']
function Projects() {
  return <SimpleList table="projects" title="Projects" base="projects" newRow={{ name: 'Untitled project', kind: 'internal' }} cols={[['Project', (r) => r.name], ['Type', (r) => label(r.kind)], ['Status', (r) => <Badge s={r.dev_status} />], ['Target', (r) => fmtDate(r.target_date)], ['Launch ready', (r) => (r.launch_ready ? 'Yes' : '—')]]} />
}

function ProjectDetail() {
  const { id } = useParams(); const nav = useNavigate()
  const [p, , setP] = useRecord('projects', id); const [ms, loadMs] = useChildren('milestones', 'project_id', id); const [sup, loadSup] = useChildren('support_records', 'project_id', id)
  const [m, setM] = useState({ title: '', due_date: '' }); const [s, setS] = useState({ summary: '', hours: '' }); const [msg, setMsg] = useState('')
  if (!p) return <p className="text-sm text-mute">Loading…</p>
  const F = (k: string, l: string, area = false, type = 'text') => area ? <Area l={l} value={p[k] ?? ''} onChange={(e) => setP({ ...p, [k]: e.target.value })} /> : <In l={l} type={type} value={p[k] ?? ''} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
  const save = async () => { const { id: _i, created_at: _c, updated_at: _u, ...rest } = p; await sb().from('projects').update({ ...rest, start_date: rest.start_date || null, target_date: rest.target_date || null }).eq('id', p.id); setMsg('Saved'); setTimeout(() => setMsg(''), 1500) }
  return (
    <>
      <Link to="/admin/projects" className="text-xs text-mute hover:text-ink">← Projects</Link>
      <H t={p.name} right={<div className="flex items-center gap-3">{msg && <span className="text-xs text-emerald-300">{msg}</span>}<Btn onClick={save}>Save</Btn></div>} />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card><div className="grid gap-3 sm:grid-cols-2">{F('name', 'Name')}<Sel l="Development status" value={p.dev_status} onChange={(v) => setP({ ...p, dev_status: v })} opts={DEV} /><Sel l="Type" value={p.kind} onChange={(v) => setP({ ...p, kind: v })} opts={['paid', 'partnership', 'internal']} />{F('team_members', 'Team members')}{F('start_date', 'Start date', false, 'date')}{F('target_date', 'Target date', false, 'date')}<div className="sm:col-span-2">{F('scope', 'Scope', true)}</div><div className="sm:col-span-2">{F('deliverables', 'Deliverables', true)}</div>{F('dependencies', 'Dependencies', true)}{F('issues', 'Issues', true)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.launch_ready} onChange={(e) => setP({ ...p, launch_ready: e.target.checked })} /> Launch ready</label></div></Card>
        <div className="space-y-4">
          <Card><h3 className="mb-3 text-sm font-semibold">Milestones</h3><div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"><input value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} placeholder="Milestone" className={inputCls} /><input type="date" value={m.due_date} onChange={(e) => setM({ ...m, due_date: e.target.value })} className={inputCls} /><Btn onClick={async () => { if (!m.title) return; await sb().from('milestones').insert({ project_id: p.id, title: m.title, due_date: m.due_date || null }); setM({ title: '', due_date: '' }); loadMs() }}>Add</Btn></div>
            <ul className="mt-3 space-y-2">{ms.map((x) => <li key={x.id} className="flex items-center gap-3 border-t border-line pt-2 text-sm"><input type="checkbox" checked={x.done} onChange={async () => { await sb().from('milestones').update({ done: !x.done }).eq('id', x.id); loadMs() }} /><span className={x.done ? 'text-mute line-through' : ''}>{x.title}</span><span className="ml-auto text-xs text-mute">{fmtDate(x.due_date)}</span></li>)}</ul></Card>
          <Card><h3 className="mb-3 text-sm font-semibold">Support activity</h3><div className="grid gap-2 sm:grid-cols-[1fr_80px_auto]"><input value={s.summary} onChange={(e) => setS({ ...s, summary: e.target.value })} placeholder="What was done" className={inputCls} /><input type="number" value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} placeholder="Hrs" className={inputCls} /><Btn onClick={async () => { if (!s.summary) return; await sb().from('support_records').insert({ project_id: p.id, summary: s.summary, hours: s.hours || null }); setS({ summary: '', hours: '' }); loadSup() }}>Log</Btn></div>
            <ul className="mt-3 space-y-2">{sup.map((x) => <li key={x.id} className="border-t border-line pt-2 text-sm">{x.summary} <span className="text-xs text-mute">· {x.hours ? `${x.hours}h · ` : ''}{fmtDate(x.created_at)}</span></li>)}</ul></Card>
          <Btn kind="danger" onClick={async () => { if (confirm('Archive project?')) { await sb().from('projects').update({ archived: true }).eq('id', p.id); nav('/admin/projects') } }}>Archive</Btn>
        </div>
      </div>
    </>
  )
}

function PortfolioAdmin() {
  const [rows, setRows] = useState<Row[]>([]); const [edit, setEdit] = useState<Row | null>(null); const [msg, setMsg] = useState('')
  const load = () => sb().from('portfolio_projects').select('*').order('sort_order').then(({ data }) => setRows(data ?? []))
  useEffect(() => { load() }, [])
  const blank = { slug: '', name: '', category: 'Website', ownership: 'internal', status: 'in_development', description: '', challenge: '', solution: '', technology: [], images: [], link: '', sort_order: rows.length, published: false }
  const save = async () => {
    if (!edit) return; const slug = (edit.slug || edit.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const row: Row = { ...edit, slug, technology: typeof edit.technology === 'string' ? edit.technology.split(',').map((s: string) => s.trim()).filter(Boolean) : edit.technology, images: typeof edit.images === 'string' ? edit.images.split('\n').map((s: string) => s.trim()).filter(Boolean) : edit.images, link: edit.link || null }
    delete row.created_at; delete row.updated_at
    const { error } = row.id ? await sb().from('portfolio_projects').update(row).eq('id', row.id) : await sb().from('portfolio_projects').insert(row)
    if (error) return setMsg(error.message); setEdit(null); setMsg(''); load()
  }
  const uploadImg = async (f: File) => {
    // public images: stored as data in the repo is not possible from the browser, so use a public bucket path
    const path = `portfolio/${Date.now()}_${f.name.replace(/[^\w.\-]+/g, '_')}`
    const { error } = await sb().storage.from('portfolio').upload(path, f); if (error) return setMsg(error.message)
    const url = sb().storage.from('portfolio').getPublicUrl(path).data.publicUrl
    setEdit((e) => ({ ...e!, images: [...(typeof e!.images === 'string' ? e!.images.split('\n').filter(Boolean) : e!.images ?? []), url] }))
  }
  return (
    <>
      <H t="Portfolio" sub="Publish only verified projects. Unpublished items never appear on the website." right={<Btn onClick={() => setEdit(blank)}>Add project</Btn>} />
      {edit && (
        <Card className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <In l="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /><In l="URL slug" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} placeholder="auto from name" /><In l="Category" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
            <Sel l="Ownership" value={edit.ownership} onChange={(v) => setEdit({ ...edit, ownership: v })} opts={['internal', 'client']} /><Sel l="Status" value={edit.status} onChange={(v) => setEdit({ ...edit, status: v })} opts={['live', 'in_development', 'prototype']} /><In l="Live link" value={edit.link ?? ''} onChange={(e) => setEdit({ ...edit, link: e.target.value })} />
            <div className="sm:col-span-2 lg:col-span-3"><Area l="Description (what it does)" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <Area l="Challenge" value={edit.challenge ?? ''} onChange={(e) => setEdit({ ...edit, challenge: e.target.value })} /><Area l="Solution" value={edit.solution ?? ''} onChange={(e) => setEdit({ ...edit, solution: e.target.value })} /><Area l="Technology (comma separated)" value={Array.isArray(edit.technology) ? edit.technology.join(', ') : edit.technology} onChange={(e) => setEdit({ ...edit, technology: e.target.value })} />
            <div className="sm:col-span-2"><Area l="Image URLs (one per line)" value={Array.isArray(edit.images) ? edit.images.join('\n') : edit.images} onChange={(e) => setEdit({ ...edit, images: e.target.value })} /><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImg(e.target.files[0])} className="mt-2 text-xs" /></div>
            <div className="space-y-3"><In l="Sort order" type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} /> Published</label></div>
          </div>
          {msg && <p className="mt-3 text-sm text-red-300">{msg}</p>}
          <div className="mt-4 flex gap-2"><Btn onClick={save}>Save</Btn><Btn kind="ghost" onClick={() => setEdit(null)}>Cancel</Btn>{edit.id && <Btn kind="danger" onClick={async () => { if (confirm('Delete this portfolio item?')) { await sb().from('portfolio_projects').delete().eq('id', edit.id); setEdit(null); load() } }}>Delete</Btn>}</div>
        </Card>
      )}
      {rows.length ? <div className="divide-y divide-line border border-line">{rows.map((r) => <button key={r.id} onClick={() => setEdit(r)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm hover:bg-surface"><span><b>{r.name}</b> <span className="text-mute">· {r.category} · {label(r.status)} · {label(r.ownership)}</span></span><span className={r.published ? 'text-emerald-300' : 'text-mute'}>{r.published ? 'Published' : 'Draft'}</span></button>)}</div> : <Empty t="No portfolio projects yet." />}
    </>
  )
}

function Contacts() {
  const [rows, setRows] = useState<Row[]>([])
  const load = () => sb().from('contacts').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
  useEffect(() => { load() }, [])
  return (<><H t="Contact messages" right={<Btn kind="ghost" onClick={() => toCSV(rows, 'contacts')}>Export CSV</Btn>} />
    {rows.length ? <div className="space-y-3">{rows.map((r) => <Card key={r.id} className={r.handled ? 'opacity-60' : ''}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{r.name} <a href={`mailto:${r.email}`} className="ml-2 text-sm font-normal text-accent">{r.email}</a></p>{r.subject && <p className="text-sm text-mute">{r.subject}</p>}</div><span className="text-xs text-mute">{fmtDT(r.created_at)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p><label className="mt-3 flex items-center gap-2 text-xs text-mute"><input type="checkbox" checked={r.handled} onChange={async () => { await sb().from('contacts').update({ handled: !r.handled }).eq('id', r.id); load() }} /> Handled</label></Card>)}</div> : <Empty t="No messages yet." />}</>)
}

function Settings() {
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState(''); const [email, setEmail] = useState('')
  const [notes, setNotes] = useState<Row[]>([])
  useEffect(() => { sb().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? '')); sb().from('notifications').select('*').order('created_at', { ascending: false }).limit(30).then(({ data }) => setNotes(data ?? [])) }, [])
  const change = async () => { if (pw.length < 10) return setMsg('Use at least 10 characters.'); const { error } = await sb().auth.updateUser({ password: pw }); setMsg(error ? error.message : 'Password updated.'); setPw('') }
  const enrollMfa = async () => { const { data, error } = await sb().auth.mfa.enroll({ factorType: 'totp' }); if (error) return setMsg(error.message); setMsg('Scan this QR in your authenticator app, then verify in the Supabase dashboard.'); const w = window.open(); w?.document.write(`<img src="${data.totp.qr_code}" />`) }
  return (
    <>
      <H t="Settings" sub={`Signed in as ${email}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h3 className="mb-3 text-sm font-semibold">Security</h3><In l="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><div className="mt-3 flex flex-wrap gap-2"><Btn onClick={change}>Update password</Btn><Btn kind="ghost" onClick={enrollMfa}>Enable 2-factor (TOTP)</Btn></div>{msg && <p className="mt-3 text-sm text-mute">{msg}</p>}<p className="mt-4 text-xs text-mute">Public admin registration is disabled. New admins can only be granted from the database.</p></Card>
        <Card><h3 className="mb-3 text-sm font-semibold">Notification log</h3><p className="mb-3 text-xs text-mute">Every submission is recorded here, even if an email notification fails.</p><ul className="max-h-80 space-y-2 overflow-auto">{notes.map((n) => <li key={n.id} className="flex justify-between gap-3 border-t border-line pt-2 text-sm"><span>{n.title}</span><span className="shrink-0 text-xs text-mute">{label(n.email_status)}</span></li>)}</ul></Card>
      </div>
    </>
  )
}
