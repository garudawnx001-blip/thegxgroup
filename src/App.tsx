import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer, Header, PageShell } from './components/Layout'
import { Intro } from './components/Intro'
import Home from './pages/Home'
import { About, Capabilities, Legal, NotFound, PartnershipModel, Work, WorkDetail } from './pages/Info'
import { Contact, PartnerWithUs, TechnologyServices } from './pages/Forms'

const Admin = lazy(() => import('./admin/Admin'))

export function PublicRoutes() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">Skip to content</a>
      <Header />
      <PageShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/partnership-model" element={<PartnershipModel />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/technology-services" element={<TechnologyServices />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageShell>
      <Footer />
    </>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const [intro, setIntro] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('intro'))
  useEffect(() => {
    if (isAdmin || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null; let raf = 0
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.12, smoothWheel: true }); (window as unknown as { __lenis: unknown }).__lenis = lenis
      const loop = (t: number) => { lenis!.raf(t); raf = requestAnimationFrame(loop) }; raf = requestAnimationFrame(loop)
    })
    return () => { cancelAnimationFrame(raf); lenis?.destroy() }
  }, [isAdmin])
  if (isAdmin) return <Suspense fallback={<div className="min-h-screen" />}><Routes><Route path="/admin/*" element={<Admin />} /></Routes></Suspense>
  return (
    <>
      {intro && <Intro onDone={() => { sessionStorage.setItem('gxIntro', '1'); document.documentElement.classList.remove('intro'); setIntro(false) }} />}
      <PublicRoutes />
    </>
  )
}
