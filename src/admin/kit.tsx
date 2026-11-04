import { type ReactNode } from 'react'
import { label } from '../content/site'

export const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
export const fmtDT = (s?: string | null) => (s ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')

export function H({ t, sub, right }: { t: string; sub?: string; right?: ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t}</h1>{sub && <p className="mt-1 text-sm text-mute">{sub}</p>}</div>{right}</div>
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border border-line bg-surface p-5 ${className}`}>{children}</div>
}
const TONE: Record<string, string> = { new: 'bg-accent/15 text-accent', accepted: 'bg-emerald-500/15 text-emerald-300', won: 'bg-emerald-500/15 text-emerald-300', rejected: 'bg-red-500/15 text-red-300', lost: 'bg-red-500/15 text-red-300', on_hold: 'bg-amber-500/15 text-amber-300' }
export function Badge({ s }: { s: string }) {
  return <span className={`inline-block whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold ${TONE[s] ?? 'bg-elev text-mute'}`}>{label(s)}</span>
}
export const inputCls = 'w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent'
export function In(props: React.InputHTMLAttributes<HTMLInputElement> & { l?: string }) {
  const { l, ...r } = props
  return <label className="block text-xs text-mute">{l}<input {...r} className={`${inputCls} mt-1.5 text-ink`} /></label>
}
export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { l?: string }) {
  const { l, ...r } = props
  return <label className="block text-xs text-mute">{l}<textarea rows={3} {...r} className={`${inputCls} mt-1.5 text-ink`} /></label>
}
export function Sel({ l, value, onChange, opts }: { l?: string; value: string; onChange: (v: string) => void; opts: readonly string[] }) {
  return <label className="block text-xs text-mute">{l}<select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} mt-1.5 text-ink`}>{opts.map((o) => <option key={o} value={o}>{label(o)}</option>)}</select></label>
}
export function Btn({ children, onClick, kind = 'primary', type = 'button', disabled }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean }) {
  const c = kind === 'primary' ? 'bg-ink text-bg hover:bg-accent hover:text-ink' : kind === 'danger' ? 'border border-red-500/40 text-red-300 hover:bg-red-500/10' : 'border border-line hover:border-ink/50'
  return <button type={type} disabled={disabled} onClick={onClick} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 ${c}`}>{children}</button>
}
export function KV({ k, v }: { k: string; v?: ReactNode }) {
  return <div className="border-t border-line py-3"><dt className="text-[11px] uppercase tracking-wider text-mute">{k}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{v || '—'}</dd></div>
}
export function Empty({ t }: { t: string }) { return <p className="border border-dashed border-line px-4 py-10 text-center text-sm text-mute">{t}</p> }

export function toCSV(rows: Record<string, unknown>[], name: string) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => { const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
}
