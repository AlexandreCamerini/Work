// Captura o fluxo atual (dist servido em :4173) e mede alturas/toques. Uso: npm run build; npx vite preview --port 4173 & ; node pipeline/ux/capturas/capturar-antes.mjs governador-rj|presidente
import { chromium } from '../../../node_modules/playwright/index.mjs'
import fs from 'node:fs'

const OUT = new URL('./antes', import.meta.url).pathname
const BASE = 'http://localhost:4173/'
const ELEICAO = process.argv[2] || 'governador-rj'
const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
]

const medidas = {}

for (const vp of VIEWPORTS) {
  const tag = `${vp.width}x${vp.height}`
  const pref = `${OUT}/${ELEICAO}-${tag}`
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  const m = { viewport: tag, toques: 0, toquesMinimos: 0, rolagens: 0, telas: {}, cenas: [] }
  const altura = () => page.evaluate(() => document.documentElement.scrollHeight)
  const shot = async (nome, full = true) => {
    await page.screenshot({ path: `${pref}-${nome}.png`, fullPage: false })
    if (full) await page.screenshot({ path: `${pref}-${nome}-inteira.png`, fullPage: true })
    m.telas[nome] = { alturaPagina: await altura() }
  }
  const tap = async (loc) => {
    // conta rolagem se o alvo estiver fora da viewport
    const box = await loc.boundingBox()
    const scrollY = await page.evaluate(() => window.scrollY)
    if (box && (box.y < 0 || box.y + box.height > vp.height)) m.rolagens++
    void scrollY
    await loc.click()
    m.toques++
  }

  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await shot('01-home')
  await tap(page.locator(`a[href="#${ELEICAO}"]`))
  await page.waitForTimeout(300)
  await shot('02-intro')
  await tap(page.getByRole('button', { name: 'Bora começar' }))
  await page.waitForTimeout(300)
  await shot('03-sobre-voce')
  const fieldsets = page.locator('fieldset')
  const nf = await fieldsets.count()
  for (let i = 0; i < nf; i++) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await tap(fieldsets.nth(i).locator('button').first())
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot('03b-sobre-voce-preenchido', false)
  await tap(page.getByRole('button', { name: 'Continuar' }))
  await page.waitForTimeout(300)
  await shot('04-prioridades')
  const temas = page.locator('button[aria-pressed]')
  for (let i = 0; i < 3; i++) await tap(temas.nth(i))
  await shot('04b-prioridades-escolhidas', false)
  await tap(page.getByRole('button', { name: 'Continuar' }))
  await page.waitForTimeout(300)

  let n = 0
  while (true) {
    const prog = page.getByRole('progressbar')
    if (!(await prog.count())) break
    n++
    await page.evaluate(() => window.scrollTo(0, 0))
    const antes = await altura()
    if (n === 1 || n === 6) await shot(`05-cena${n}-antes`)
    const opcoes = page.locator('section > div.flex.flex-col.gap-3 > button')
    const nOp = await opcoes.count()
    const ultimaOp = opcoes.nth(nOp - 1)
    const bOp = await ultimaOp.boundingBox()
    // escolhe a 2a opção
    await tap(opcoes.nth(1))
    await page.waitForTimeout(150)
    const depois = await altura()
    const prox = page.getByRole('button', { name: /Próxima|Ver meu resultado/ })
    const bProx = await prox.boundingBox()
    const opcoesTravadas = await opcoes.nth(0).isDisabled()
    if (n === 1 || n === 6) await shot(`05-cena${n}-depois`)
    m.cenas.push({
      cena: n,
      alturaAntes: antes,
      alturaDepois: depois,
      cresceu: depois - antes,
      ultimaOpcaoFundo: Math.round(bOp.y + bOp.height),
      ultimaOpcaoForaViewport: bOp.y + bOp.height > vp.height,
      proximaTopo: Math.round(bProx.y),
      proximaFundo: Math.round(bProx.y + bProx.height),
      proximaForaViewport: bProx.y + bProx.height > vp.height,
      rolagemNecessariaPx: Math.max(0, Math.round(bProx.y + bProx.height - vp.height)),
      opcoesTravadas,
    })
    await tap(prox)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await shot('06-resultado')
  // posição do bloco de voto
  const voto = page.locator('#titulo-voto')
  const bVoto = await voto.boundingBox()
  m.resultado = {
    alturaPagina: await altura(),
    blocoVotoTopo: Math.round(bVoto.y),
    telasAteVoto: +(bVoto.y / vp.height).toFixed(1),
  }
  await tap(page.getByRole('radio').first())
  const confirmar = page.getByRole('button', { name: /Confirmar voto/ })
  await confirmar.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${pref}-07-voto.png` })
  await tap(confirmar)
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot('08-revelacao')
  m.toquesAteResultado = m.toques - 2 // menos voto e confirmação
  m.numCenas = n
  medidas[tag] = m
  await browser.close()
}

fs.writeFileSync(`${OUT}/medidas-${ELEICAO}.json`, JSON.stringify(medidas, null, 2))
for (const [k, m] of Object.entries(medidas)) {
  const c = m.cenas
  console.log(k, {
    numCenas: m.numCenas,
    toquesAteResultado: m.toquesAteResultado,
    rolagensAteResultado: m.rolagens,
    alturaDepoisMin: Math.min(...c.map((x) => x.alturaDepois)),
    alturaDepoisMax: Math.max(...c.map((x) => x.alturaDepois)),
    cresceuMedio: Math.round(c.reduce((a, x) => a + x.cresceu, 0) / c.length),
    proximaForaEm: c.filter((x) => x.proximaForaViewport).length + '/' + c.length,
    ultimaOpcaoForaAntesEm: c.filter((x) => x.ultimaOpcaoForaViewport).length + '/' + c.length,
    rolagemMax: Math.max(...c.map((x) => x.rolagemNecessariaPx)),
    travadas: c.every((x) => x.opcoesTravadas),
    telas: Object.fromEntries(Object.entries(m.telas).map(([a, b]) => [a, b.alturaPagina])),
    resultado: m.resultado,
  })
}
