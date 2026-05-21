import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from "virtual:pwa-register";
import { Analytics } from "@vercel/analytics/react"

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
)
