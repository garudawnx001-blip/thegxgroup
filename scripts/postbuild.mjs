// Pre-renders every public route to static HTML with unique SEO/AEO metadata + structured data,
// then writes sitemap.xml, robots.txt, llms.txt and the GitHub Pages 404 fallback.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = path.resolve('dist')
const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
const site = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
const { SITE, META, FAQS, CAPABILITIES } = site
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const today = new Date().toISOString().slice(0, 10)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// published portfolio from the database (public, RLS-filtered)
let portfolio = []
try {
  const r = await fetch('https://bksrlahkyatytjrizmqu.supabase.co/rest/v1/portfolio_projects?select=*&published=eq.true&order=sort_order', { headers: { apikey: 'sb_publishable_GHXSGgJE8iEDdnAovLCN9g_CzEYeP0l' } })
  if (r.ok) portfolio = await r.json()
} catch { /* offline build */ }
// fallback: snapshot of published projects (kept in the repo; refresh when the portfolio changes)
if (!portfolio.length) { try { portfolio = JSON.parse(fs.readFileSync(path.resolve('scripts/portfolio.snapshot.json'), 'utf8')) } catch { /* none */ } }
globalThis.__GX_PF = portfolio // SSR renders real case-study content
const pfScript = portfolio.length ? `<script>window.__GX_PF=${JSON.stringify(portfolio).replace(/</g, '\\u003c')}</script>` : ''

const ORG_ID = `${SITE.url}/#organization`
const org = {
  '@type': ['Organization', 'ProfessionalService'], '@id': ORG_ID, name: SITE.name, alternateName: ['The GX Group', 'GX Group'], url: SITE.url + '/',
  logo: { '@type': 'ImageObject', url: `${SITE.url}/brand/logo-900.png`, width: 600, height: 178 }, image: `${SITE.url}/brand/og.jpg`,
  slogan: 'Build | Launch | Scale',
  parentOrganization: { '@type': 'Organization', name: 'GarudawnX', url: 'https://garudawnx.com', logo: `${SITE.url}/garudawnx-mark.webp` }, description: SITE.description, email: SITE.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
  areaServed: [{ '@type': 'Country', name: 'India' }, 'Worldwide'],
  sameAs: [SITE.instagram, 'https://garudawnx.com'],
  knowsAbout: ['Mobile app development', 'Web application development', 'SaaS development', 'AI and automation', 'Backend engineering', 'Product design', 'Technology equity partnerships'],
  telephone: [SITE.phone, SITE.phone2],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: SITE.email, telephone: SITE.phone, areaServed: 'IN', availableLanguage: ['English', 'Kannada', 'Hindi'] }, { '@type': 'ContactPoint', contactType: 'customer support', telephone: SITE.phone2, areaServed: 'IN', availableLanguage: ['English', 'Kannada', 'Hindi'] }],
}
const website = { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: SITE.url + '/', name: SITE.name, publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' }
const faqLd = (items) => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
const crumbs = (p, title) => ({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' }, ...(p === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title, item: SITE.url + p }])] })
const PM_FAQ = [
  { q: 'Do you publish a fixed equity percentage?', a: 'No. Equity is negotiated individually based on the venture, scope, risk and the reduced fee.' },
  { q: 'Does applying guarantee a partnership?', a: 'No. Applications are evaluated selectively. Any partnership is created only by a signed legal agreement, never by this website.' },
  { q: 'What happens after I apply?', a: 'We review your application, may shortlist it, contact you for a meeting and, if there is a fit, send a written proposal.' },
]
const service = (name, desc, p) => ({ '@type': 'Service', name, description: desc, provider: { '@id': ORG_ID }, areaServed: 'IN', url: SITE.url + p })

const SHORT = { '/': 'Home', '/about': 'About', '/capabilities': 'Capabilities', '/partnership-model': 'Partnership Model', '/work': 'Our Work', '/partner-with-us': 'Partner With Us', '/technology-services': 'Technology Services', '/contact': 'Contact', '/privacy-policy': 'Privacy Policy', '/terms': 'Terms' }
function graphFor(p, m) {
  const g = [org, website, { '@type': p === '/about' ? 'AboutPage' : p === '/contact' ? 'ContactPage' : 'WebPage', '@id': SITE.url + p + '#webpage', url: SITE.url + p, name: m.title, description: m.description, isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': ORG_ID }, inLanguage: 'en-IN', dateModified: today }, crumbs(p, SHORT[p] ?? m.title)]
  if (p === '/') g.push(faqLd(FAQS))
  if (p === '/partnership-model') g.push(faqLd(PM_FAQ), service('Technology & equity partnership', 'Product development at a reduced fee in exchange for individually negotiated equity, with defined support.', p))
  if (p === '/technology-services') g.push(service('Paid technology development', 'Scoped, quoted development of mobile apps, websites, web apps, SaaS, AI integrations and backends with agreed milestones.', p))
  if (p === '/capabilities') g.push({ '@type': 'ItemList', name: 'Capabilities', itemListElement: CAPABILITIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: service(c.title, `${c.short} Deliverables: ${c.deliver.join(', ')}. Technologies: ${c.tech.join(', ')}.`, `/capabilities#${c.id}`) })) })
  return { '@context': 'https://schema.org', '@graph': g }
}

function head(p, m, extraLd, ogImg) {
  const url = SITE.url + (p === '/' ? '/' : p)
  const ld = extraLd ?? graphFor(p, m)
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="en-in" href="${url}" />`, `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta name="geo.region" content="IN-KA" />`, `<meta name="geo.placename" content="Bengaluru" />`,
    `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />`,
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="THE GX GROUP" />`, `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`, `<meta property="og:description" content="${esc(m.description)}" />`, `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${ogImg ?? SITE.url + '/brand/og.jpg'}" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`, `<meta property="og:image:alt" content="${ogImg ? esc(m.title) : 'THE GX GROUP — Build, Launch, Scale'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${esc(m.title)}" />`, `<meta name="twitter:description" content="${esc(m.description)}" />`, `<meta name="twitter:image" content="${ogImg ?? SITE.url + '/brand/og.jpg'}" />`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`, pfScript,
  ].join('\n    ')
}

const write = (p, html) => { const f = p === '/' ? path.join(DIST, 'index.html') : path.join(DIST, p.replace(/^\//, '') + '.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html) }
const page = (url, headHtml) => template.replace('<!--head-->', headHtml).replace('<!--app-->', render(url))

const routes = Object.keys(META)
for (const p of routes) write(p, page(p, head(p, META[p])))
for (const w of portfolio) {
  const p = `/work/${w.slug}`; const m = { title: `${w.name} — ${w.category} | THE GX GROUP`, description: String(w.description).slice(0, 155) }
  const abs = (u) => (u?.startsWith('/') ? SITE.url + u : u)
  const og = fs.existsSync(path.join(DIST, 'media', w.slug, 'og.jpg')) ? `${SITE.url}/media/${w.slug}/og.jpg` : abs(w.images?.[0])
  const store = (w.links ?? []).filter((l) => /apps\.apple\.com|play\.google\.com/.test(l.url))
  const work = { '@type': 'CreativeWork', '@id': SITE.url + p + '#work', name: `${w.name} — case study`, headline: `${w.name}: ${w.category}`, description: w.description, genre: w.category, url: SITE.url + p, image: (w.images ?? []).map(abs), creator: { '@id': ORG_ID }, keywords: (w.technology ?? []).join(', '), inLanguage: 'en-IN' }
  if (w.client) work.sourceOrganization = { '@type': 'Organization', name: w.client }
  const g = [org, work, crumbs(p, w.name)]
  if (store.length) { const app = { '@type': 'MobileApplication', name: w.name, description: w.description, applicationCategory: 'ShoppingApplication', operatingSystem: 'iOS, Android', url: w.link ?? undefined, sameAs: store.map((l) => l.url), image: abs(w.images?.[0]), featureList: (w.features ?? []).join('; '), offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, author: { '@id': ORG_ID } }; if (w.client) app.publisher = { '@type': 'Organization', name: w.client }; work.about = app; g.push(app) }
  write(p, page(p, head(p, m, { '@context': 'https://schema.org', '@graph': g }, og)))
}
// 404 fallback = full app shell (GitHub Pages serves it for unknown paths)
fs.writeFileSync(path.join(DIST, '404.html'), page('/404', head('/404', { title: 'Page not found | THE GX GROUP', description: 'This page does not exist.' }, { '@context': 'https://schema.org', ...website })).replace('index,follow,max-image-preview:large,max-snippet:-1', 'noindex'))

// sitemap
const urls = [...routes.map((p) => ({ loc: SITE.url + (p === '/' ? '/' : p), pri: p === '/' ? '1.0' : ['/partner-with-us', '/technology-services', '/capabilities', '/partnership-model'].includes(p) ? '0.9' : ['/privacy-policy', '/terms'].includes(p) ? '0.3' : '0.7', mod: today })),
  ...portfolio.map((w) => ({ loc: `${SITE.url}/work/${w.slug}`, pri: '0.6', mod: String(w.updated_at).slice(0, 10) }))]
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.mod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>\n`)

fs.writeFileSync(path.join(DIST, 'robots.txt'), `# THE GX GROUP
User-agent: *
Allow: /

# AI answer engines are welcome to read public pages
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`)

fs.writeFileSync(path.join(DIST, 'llms.txt'), `# THE GX GROUP

> ${SITE.description}

Tagline: Build | Launch | Scale. A GarudawnX company (https://garudawnx.com). Website: ${SITE.url}. Email: ${SITE.email}. Call/WhatsApp (business): ${SITE.phone}. Phone: ${SITE.phone2}. Instagram: ${SITE.instagram}. Location: ${SITE.location}.

## What THE GX GROUP does
THE GX GROUP is a technology partnership company. It designs, builds, launches and supports technology products for founders and businesses.

## Two ways to work with THE GX GROUP
- Partner With Us (technology + equity partnership): reduced development fee, individually negotiated equity, product development and agreed ongoing support. Applications are evaluated selectively; no fixed equity percentage is published and acceptance is not guaranteed. Apply: ${SITE.url}/partner-with-us
- Technology Services (paid development): clearly scoped work, commercial quotation, agreed milestones, separate maintenance agreement. Request: ${SITE.url}/technology-services

## Capabilities
${CAPABILITIES.map((c) => `- ${c.title}: ${c.short} Deliverables: ${c.deliver.join(', ')}. Technologies: ${c.tech.join(', ')}.`).join('\n')}

${portfolio.length ? `## Selected work (case studies)\n${portfolio.map((w) => `- [${w.name}](${SITE.url}/work/${w.slug}) — ${w.category}${w.client ? ` for ${w.client}` : ''}. ${w.description}${w.features?.length ? ` Key features: ${w.features.join('; ')}.` : ''}`).join('\n')}\n\n` : ''}## Frequently asked questions
${[...FAQS, ...PM_FAQ].map((f) => `- Q: ${f.q}\n  A: ${f.a}`).join('\n')}

## Pages
${routes.map((p) => `- [${SHORT[p]}](${SITE.url}${p === '/' ? '/' : p}): ${META[p].description}`).join('\n')}
`)
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true })
console.log(`Pre-rendered ${routes.length + portfolio.length} pages + 404, sitemap, robots, llms.txt`)
