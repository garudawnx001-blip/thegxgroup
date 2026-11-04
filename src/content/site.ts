export const SITE = {
  name: 'THE GX GROUP',
  url: 'https://thegxgroup.com',
  tagline: 'BUILD | LAUNCH | SCALE',
  email: 'hello@garudawnx.com',
  phone: '+91 77602 87733',
  phoneHref: '+917760287733',
  phone2: '+91 74118 29410',
  phone2Href: '+917411829410',
  whatsapp: 'https://wa.me/917760287733',
  instagram: 'https://www.instagram.com/thegxgroup',
  parent: { name: 'GarudawnX', url: 'https://garudawnx.com' },
  partnershipsEmail: 'partnerships@thegxgroup.com',
  projectsEmail: 'projects@thegxgroup.com',
  location: 'Bengaluru, Karnataka, India',
  description:
    'THE GX GROUP is a technology partnership company in Bengaluru. We build apps, web platforms, SaaS and AI products for founders and businesses — through equity partnerships or paid development.',
}

export type PageMeta = { title: string; description: string; path: string }
export const META: Record<string, PageMeta> = {
  '/': { path: '/', title: 'THE GX GROUP — App, Web, SaaS & AI Development Partner in Bengaluru', description: 'We partner with founders and businesses to build apps, web platforms, SaaS and AI products — via equity partnership with reduced fees, or paid development. Based in Bengaluru.' },
  '/about': { path: '/about', title: 'About THE GX GROUP — Technology Partnership Company', description: 'Who we are, what we believe and how THE GX GROUP partners with founders to turn viable ideas into technology products.' },
  '/capabilities': { path: '/capabilities', title: 'Capabilities — Apps, Web, SaaS, AI & Backend | THE GX GROUP', description: 'Mobile apps, websites and web apps, SaaS platforms, AI and automation, backend and infrastructure, product design and support.' },
  '/partnership-model': { path: '/partnership-model', title: 'Equity Partnership Model — Reduced Fee + Negotiated Equity | THE GX GROUP', description: 'How our technology-for-equity partnership works: reduced development fee, individually negotiated equity, defined support and selective evaluation.' },
  '/work': { path: '/work', title: 'Our Work — Selected Projects | THE GX GROUP', description: 'Selected real products and client projects built by THE GX GROUP, with clear status: live, in development or prototype.' },
  '/partner-with-us': { path: '/partner-with-us', title: 'Apply for a Technology Partnership | THE GX GROUP', description: 'Founders and startups: apply for a technology and equity partnership with THE GX GROUP. Five short steps.' },
  '/technology-services': { path: '/technology-services', title: 'Request a Project Consultation — Paid Development | THE GX GROUP', description: 'Hire THE GX GROUP for scoped, quoted development of apps, websites, SaaS, AI integrations and backend systems.' },
  '/contact': { path: '/contact', title: 'Contact THE GX GROUP', description: 'Get in touch with THE GX GROUP in Bengaluru for partnerships, projects or general enquiries.' },
  '/privacy-policy': { path: '/privacy-policy', title: 'Privacy Policy | THE GX GROUP', description: 'How THE GX GROUP collects, uses, stores and protects information submitted through this website.' },
  '/terms': { path: '/terms', title: 'Terms of Use | THE GX GROUP', description: 'Terms governing use of the THE GX GROUP website and submission of partnership or project enquiries.' },
}

export const CAPABILITIES = [
  { id: 'mobile', n: '01', title: 'Mobile Apps', short: 'Native-feel iOS & Android apps from one codebase.', deliver: ['iOS & Android apps', 'Store submission', 'Push, payments, maps'], tech: ['Flutter', 'React Native', 'Firebase'], use: 'Consumer apps, booking, delivery, field-staff tools.' },
  { id: 'web', n: '02', title: 'Web & Web Apps', short: 'Fast, search-ready websites and web applications.', deliver: ['Marketing sites', 'Customer portals', 'Dashboards'], tech: ['React', 'Next.js', 'Vue', 'Tailwind'], use: 'Brand sites, lead-gen, internal tools, portals.' },
  { id: 'saas', n: '03', title: 'SaaS Platforms', short: 'Multi-tenant products with billing and roles.', deliver: ['Subscriptions & billing', 'Roles & permissions', 'Admin consoles'], tech: ['PostgreSQL', 'Supabase', 'Stripe / Razorpay'], use: 'Vertical SaaS, marketplaces, B2B platforms.' },
  { id: 'ai', n: '04', title: 'AI & Automation', short: 'LLM features and workflows that remove manual work.', deliver: ['AI assistants & search', 'Document processing', 'Workflow automation'], tech: ['LLM APIs', 'RAG', 'n8n / scripts'], use: 'Support bots, lead triage, report generation.' },
  { id: 'backend', n: '05', title: 'Backend & Infra', short: 'Secure APIs, data and cloud that hold up under load.', deliver: ['REST / GraphQL APIs', 'Auth & data security', 'CI/CD & monitoring'], tech: ['Node.js', 'PostgreSQL', 'Cloud hosting'], use: 'Integrations, payments, scaling an MVP.' },
  { id: 'design', n: '06', title: 'Design & Support', short: 'Product design up front, technical support after launch.', deliver: ['UX research & UI', 'Design systems', 'Maintenance & SLAs'], tech: ['Figma', 'Analytics', 'Sentry'], use: 'New products, redesigns, ongoing care.' },
]

export const FAQS = [
  { q: 'What does THE GX GROUP do?', a: 'THE GX GROUP is a technology partnership company in Bengaluru. We design and build apps, web platforms, SaaS and AI products for founders and businesses.' },
  { q: 'How does the equity partnership work?', a: 'For selected ventures we reduce our development fee in exchange for an equity stake. The percentage is negotiated individually, and responsibilities, support and costs are set out in a separate legal agreement.' },
  { q: 'Can I just hire you for paid development?', a: 'Yes. Request a project consultation and we will scope the work, send a commercial quotation with milestones, and offer maintenance as a separate agreement.' },
  { q: 'Is every partnership application accepted?', a: 'No. Applications are evaluated selectively on viability, founder commitment and technical fit. Submitting an application does not create any agreement.' },
  { q: 'Who pays for third-party costs like hosting or app stores?', a: 'Third-party costs such as hosting, licences and store fees are allocated separately and agreed in writing before work starts.' },
]

export const PARTNERSHIP_POINTS = [
  { t: 'Reduced fee', d: 'Development fee lowered where commercially viable.' },
  { t: 'Negotiated equity', d: 'Equity percentage agreed individually — never a fixed number.' },
  { t: 'Defined responsibilities', d: 'Technical scope written into a formal agreement.' },
  { t: 'Bounded support', d: 'Ongoing support with clear, agreed limits.' },
  { t: 'Separate third-party costs', d: 'Hosting, licences and stores allocated separately.' },
  { t: 'Selective evaluation', d: 'We take on a limited number of ventures.' },
]

export const PROCESS = [
  { k: 'BUILD', t: 'Shape & engineer', d: 'We validate scope, design the product and engineer it on a production-grade stack.' },
  { k: 'LAUNCH', t: 'Ship to market', d: 'Testing, store and domain setup, analytics and a clean go-live.' },
  { k: 'SCALE', t: 'Grow with you', d: 'Iterate on real usage, harden infrastructure and support growth.' },
]

export const PARTNERSHIP_STATUSES = ['new', 'under_review', 'shortlisted', 'contacted', 'meeting_scheduled', 'proposal_sent', 'accepted', 'rejected', 'on_hold'] as const
export const SERVICE_STATUSES = ['new', 'reviewing', 'requirement_discussion', 'quotation_preparation', 'quotation_sent', 'negotiation', 'won', 'lost', 'on_hold'] as const
export const PROJECT_TYPES = ['Mobile application', 'Website', 'Web application', 'SaaS', 'AI integration', 'Automation', 'E-commerce', 'API and backend', 'UI/UX design', 'Other']
export const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
