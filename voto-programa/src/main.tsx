import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// fontes (só latin e latin-ext) declaradas em index.css e servidas pelo próprio site
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
