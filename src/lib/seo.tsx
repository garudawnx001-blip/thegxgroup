import { useEffect } from 'react'
import { META, SITE } from '../content/site'
/** Client-side head sync. The static build also writes these tags into each pre-rendered HTML file. */
export function useMeta(path: string, override?: { title?: string; description?: string }) {
  useEffect(() => {
    const m = META[path] ?? { title: SITE.name, description: SITE.description, path }
    const title = override?.title ?? m.title
    const desc = override?.description ?? m.description
    document.title = title
    const set = (sel: string, attr: string, val: string) => { const el = document.head.querySelector(sel); if (el) el.setAttribute(attr, val) }
    set('meta[name="description"]', 'content', desc)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', desc)
    set('link[rel="canonical"]', 'href', SITE.url + (path === '/' ? '/' : path))
    set('meta[property="og:url"]', 'content', SITE.url + (path === '/' ? '/' : path))
  }, [path, override?.title, override?.description])
}
