import { defineConfig } from '@playwright/test'

/**
 * Suíte de aceite (pipeline/ux/B-interacao.md §9 e pipeline/ux/plano.md, "Verificação").
 * Roda contra o runtime real da Cloudflare (`wrangler dev`): assets de dist/ com os cabeçalhos
 * de public/_headers (CSP inclusa) e a API do Worker com D1 local. Assim uma violação de CSP
 * vira erro de console e reprova o teste.
 *
 * Chromium do ambiente: /opt/pw-browsers/chromium (ou PW_CHROMIUM). Não rodar `playwright install`.
 */
const PORTA = 8787
const BASE = `http://127.0.0.1:${PORTA}`

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 7_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE,
    locale: 'pt-BR',
    // obrigatório: sem ele o axe mede cor no meio da transição e os tempos do JS não zeram
    reducedMotion: 'reduce',
    colorScheme: 'light',
    serviceWorkers: 'block',
    launchOptions: { executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium' },
  },
  webServer: {
    command: `npm run build && npx wrangler d1 migrations apply voto-programa --local && npx wrangler dev --port ${PORTA} --ip 127.0.0.1`,
    url: `${BASE}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    { name: '360x640', use: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: '390x844', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
  ],
})
