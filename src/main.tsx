import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  return worker.start({
  serviceWorker: {
    url: '/VPN/mockServiceWorker.js',
  },
})
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(  
  <StrictMode>
    <App />
  </StrictMode>,)
})