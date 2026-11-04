import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { PublicRoutes } from './App'
export function render(url: string) {
  return renderToString(<StaticRouter location={url}><PublicRoutes /></StaticRouter>)
}
export { SITE, META, FAQS, CAPABILITIES } from './content/site'
