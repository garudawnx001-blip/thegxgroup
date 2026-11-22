// Search-intent landing pages. Each one answers a specific question founders and businesses search for,
// in plain words, with the facts already published elsewhere on this site. No invented numbers.
export type Landing = {
  path: string
  short: string
  title: string
  description: string
  keywords: string
  eyebrow: string
  h1: [string, string]
  answer: string
  points: { t: string; d: string }[]
  table?: { head: string[]; rows: string[][] }
  faqs: { q: string; a: string }[]
  service: string
  cta: 'partner' | 'services'
}

export const LANDINGS: Landing[] = [
  {
    path: '/pitch-your-startup-idea', short: 'Pitch Your Startup Idea', cta: 'partner', service: 'Startup idea pitch and technology partnership',
    title: 'Pitch Your Startup Idea — Get a Tech Team to Build It | The GX Group',
    description: 'Have a startup idea but no tech team? Pitch it to The GX Group. If we see the potential, we partner with you — you bring the vision, we bring the technology.',
    keywords: 'pitch your startup idea, pitch my idea, submit startup idea India, I have an idea but no tech team, build my startup idea, startup idea to app',
    eyebrow: 'FOR FOUNDERS', h1: ['You have the idea.', 'We have the team.'],
    answer: 'If you have a startup idea but no technology team, you can pitch it to The GX Group. We review every pitch, and if we see the potential we partner with you: you bring the vision and the business, and we bring the technology — design, engineering, launch and support for apps, websites and any tech-driven product.',
    points: [
      { t: 'Pitch in five short steps', d: 'Tell us about you, the idea, the market, what stage you are at and what you need from us.' },
      { t: 'We review every pitch', d: 'Pitches are evaluated selectively on viability, founder commitment and technical fit.' },
      { t: 'If we see the potential', d: 'We meet you, shape the scope together and send a written proposal.' },
      { t: 'We will partner with you', d: 'For selected ventures we lower our development fee in exchange for negotiated equity.' },
      { t: 'We will build it for you', d: 'Apps, websites, SaaS platforms, AI features — built on a production-grade stack.' },
      { t: 'Or simply hire us', d: 'Prefer a straightforward paid build? Ask for a scoped quotation instead.' },
    ],
    faqs: [
      { q: 'How do I pitch my startup idea to The GX Group?', a: 'Open the Partner With Us page on thegxgroup.com and complete the five-step application. It asks about you, your idea, the market, your current stage and what you need. You can also message @thegxgroup on Instagram or WhatsApp +91 77602 87733.' },
      { q: 'I have an idea but no technical skills. Can I still apply?', a: 'Yes. The partnership exists for founders who have the idea and the business drive but no technology team. The GX Group provides the product strategy, design and engineering.' },
      { q: 'What happens after I pitch?', a: 'We review your application, may shortlist it, contact you for a meeting and, if there is a fit, send a written proposal. Applying does not create any agreement.' },
      { q: 'Does every idea get accepted?', a: 'No. The GX Group takes on a limited number of ventures. If a partnership is not the right fit, paid development is still available through Technology Services.' },
    ],
  },
  {
    path: '/tech-partner-for-startups', short: 'Tech Partner for Startups', cta: 'partner', service: 'Technology partner for startups',
    title: 'Technology Partner for Startups in India — Build Your Product | The GX Group',
    description: 'The GX Group is a technology partner for startups and founders in India and worldwide: product strategy, design, engineering, launch and support — paid, or for negotiated equity.',
    keywords: 'technology partner for startups, tech partner for startups India, startup tech partner Bangalore, startup technology partner, tech team for startup, product development partner',
    eyebrow: 'TECH PARTNER', h1: ['A technology partner', 'for startups.'],
    answer: 'The GX Group is a technology partner for startups and founders in India and worldwide. You bring the idea and the business; we bring the product team — strategy, design, engineering, launch and support. You can work with us as paid development or, for selected ventures, at a reduced fee in exchange for negotiated equity.',
    points: [
      { t: 'One product team', d: 'Strategy, UI/UX, mobile, web, backend and AI under one roof — not a chain of freelancers.' },
      { t: 'Idea to launch', d: 'We validate scope, design the product, engineer it, and take it live on the stores and the web.' },
      { t: 'Two ways to engage', d: 'An equity partnership for selected ventures, or scoped and quoted paid development.' },
      { t: 'Everything in writing', d: 'Scope, fees, equity, support and third-party costs are agreed before work starts.' },
      { t: 'Based in Bengaluru, works worldwide', d: 'We work remotely with founders across India and abroad.' },
      { t: 'Support after launch', d: 'We iterate on real usage, harden infrastructure and support growth within agreed limits.' },
    ],
    faqs: [
      { q: 'What is a technology partner for a startup?', a: 'A technology partner is a company that takes responsibility for building and running a startup\'s product — design, engineering, launch and support — so the founders can focus on customers and growth. The GX Group plays this role for startups in India and worldwide.' },
      { q: 'How is a technology partner different from a software agency?', a: 'An agency delivers a project and leaves. A technology partner stays involved after launch and, in an equity partnership, shares the upside and the risk. The GX Group offers both models: an equity partnership for selected ventures and paid development for everyone else.' },
      { q: 'Do I still need a technical co-founder?', a: 'Not necessarily. Many non-technical founders use a technology partner in place of a technical co-founder, at least until the product is live and the company can hire its own team.' },
      { q: 'How do I start working with The GX Group?', a: 'Apply through Partner With Us for an equity partnership, or request a quotation through Technology Services. You can also call or WhatsApp +91 77602 87733.' },
    ],
  },
  {
    path: '/app-development-for-equity', short: 'App Development for Equity', cta: 'partner', service: 'App development for equity',
    title: 'App Development for Equity in India — Tech Partner for a Stake | The GX Group',
    description: 'For selected startups, The GX Group builds apps, web platforms and SaaS at a reduced fee in exchange for individually negotiated equity, under a written agreement.',
    keywords: 'app development for equity, build app for equity India, sweat equity developers, developers for equity, equity based tech partner, tech for equity, software development for equity',
    eyebrow: 'EQUITY PARTNERSHIP', h1: ['App development', 'for equity.'],
    answer: 'Yes — for selected startups, The GX Group builds apps, web platforms and SaaS products at a reduced development fee in exchange for an individually negotiated equity stake. It is selective, third-party costs such as hosting and store fees are allocated separately, and every partnership is set out in a written legal agreement.',
    points: [
      { t: 'Reduced fee', d: 'Our development fee is lowered where the venture is commercially viable.' },
      { t: 'Negotiated equity', d: 'The percentage is agreed individually — there is no fixed number.' },
      { t: 'Defined responsibilities', d: 'Technical scope is written into a formal agreement.' },
      { t: 'Bounded support', d: 'Ongoing support continues after launch, within clear agreed limits.' },
      { t: 'Separate third-party costs', d: 'Hosting, licences and app-store fees are allocated separately.' },
      { t: 'Selective evaluation', d: 'We take on a limited number of ventures at a time.' },
    ],
    table: { head: ['', 'Equity partnership', 'Paid development'], rows: [
      ['Development fee', 'Reduced', 'Quoted for the agreed scope'],
      ['Equity', 'Individually negotiated', 'None'],
      ['Who it suits', 'Founders building a venture', 'Businesses and funded teams'],
      ['Acceptance', 'Selective', 'Open to any scoped project'],
      ['After launch', 'Agreed ongoing support', 'Separate maintenance agreement'],
      ['How to start', 'Apply through Partner With Us', 'Request a quotation'],
    ] },
    faqs: [
      { q: 'Will a company build my app in exchange for equity?', a: 'Some will. The GX Group, a technology partner in Bengaluru, builds products for selected startups at a reduced fee in exchange for negotiated equity. Applications are reviewed for viability, founder commitment and technical fit.' },
      { q: 'Is it equity only, with no cash at all?', a: 'The model is a reduced development fee plus negotiated equity, not a guaranteed zero-cash build. Third-party costs such as hosting, licences and store fees are always allocated separately. Each venture is assessed individually.' },
      { q: 'How much equity does The GX Group take?', a: 'There is no published percentage. Equity is negotiated individually based on the venture, the scope, the risk and how far the fee is reduced.' },
      { q: 'What if my application is not selected?', a: 'You can still hire The GX Group for paid development through Technology Services, with a scoped quotation and agreed milestones.' },
    ],
  },
  {
    path: '/technical-co-founder-alternative', short: 'Technical Co-Founder Alternative', cta: 'partner', service: 'Technical co-founder alternative for non-technical founders',
    title: 'Technical Co-Founder Alternative for Non-Technical Founders | The GX Group',
    description: 'Cannot find a technical co-founder? The GX Group acts as your product and engineering team — for negotiated equity or as paid development — so you can launch without one.',
    keywords: 'technical co-founder alternative, tech co-founder India, find technical co-founder Bangalore, non technical founder, startup without technical co-founder, CTO as a service India',
    eyebrow: 'NON-TECHNICAL FOUNDERS', h1: ['No technical co-founder?', 'Build anyway.'],
    answer: 'If you are a non-technical founder who cannot find a technical co-founder, The GX Group can be your product and engineering team instead. We design, build, launch and support the product — as an equity partnership for selected ventures or as paid development — so the lack of a co-founder does not stop you from launching.',
    points: [
      { t: 'A team, not one person', d: 'Design, mobile, web, backend and AI skills together, instead of depending on a single hire.' },
      { t: 'Skin in the game', d: 'In an equity partnership we share the upside, like a co-founder would.' },
      { t: 'Clear decisions', d: 'We explain technical choices in plain language so you stay in control of the product.' },
      { t: 'Production-grade from day one', d: 'Security, performance and a codebase your future team can take over.' },
      { t: 'Launch support', d: 'Store submission, domain, analytics and a clean go-live.' },
      { t: 'Room to hire later', d: 'Once the product is live, you can build an in-house team at your own pace.' },
    ],
    table: { head: ['', 'Technical co-founder', 'Freelancers', 'The GX Group'], rows: [
      ['Time to start', 'Months of searching', 'Days', 'After review and a written proposal'],
      ['Skills covered', 'One person', 'One skill each', 'Design, apps, web, backend, AI'],
      ['Upfront cost', 'Low', 'Paid per task', 'Reduced fee or quoted fee'],
      ['Equity', 'Large founder share', 'None', 'Negotiated, or none if paid'],
      ['After launch', 'Stays', 'Usually leaves', 'Agreed ongoing support'],
    ] },
    faqs: [
      { q: 'Can I build a startup without a technical co-founder?', a: 'Yes. Many founders launch with a technology partner or a development company instead of a technical co-founder, then hire an in-house team once the product has users. The GX Group works with non-technical founders in exactly this way.' },
      { q: 'Is a technology partner the same as a CTO?', a: 'Not exactly. A CTO is an individual inside your company. A technology partner such as The GX Group is a separate company that provides the whole product team and, in an equity partnership, shares in the outcome.' },
      { q: 'Who owns the code and the product?', a: 'Ownership of code and intellectual property is defined in the written agreement for each engagement, before development starts.' },
      { q: 'What should I prepare before I approach you?', a: 'A clear description of the problem, who it is for, how the business would make money, what you have done so far and what you need from a technology team.' },
    ],
  },
  {
    path: '/mvp-development-bangalore', short: 'MVP Development in Bengaluru', cta: 'services', service: 'MVP development for startups',
    title: 'MVP Development Company in Bengaluru (Bangalore) for Startups | The GX Group',
    description: 'The GX Group builds MVPs for startups from Bengaluru: mobile apps, web apps and SaaS scoped to the smallest testable version, with milestones agreed in writing.',
    keywords: 'MVP development company Bangalore, MVP development Bengaluru, MVP development for startups India, build MVP, startup MVP developers, minimum viable product development',
    eyebrow: 'MVP DEVELOPMENT', h1: ['MVP development', 'in Bengaluru.'],
    answer: 'The GX Group builds MVPs — minimum viable products — for startups from Bengaluru, India. We scope the smallest version of your app, web app or SaaS that can be tested with real users, design and engineer it on a production-grade stack, launch it, and agree milestones and timelines in writing before development starts.',
    points: [
      { t: 'Scope the core', d: 'We cut the idea down to the features that prove the business, and leave the rest for later.' },
      { t: 'Design first', d: 'UX flows and UI in Figma before any code, so you see the product early.' },
      { t: 'Build on a real stack', d: 'Flutter or React Native for apps; React, Next.js and Supabase or PostgreSQL for web and SaaS.' },
      { t: 'Launch properly', d: 'Testing, App Store and Play Store setup, domain, analytics and a clean go-live.' },
      { t: 'Learn and iterate', d: 'We improve the product from real usage instead of guesses.' },
      { t: 'Ready to scale', d: 'An MVP that can grow into the full product without a rewrite.' },
    ],
    faqs: [
      { q: 'What is an MVP?', a: 'An MVP, or minimum viable product, is the smallest working version of a product that real users can try. It lets a startup test demand and learn before investing in the full build.' },
      { q: 'How long does it take to build an MVP?', a: 'Most MVPs take a few weeks to a few months depending on scope. The GX Group agrees milestones and timelines in writing before development starts.' },
      { q: 'How much does MVP development cost in India?', a: 'It depends on the scope, platforms and features, so The GX Group quotes each MVP individually after a free consultation. Selected startups can lower the fee through the equity partnership.' },
      { q: 'Which technologies do you use for MVPs?', a: 'Typically Flutter or React Native for mobile apps, React, Next.js or Vue for web, and Node.js with PostgreSQL or Supabase for the backend, with Stripe or Razorpay for payments.' },
    ],
  },
  {
    path: '/mobile-app-development-bangalore', short: 'Mobile App Development in Bengaluru', cta: 'services', service: 'Mobile app development (iOS and Android)',
    title: 'Mobile App Development Company in Bengaluru — iOS & Android | The GX Group',
    description: 'iOS and Android app development by The GX Group, Bengaluru: Flutter and React Native apps with payments, push, maps and store submission, for startups and businesses.',
    keywords: 'mobile app development company Bangalore, app developers Bengaluru, iOS app development Bangalore, Android app development company India, Flutter app development, React Native developers',
    eyebrow: 'MOBILE APPS', h1: ['Mobile app development', 'in Bengaluru.'],
    answer: 'The GX Group is a mobile app development company in Bengaluru, India. We design and build iOS and Android apps from a single codebase using Flutter or React Native — including payments, push notifications, maps and App Store and Google Play submission — for startups and businesses in India and worldwide.',
    points: [
      { t: 'iOS and Android together', d: 'One codebase, native feel on both platforms.' },
      { t: 'Consumer and business apps', d: 'Booking, delivery, commerce, live shopping and field-staff tools.' },
      { t: 'Payments, push and maps', d: 'The integrations real apps need, built in.' },
      { t: 'Store submission', d: 'We handle App Store and Google Play listing and review.' },
      { t: 'Backend included', d: 'Secure APIs, authentication and data that hold up under load.' },
      { t: 'Support after launch', d: 'Maintenance and updates under a separate agreement.' },
    ],
    faqs: [
      { q: 'Do you build both iOS and Android apps?', a: 'Yes. The GX Group builds iOS and Android apps from one codebase using Flutter or React Native, and handles submission to the App Store and Google Play.' },
      { q: 'Should I choose Flutter or React Native?', a: 'Both produce high-quality iOS and Android apps from one codebase. The choice depends on your features, existing code and team. We recommend one after understanding the product.' },
      { q: 'Which apps has The GX Group worked on?', a: 'Apex Swipe, a live-commerce app where shoppers swipe to bid, is a technology partnership of The GX Group. The case study is at thegxgroup.com/work/apex-swipe.' },
      { q: 'Do you work with clients outside Bengaluru?', a: 'Yes. The GX Group is based in Bengaluru and works remotely with founders and businesses across India and worldwide.' },
    ],
  },
  {
    path: '/web-development-bangalore', short: 'Web Development in Bengaluru', cta: 'services', service: 'Website and web application development',
    title: 'Website & Web App Development Company in Bengaluru | The GX Group',
    description: 'Fast, search-ready websites, customer portals, dashboards and web apps by The GX Group, Bengaluru — built with React, Next.js, Vue and Tailwind.',
    keywords: 'web development company Bangalore, website development Bengaluru, web app development company India, React developers Bangalore, Next.js development, business website developers',
    eyebrow: 'WEB & WEB APPS', h1: ['Website and web app', 'development.'],
    answer: 'The GX Group builds websites and web applications from Bengaluru, India: fast, search-ready marketing sites, customer portals, dashboards and internal tools, using React, Next.js, Vue and Tailwind. Each project is scoped, quoted with milestones and can be maintained under a separate agreement.',
    points: [
      { t: 'Marketing websites', d: 'Brand and lead-generation sites built to load fast and be found on search.' },
      { t: 'Web applications', d: 'Customer portals, dashboards and internal tools.' },
      { t: 'Search and answer-engine ready', d: 'Clean structure, metadata and structured data from the start.' },
      { t: 'Modern stack', d: 'React, Next.js, Vue and Tailwind on reliable cloud hosting.' },
      { t: 'Connected', d: 'Payments, CRMs, WhatsApp, analytics and other integrations.' },
      { t: 'Maintained', d: 'Updates and support under a separate maintenance agreement.' },
    ],
    faqs: [
      { q: 'What kinds of websites does The GX Group build?', a: 'Marketing and brand websites, lead-generation sites, customer portals, dashboards, internal tools and full web applications.' },
      { q: 'Will my website be optimised for search engines?', a: 'Yes. Sites are built with clean structure, fast loading, metadata and structured data so that search engines and AI answer engines can read them.' },
      { q: 'How much does a website cost?', a: 'Every website is quoted individually after a free consultation, based on pages, features and integrations.' },
      { q: 'Can you redesign or rebuild an existing website?', a: 'Yes. The GX Group takes on redesigns and rebuilds as well as new websites.' },
    ],
  },
  {
    path: '/saas-development-company', short: 'SaaS Development', cta: 'services', service: 'SaaS product development',
    title: 'SaaS Development Company in India — Build a SaaS Product | The GX Group',
    description: 'The GX Group builds multi-tenant SaaS platforms with subscriptions, billing, roles and admin consoles — PostgreSQL, Supabase, Stripe and Razorpay. Bengaluru, India.',
    keywords: 'SaaS development company India, SaaS development Bangalore, build a SaaS product, SaaS MVP development, multi-tenant SaaS developers, B2B SaaS development',
    eyebrow: 'SAAS PLATFORMS', h1: ['SaaS product', 'development.'],
    answer: 'The GX Group builds SaaS products from Bengaluru, India: multi-tenant platforms with subscriptions and billing, roles and permissions, and admin consoles, on PostgreSQL or Supabase with Stripe or Razorpay. We take vertical SaaS, marketplaces and B2B platforms from idea to launch and support them afterwards.',
    points: [
      { t: 'Multi-tenant by design', d: 'Each customer\'s data kept separate and secure.' },
      { t: 'Subscriptions and billing', d: 'Plans, trials and payments through Stripe or Razorpay.' },
      { t: 'Roles and permissions', d: 'Owner, admin and member access done properly.' },
      { t: 'Admin consoles', d: 'The back office you need to run the product.' },
      { t: 'AI features', d: 'Assistants, search and automation where they remove manual work.' },
      { t: 'Built to scale', d: 'APIs, monitoring and infrastructure that grow with usage.' },
    ],
    faqs: [
      { q: 'Can The GX Group build a SaaS product from scratch?', a: 'Yes. The GX Group scopes, designs, builds and launches SaaS platforms, including subscriptions, billing, roles and admin consoles.' },
      { q: 'Which payment gateways do you integrate?', a: 'Stripe for international payments and Razorpay for India are the most common. Others can be integrated when a project needs them.' },
      { q: 'Can I start with a SaaS MVP?', a: 'Yes. Most SaaS products start as an MVP with the core workflow and billing, then grow from real customer usage.' },
      { q: 'Do you offer equity partnerships for SaaS startups?', a: 'Selected SaaS ventures can apply for the equity partnership, where the development fee is reduced in exchange for negotiated equity.' },
    ],
  },
  {
    path: '/ai-development-company', short: 'AI Development & Automation', cta: 'services', service: 'AI development and automation',
    title: 'AI Development & Automation Company in Bengaluru | The GX Group',
    description: 'AI assistants, AI search, document processing and workflow automation by The GX Group, Bengaluru — LLM APIs, RAG and automation that remove manual work.',
    keywords: 'AI development company Bangalore, AI automation company India, generative AI development, LLM integration, RAG chatbot development, AI chatbot developers, business automation',
    eyebrow: 'AI & AUTOMATION', h1: ['AI development', 'and automation.'],
    answer: 'The GX Group builds AI features and automation from Bengaluru, India: AI assistants and search, document processing and workflow automation, using LLM APIs, retrieval-augmented generation (RAG) and automation tools. The aim is practical — remove manual work in support, lead handling and reporting.',
    points: [
      { t: 'AI assistants', d: 'Support and sales assistants that answer from your own content.' },
      { t: 'AI search', d: 'Search across your documents and data with RAG.' },
      { t: 'Document processing', d: 'Read, classify and extract from documents automatically.' },
      { t: 'Workflow automation', d: 'Lead triage, follow-ups and report generation without manual steps.' },
      { t: 'Inside your product', d: 'AI added to an existing app, website or SaaS.' },
      { t: 'Measured', d: 'We track whether the automation actually saves time.' },
    ],
    faqs: [
      { q: 'What AI work does The GX Group do?', a: 'AI assistants and chatbots, AI search over company content, document processing and workflow automation, built with LLM APIs, RAG and automation tools.' },
      { q: 'Can you add AI to an existing app or website?', a: 'Yes. AI features can be integrated into an existing mobile app, website or SaaS platform.' },
      { q: 'What is RAG?', a: 'RAG, or retrieval-augmented generation, lets an AI model answer using your own documents and data rather than only its general training, which makes answers more accurate and specific to your business.' },
      { q: 'How do I start an AI project?', a: 'Request a consultation through Technology Services. The GX Group scopes the use case and sends a quotation with milestones.' },
    ],
  },
]
