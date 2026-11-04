import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import './index.css'
import App from './App'

// GitHub Pages SPA fallback: 404.html stores the requested path, we restore it here.
const redirect = sessionStorage.getItem('gxRedirect')
if (redirect) { sessionStorage.removeItem('gxRedirect'); history.replaceState(null, '', redirect) }

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
const root = document.getElementById('root')!
root.innerHTML = '' // pre-rendered HTML is for crawlers; the app re-renders on the client
createRoot(root).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
