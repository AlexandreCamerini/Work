import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// fontes servidas pelo próprio site: nenhum pedido ao Google (que receberia o IP de cada visitante)
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource-variable/nunito-sans/wght.css'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
