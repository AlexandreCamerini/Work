/**
 * Esqueleto da suíte E2E proposta em pipeline/ux/D-tecnica.md §5. Destino final: e2e/fluxo.spec.ts
 * (fora de src/), rodando com Playwright contra `vite build` + `vite preview`.
 *
 * Contrato de acessibilidade que a nova UI precisa expor (é por ele que os testes acham as coisas,
 * nunca por classe CSS):
 *   - cada cena é um grupo de rádio: role="radiogroup" com nome acessível = a pergunta;
 *     cada opção é role="radio" (ou <input type="radio">) com aria-checked;
 *   - botão de avançar: "Continuar" / "Próxima" / "Ver meu resultado";
 *   - botão "Voltar" em toda etapa depois da abertura;
 *   - cada tela tem um <main data-etapa="…"> e um <h1>; data-etapa espelha o estado da máquina
 *     (abertura | perfil | prioridades | cena | resultado | revelado) e é o único gancho não-ARIA.
 *   - o <h1> da cena é o texto da pergunta; ao trocar de etapa o foco vai para esse <h1>.
 * Na UI de hoje, os testes 2, 3 e o de axe falham de propósito (não há Voltar, opção não é rádio,
 * a opção escolhida trava, a cena não tem h1): servem de critério de aceite da refatoração.
 *
 * playwright.config.ts sugerido:
 *   export default defineConfig({
 *     testDir: 'e2e',
 *     use: { baseURL: 'http://127.0.0.1:4391/', reducedMotion: 'reduce', locale: 'pt-BR',
 *            launchOptions: { executablePath: process.env.PW_CHROMIUM } },
 *     webServer: { command: 'npm run build && npx vite preview --port 4391 --strictPort --host 127.0.0.1',
 *                  url: 'http://127.0.0.1:4391/', reuseExistingServer: !process.env.CI },
 *     projects: [
 *       { name: '360x640', use: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true } },
 *       { name: '390x844', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
 *     ],
 *   })
 * `reducedMotion: 'reduce'` é obrigatório: sem ele o axe mede cor no meio da transição e acusa
 * contraste 3:1 falso (visto na auditoria, no rádio de voto recém-tocado).
 *
 * Guarda para o Vitest: o `npm test` de hoje inclui qualquer *.spec.ts do repositório, e
 * @playwright/test não está instalado no projeto. Sob o Vitest este arquivo só registra um
 * describe.skip. Ao mover para e2e/, troque a guarda por `import { test, expect } from
 * '@playwright/test'` e ponha `exclude: ['e2e/**', 'pipeline/**', ...configDefaults.exclude]`
 * no bloco `test` do vite.config.ts.
 */
import type { Page, Request } from '@playwright/test'

declare const describe: { skip: (nome: string, fn: () => void) => void }
declare const it: (nome: string, fn: () => void) => void

const EM_VITEST = typeof process !== 'undefined' && !!process.env.VITEST

if (EM_VITEST) {
  describe.skip('e2e-proposta (roda no Playwright, não no Vitest)', () => it('ver D-tecnica.md §5', () => {}))
} else {
  // especificador em variável: o Vite (Vitest) não tenta resolver pacotes que o projeto não tem
  const PW = '@playwright/test'
  const AXE = '@axe-core/playwright'
  const { test, expect } = (await import(/* @vite-ignore */ PW)) as typeof import('@playwright/test')
  const { default: AxeBuilder } = (await import(/* @vite-ignore */ AXE)) as typeof import('@axe-core/playwright')

  const ELEICOES = ['governador-rj', 'presidente'] as const
  const AVANCAR = /^(Continuar|Próxima|Ver (meu )?resultado)/

  /** Coleta erros de console e qualquer requisição que saia da origem; responde /api sem servidor. */
  async function vigiar(page: Page) {
    const erros: string[] = []
    const externas: string[] = []
    const origem = new URL(test.info().project.use.baseURL ?? 'http://127.0.0.1:4391/').origin
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))
    page.on('request', (r: Request) => {
      if (!r.url().startsWith(origem) && !r.url().startsWith('data:')) externas.push(r.url())
    })
    // sem API (preview estático): o app deve cair em SEM_API, sem erro e sem Turnstile
    await page.route('**/api/estado', (rota) =>
      rota.fulfill({ json: { coleta: false, contaCandidato: false, turnstileSiteKey: null } }),
    )
    await page.route('**/api/votos', (rota) => rota.fulfill({ status: 204 }))
    return { erros, externas }
  }

  async function avancar(page: Page) {
    await page.getByRole('button', { name: AVANCAR }).click()
  }

  /** Abertura → perfil (pulado) → prioridades (puladas) → primeira cena. */
  async function irParaCenas(page: Page, eleicao: string) {
    await page.goto(`#${eleicao}`)
    await page.getByRole('button', { name: /começar/i }).click()
    await page.getByRole('button', { name: /^Pular/ }).click() // perfil
    await page.getByRole('button', { name: /^Pular/ }).click() // prioridades
    await expect(page.getByRole('radiogroup')).toBeVisible()
  }

  const etapa = (page: Page) => page.locator('main').getAttribute('data-etapa')
  const cena = (page: Page) => page.locator('main[data-etapa="cena"]').getByRole('radiogroup')
  const opcoes = (page: Page) => cena(page).getByRole('radio')

  /** Inteiro dentro da viewport e não coberto por outra camada (rodapé, teclado, banner). */
  async function inteiroNaViewport(page: Page, nome: RegExp) {
    const botao = page.getByRole('button', { name: nome })
    await expect(botao).toBeVisible()
    const caixa = await botao.boundingBox()
    const { innerWidth, innerHeight } = await page.evaluate(() => ({ innerWidth, innerHeight }))
    expect(caixa, 'botão sem caixa').not.toBeNull()
    expect(caixa!.y).toBeGreaterThanOrEqual(0)
    expect(caixa!.x).toBeGreaterThanOrEqual(0)
    expect(caixa!.y + caixa!.height).toBeLessThanOrEqual(innerHeight)
    expect(caixa!.x + caixa!.width).toBeLessThanOrEqual(innerWidth)
    const noTopo = await botao.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const topo = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return !!topo && (topo === el || el.contains(topo))
    })
    expect(noTopo, 'botão coberto por outro elemento').toBe(true)
  }

  for (const eleicao of ELEICOES) {
    test.describe(eleicao, () => {
      test('1. depois de escolher, o botão de avançar fica inteiro na viewport, em todas as cenas', async ({ page }) => {
        await vigiar(page)
        await irParaCenas(page, eleicao)
        for (let i = 0; i < 40 && (await etapa(page)) === 'cena'; i++) {
          await opcoes(page).first().click()
          await inteiroNaViewport(page, AVANCAR)
          // sem rolagem horizontal em nenhuma cena
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
          await avancar(page)
        }
        expect(await etapa(page)).toBe('resultado')
      })

      test('2. trocar a opção muda a seleção (e não trava as outras)', async ({ page }) => {
        await vigiar(page)
        await irParaCenas(page, eleicao)
        const [a, b] = [opcoes(page).nth(0), opcoes(page).nth(1)]
        await a.click()
        await expect(a).toHaveAttribute('aria-checked', 'true')
        await expect(b).toBeEnabled()
        await b.click()
        await expect(b).toHaveAttribute('aria-checked', 'true')
        await expect(a).toHaveAttribute('aria-checked', 'false')
        await expect(cena(page).locator('[aria-checked="true"], :checked')).toHaveCount(1)
        // teclado: setas movem a seleção dentro do grupo (padrão ARIA de radiogroup)
        await b.focus()
        await page.keyboard.press('ArrowDown')
        await expect(opcoes(page).nth(2)).toHaveAttribute('aria-checked', 'true')
      })

      test('3. Voltar preserva a resposta dada (e permite editar)', async ({ page }) => {
        await vigiar(page)
        await irParaCenas(page, eleicao)
        const titulo = page.getByRole('heading', { level: 1 })
        const pergunta1 = await titulo.innerText()
        const escolhida = opcoes(page).nth(1)
        const textoEscolhido = await escolhida.innerText()
        await escolhida.click()
        await avancar(page)
        await expect(titulo).not.toHaveText(pergunta1)
        await page.getByRole('button', { name: 'Voltar' }).click()
        await expect(titulo).toHaveText(pergunta1)
        await expect(opcoes(page).filter({ hasText: textoEscolhido })).toHaveAttribute('aria-checked', 'true')
        // editar: troca a resposta, avança e volta de novo; a troca fica
        const outra = opcoes(page).nth(0)
        const textoOutra = await outra.innerText()
        await outra.click()
        await avancar(page)
        await page.getByRole('button', { name: 'Voltar' }).click()
        await expect(opcoes(page).filter({ hasText: textoOutra })).toHaveAttribute('aria-checked', 'true')
        // foco vai para o título da cena ao trocar de etapa (hoje fica perdido no <body>)
        expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('H1')
      })

      test('4. fluxo completo sem erro de console e sem requisição externa', async ({ page }) => {
        const { erros, externas } = await vigiar(page)
        await page.goto('/')
        await page.getByRole('link', { name: new RegExp(eleicao === 'presidente' ? 'Presidente' : 'Governador', 'i') }).click()
        await page.getByRole('button', { name: /começar/i }).click()
        // perfil (uma ou várias perguntas por tela): marca a primeira opção de cada grupo visível
        for (let i = 0; i < 10 && (await etapa(page)) === 'perfil'; i++) {
          for (const grupo of await page.getByRole('radiogroup').all()) await grupo.getByRole('radio').first().click()
          await avancar(page)
        }
        expect(await etapa(page)).toBe('prioridades')
        await page.locator('main [aria-pressed="false"], main input[type="checkbox"]').first().click() // uma prioridade
        await avancar(page)
        for (let i = 0; i < 40 && (await etapa(page)) === 'cena'; i++) {
          const n = await opcoes(page).count()
          if (i % 5 === 4) {
            await page.getByRole('button', { name: /pular/i }).click()
          } else {
            await opcoes(page).nth(i % n).click()
            await avancar(page)
          }
        }
        expect(await etapa(page)).toBe('resultado')
        await page.getByRole('button', { name: /não votar|só quero ver/i }).click()
        expect(await etapa(page)).toBe('revelado')
        expect(erros, erros.join('\n')).toEqual([])
        expect(externas, externas.join('\n')).toEqual([])
      })

      test('5. axe sem violação serious/critical em cada tela do fluxo', async ({ page }) => {
        await vigiar(page)
        const graves: string[] = []
        const auditar = async (tela: string) => {
          const r = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()
          for (const v of r.violations) {
            if (v.impact === 'serious' || v.impact === 'critical') {
              graves.push(`${tela}: ${v.id} (${v.impact}) em ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
            }
          }
        }
        await page.goto('/')
        await auditar('home')
        await page.goto(`#${eleicao}`)
        await auditar('abertura')
        await page.getByRole('button', { name: /começar/i }).click()
        await auditar('perfil')
        await page.getByRole('button', { name: /^Pular/ }).click()
        await auditar('prioridades')
        await page.getByRole('button', { name: /^Pular/ }).click()
        await auditar('cena')
        await opcoes(page).first().click()
        await auditar('cena-escolhida')
        for (let i = 0; i < 40 && (await etapa(page)) === 'cena'; i++) {
          await opcoes(page).first().click()
          await avancar(page)
        }
        await auditar('resultado')
        await page.getByRole('radio').first().click()
        await auditar('voto-escolhido')
        await page.getByRole('button', { name: /Confirmar voto/ }).click()
        await auditar('revelado')
        expect(graves, graves.join('\n')).toEqual([])
      })
    })
  }
}
