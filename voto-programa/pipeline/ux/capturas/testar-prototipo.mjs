// Verifica os critérios de aceite da tela de cena no protótipo e salva capturas.
// Uso: node pipeline/ux/capturas/testar-prototipo.mjs   (Chromium em /opt/pw-browsers)
import { chromium } from '../../../node_modules/playwright/index.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const URL_PROTO = 'file://' + path.resolve(aqui, '../prototipo-fluxo.html')
const OUT = path.resolve(aqui, 'prototipo')
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
let falhas = 0
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FALHA'} ${msg}`); if (!cond) falhas++ }

const browser = await chromium.launch({ executablePath: CHROME })
for (const vp of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
  const tag = `${vp.width}x${vp.height}`
  const page = await (await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })).newPage()
  await page.goto(URL_PROTO)
  const shot = (n) => page.screenshot({ path: `${OUT}/${tag}-${n}.png` })
  await shot('01-intro')
  await page.getByRole('button', { name: 'Bora começar' }).click()
  await shot('02-perfil')
  await page.locator('.escolha').first().click(); await page.waitForTimeout(50)
  await page.locator('.escolha').first().click(); await page.waitForTimeout(50)
  await page.getByRole('button', { name: 'Saúde' }).click()
  await page.getByRole('button', { name: 'Transporte' }).click()
  await shot('03-prioridades')
  await page.getByRole('button', { name: 'Continuar' }).click()

  const avancar = page.getByTestId('cena-avancar')
  const dentro = async (loc) => { const b = await loc.boundingBox(); return b && b.y >= 0 && b.y + b.height <= vp.height }
  const ordens = []
  for (let i = 0; i < 3; i++) {
    const semRolagem = await page.evaluate(() => {
      const m = document.querySelector('#meio'); return { doc: document.documentElement.scrollHeight, meio: m.scrollHeight - m.clientHeight }
    })
    ok(semRolagem.doc <= vp.height, `${tag} cena ${i + 1}: página sem rolagem antes da escolha (altura ${semRolagem.doc})`)
    ok(semRolagem.meio <= 0, `${tag} cena ${i + 1}: conteúdo cabe sem rolagem interna (sobra ${-semRolagem.meio}px)`)
    ok(await dentro(page.locator('.opcao').last()), `${tag} cena ${i + 1}: última opção visível`)
    if (i === 1) await shot('04-cena2-antes')
    ordens.push(await page.locator('.opcao').evaluateAll((l) => l.map((x) => x.dataset.op).join('')))
    const radios = page.getByRole('radio')
    await radios.nth(0).check({ force: true })
    await radios.nth(2).check({ force: true }) // troca
    ok(await radios.nth(2).isChecked() && !(await radios.nth(0).isChecked()), `${tag} cena ${i + 1}: trocar a opção muda a seleção`)
    ok(await radios.nth(0).isEnabled(), `${tag} cena ${i + 1}: opções continuam habilitadas após escolher`)
    ok(await dentro(avancar), `${tag} cena ${i + 1}: botão de avançar dentro da viewport após escolher`)
    const h2 = await page.evaluate(() => document.documentElement.scrollHeight)
    ok(h2 === semRolagem.doc, `${tag} cena ${i + 1}: altura não muda após escolher (${semRolagem.doc} → ${h2})`)
    if (i === 1) {
      await shot('05-cena2-escolhida')
      const antesBox = await avancar.boundingBox()
      await page.getByTestId('fato-chip').click()
      await shot('06-cena2-fato-aberto')
      ok(await page.getByRole('dialog').isVisible(), `${tag}: "Você sabia?" abre como diálogo`)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(50)
      const depoisBox = await avancar.boundingBox()
      ok(antesBox.y === depoisBox.y, `${tag}: abrir/fechar o fato não move o botão de avançar`)
    }
    await avancar.click()
  }
  // voltar preserva resposta e ordem
  await page.goto(URL_PROTO + '#cena'); await page.reload()
  const r = page.getByRole('radio')
  await r.nth(1).check({ force: true })
  const escolhida = await r.nth(1).inputValue()
  const ordem1 = await page.locator('.opcao').evaluateAll((l) => l.map((x) => x.dataset.op).join(''))
  await avancar.click()
  await page.getByRole('button', { name: 'Voltar para a situação anterior' }).click()
  ok(await page.locator(`input[value="${escolhida}"]`).isChecked(), `${tag}: Voltar preserva a resposta anterior`)
  ok((await page.locator('.opcao').evaluateAll((l) => l.map((x) => x.dataset.op).join(''))) === ordem1, `${tag}: Voltar mantém a ordem das opções`)
  ok((await page.getByRole('progressbar').getAttribute('aria-valuenow')) === '1', `${tag}: progresso volta para 1`)

  // resultado, voto, revelação, cartão
  await page.goto(URL_PROTO + '#resultado'); await page.reload()
  await page.waitForTimeout(100)
  await shot('07-resultado')
  ok(await dentro(page.getByRole('button', { name: 'Votar às cegas' })), `${tag}: "Votar às cegas" visível sem rolar`)
  ok(await dentro(page.locator('.cand').last()), `${tag}: todos os candidatos visíveis sem rolar (3 fictícios)`)
  await page.locator('.cand').first().click()
  await shot('08-detalhe-candidato')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Votar às cegas' }).click()
  await page.getByRole('button', { name: 'Confirmar e revelar' }).click()
  ok(await page.getByRole('alert').isVisible(), `${tag}: confirmar sem escolher mostra erro`)
  await shot('09-voto-erro')
  await page.getByRole('radio').nth(1).check({ force: true })
  await page.getByRole('button', { name: 'Confirmar e revelar' }).click()
  await page.waitForTimeout(200)
  await shot('10-revelacao-voto')
  await page.getByRole('button', { name: 'Revelar os outros' }).click()
  await page.waitForTimeout(200)
  await shot('11-revelacao-todos')
  await page.getByRole('button', { name: 'Montar meu cartão' }).click()
  await page.waitForTimeout(200)
  await shot('12-cartao')
}
await browser.close()
console.log(falhas ? `\n${falhas} falha(s)` : '\nTodos os critérios passaram')
process.exit(falhas ? 1 : 0)
