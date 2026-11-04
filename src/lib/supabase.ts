export const SUPABASE_URL = 'https://bksrlahkyatytjrizmqu.supabase.co'
// Publishable key: safe for browsers. All tables are locked by Row Level Security.
export const SUPABASE_KEY = 'sb_publishable_GHXSGgJE8iEDdnAovLCN9g_CzEYeP0l'
/** Database client, loaded on demand so public pages don't download it up front. */
export const db = () => import('./sb').then((m) => m.sb())

export async function uploadFiles(kind: 'partnership' | 'service', files: { file: File; kind?: string }[]) {
  const folder = crypto.randomUUID()
  const out: { path: string; name: string; size: number; kind?: string }[] = []
  for (const { file, kind: k } of files) {
    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-120)
    const path = `${kind}/${folder}/${Date.now()}_${safe}`
    const { error } = await (await db()).storage.from('uploads').upload(path, file, { upsert: false, contentType: file.type })
    if (error) throw new Error(`Upload failed for ${file.name}`)
    out.push({ path, name: file.name, size: file.size, kind: k })
  }
  return out
}

export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  w.gtag?.('event', event, params)
}
