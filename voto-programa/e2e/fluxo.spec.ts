/**
 * Fluxo completo, resultado às cegas, voto e revelação (B-interacao.md §4.2–4.9 e §9: B2, B3, C1–C7).
 * Critérios 4, 7 e 8 do plano de QA (pipeline/ux/E-qa.md). O critério 5 (console, CSP e rede)
 * é vigiado em todo teste pela fixture de e2e/apoio.ts.
 */
import type { Page } from '@playwright/test'
import {
  NOMES,
  NOME_POR_ID,
  abrir,
  cenasEsperadas,
  comecar,
  esperarEtapa,
  estadoTela,
  expect,
  irParaCenas,
  nomesNaTela,
  passarResumo,
  responderCenas,
  responderPerfil,
  test,
  type Eleicao,
} from './apoio'
import type { Perfil } from '../src/types'

/** Candidatos na ordem do resultado, lidos da tela de voto (valor dos rádios). */
const idsNoVoto = (page: Page) =>
  page.locator('main[data-etapa="voto"] input[name="voto"]').evaluateAll((is) => is.map((i) => (i as HTMLInputElement).value).filter((v) => v !== 'nenhum'))

const letra = (i: number) => String.fromCharCode(65 + i)

// ---------------------------------------------------------------- critério 4 (+ B2, B3, C1, C2, C6)
const REGIONAIS: { eleicao: Eleicao; nome: string; perfil: Partial<Perfil>; regionais: string[]; temas: string[] }[] = [
  {
    eleicao: 'governador-rj',
    nome: 'Leste',
    perfil: { regiao: 'leste', saude: 'sus', escola: 'publica', deslocamento: 'publico', trabalho: 'carteira', banheiros: 1 },
    regionais: ['barca-leste'],
    temas: ['Saúde', 'Transporte'],
  },
  {
    eleicao: 'governador-rj',
    nome: 'interior',
    perfil: { regiao: 'interior', saude: 'sus', deslocamento: 'moto', trabalho: 'autonomo' },
    regionais: ['estrada-interior', 'saude-interior', 'encosta-serra'],
    temas: ['Segurança'],
  },
  {
    eleicao: 'presidente',
    nome: 'Nordeste',
    perfil: { regiao: 'nordeste', saude: 'sus', escola: 'publica', deslocamento: 'publico', trabalho: 'autonomo', banheiros: 1 },
    regionais: ['seca-nordeste'],
    temas: ['Saúde', 'Trabalho', 'Clima e meio ambiente'],
  },
]

for (const r of REGIONAIS) {
  test(`4. ${r.eleicao} · fluxo completo até o cartão com perfil ${r.nome}`, async ({ page, vigia }) => {
    // entra pela home, como a pessoa
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Eleições' }).getByRole('link', { name: new RegExp(r.eleicao === 'presidente' ? 'Presidente' : 'Governador') }).click()
    await esperarEtapa(page, 'abertura')
    await comecar(page)

    // B2: resposta do perfil avança sozinha (≤ 600 ms) e o contador sobe; Voltar mostra a marcada
    const primeira = page.getByRole('group').getByRole('button').first()
    const t0 = Date.now()
    await primeira.click()
    await expect(page.getByTestId('progresso')).toHaveAttribute('aria-valuenow', '2', { timeout: 600 })
    expect(Date.now() - t0).toBeLessThanOrEqual(600 + 150) // folga do protocolo do navegador
    await page.getByTestId('voltar').click()
    await expect(page.getByTestId('progresso')).toHaveAttribute('aria-valuenow', '1')
    await expect(page.getByRole('group').getByRole('button').first()).toHaveAttribute('aria-pressed', 'true')
    // agora responde o perfil pra valer (a 1ª resposta é trocada)
    await responderPerfil(page, r.eleicao, r.perfil)

    // B3: prioridades, o 4º toque não marca nada e avisa
    const grupo = page.getByRole('group')
    const botoes = grupo.getByRole('button')
    for (let i = 0; i < 3; i++) await botoes.nth(i).click()
    await botoes.nth(3).click()
    await expect(page.getByRole('alert')).toContainText('Máximo de 3')
    await expect(botoes.nth(3)).toHaveAttribute('aria-pressed', 'false')
    for (let i = 0; i < 3; i++) await expect(botoes.nth(i)).toHaveAttribute('aria-pressed', 'true')
    // troca pelas prioridades do perfil
    for (let i = 0; i < 3; i++) await botoes.nth(i).click()
    for (const t of r.temas) await grupo.getByRole('button', { name: t, exact: true }).click()
    await expect(page.getByText(`${r.temas.length} de 3 escolhidos`)).toBeVisible()
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await esperarEtapa(page, 'cena')

    // cenas: responde quase todas, pula algumas
    const vistas = await responderCenas(page, 5)
    for (const c of r.regionais) expect(vistas, `cena regional ${c} não apareceu`).toContain(c)
    expect([...vistas].sort()).toEqual(cenasEsperadas(r.eleicao, r.perfil).sort())

    // resumo: prioridades do perfil aparecem no cartão 1
    await esperarEtapa(page, 'resumo')
    for (const t of r.temas) await expect(page.locator('main[data-etapa="resumo"]').getByText(t, { exact: true })).toBeVisible()
    await passarResumo(page)

    // C1: votar visível sem rolar e ao menos 5 linhas (ou todas) visíveis
    const votar = page.getByTestId('resultado-votar')
    await expect(votar).toBeInViewport({ ratio: 1 })
    const linhas = page.locator('[data-testid^="linha-"]')
    const nLinhas = await linhas.count()
    expect(nLinhas).toBe(NOMES[r.eleicao].length)
    for (let i = 0; i < Math.min(5, nLinhas); i++) await expect(linhas.nth(i)).toBeInViewport({ ratio: 1 })

    // C2: detalhe antes do voto sem nome, sem citação e sem fonte
    await linhas.first().click()
    const det = page.getByRole('dialog')
    await expect(det).toBeVisible()
    await expect(det.locator('blockquote')).toHaveCount(0)
    await expect(det.getByRole('link')).toHaveCount(0)
    expect(await nomesNaTela(page, NOMES[r.eleicao])).toEqual([])
    await page.keyboard.press('Escape')
    await expect(det).toBeHidden()

    // voto no 2º colocado
    await votar.click()
    await esperarEtapa(page, 'voto')
    await page.getByRole('radio').nth(1).check()
    await page.getByTestId('voto-confirmar').click()
    await esperarEtapa(page, 'revelacao')
    await page.getByRole('button', { name: 'Revelar os outros' }).click()
    await page.getByRole('button', { name: 'Montar meu cartão' }).click()
    await esperarEtapa(page, 'cartao')

    // C6: o cartão não leva o voto; sem a chave, nenhum nome
    const previa = page.getByTestId('cartao-previa')
    await expect(previa).toBeVisible()
    await expect(previa).toHaveAttribute('alt', /sem nomes.*sem o seu voto/)
    const desenhado = () => page.evaluate(() => (window as unknown as { __textos: string[] }).__textos.join(' | '))
    const semNomes = await desenhado()
    for (const nome of NOMES[r.eleicao]) expect(semNomes).not.toContain(nome)
    await page.getByRole('switch', { name: 'Incluir nomes e percentuais' }).click()
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    await expect(previa).toHaveAttribute('alt', /nomes e percentuais.*Sem o seu voto/)
    const comNomes = await desenhado()
    for (const nome of NOMES[r.eleicao]) expect(comNomes).toContain(nome)
    expect(comNomes).toMatch(/\d+%/)
    expect(comNomes.toLowerCase()).not.toMatch(/votei|seu voto|meu voto/)
    await expect(page.getByTestId('cartao-compartilhar')).toBeEnabled()

    // a revelação aconteceu e a sequência de etapas foi a esperada
    const etapas = await vigia.etapas()
    expect(etapas.filter((e) => e !== 'cena')).toEqual(['abertura', 'perfil', 'prioridades', 'resumo', 'resultado', 'voto', 'revelacao', 'cartao'])
  })
}

// registra o texto desenhado no canvas do cartão (C6), antes de o app carregar
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __textos: string[] }
    w.__textos = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (texto: string, ...resto: [number, number, number?]) {
      w.__textos.push(String(texto))
      return original.call(this, texto, ...resto)
    }
  })
})

// ---------------------------------------------------------------- critério 7 (+ C3, C4, C5, C7)
for (const eleicao of ['governador-rj', 'presidente'] as Eleicao[]) {
  test(`7. ${eleicao} · resultado às cegas: nenhum nome antes do voto; a 1ª carta é a do votado`, async ({ page, vigia }) => {
    const nomes = NOMES[eleicao]
    // soft: um vazamento reprova o teste, mas o resto (voto e revelação) continua sendo conferido
    const semNomes = async (onde: string) => expect.soft(await nomesNaTela(page, nomes), `nome de candidato em ${onde}`).toEqual([])

    await abrir(page, eleicao)
    await semNomes('abertura')
    await comecar(page)
    await semNomes('perfil')
    await responderPerfil(page, eleicao, {})
    await semNomes('prioridades')
    await page.getByRole('button', { name: 'Pular', exact: true }).click()
    await esperarEtapa(page, 'cena')
    for (let i = 0; i < 40 && (await estadoTela(page)).etapa === 'cena'; i++) {
      await semNomes(`cena ${i + 1}`)
      await page.locator('main[data-etapa="cena"] input[type="radio"]').first().check()
      await page.getByTestId('fato-chip').click()
      await expect(page.getByTestId('contexto-leia')).toBeVisible()
      await semNomes(`fato da cena ${i + 1}`)
      await page.keyboard.press('Escape')
      await page.getByTestId('cena-avancar').click()
      await expect.poll(async () => (await estadoTela(page)).passo).not.toBe(String(i + 1))
    }
    await esperarEtapa(page, 'resumo')
    await semNomes('resumo 1')
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await semNomes('resumo 2')
    await page.getByRole('button', { name: 'Ver resultado às cegas' }).click()
    await esperarEtapa(page, 'resultado')
    await semNomes('resultado')
    for (const linha of await page.locator('[data-testid^="linha-"]').all()) {
      await linha.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await semNomes('detalhe às cegas')
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toBeHidden()
    }
    await page.getByTestId('resultado-votar').click()
    await esperarEtapa(page, 'voto')
    await semNomes('voto')

    // C3: confirmar sem escolher mostra alerta, foca a 1ª opção e não sai da tela
    await page.getByTestId('voto-confirmar').click()
    await expect(page.getByRole('alert')).toContainText('Escolha uma opção')
    await expect(page.getByRole('radio').first()).toBeFocused()
    expect((await estadoTela(page)).etapa).toBe('voto')

    // vota no ÚLTIMO colocado: a 1ª carta tem de ser ele, não o 1º do ranking
    const ids = await idsNoVoto(page)
    const iVoto = ids.length - 1
    await page.getByRole('radio').nth(iVoto).check()
    await semNomes('voto escolhido')
    const rotuloVotado = `Candidato ${letra(iVoto)}`
    await page.getByTestId('voto-confirmar').click()
    await esperarEtapa(page, 'revelacao')

    // C5: com movimento reduzido, a contagem não aparece
    expect(await vigia.etapas()).not.toContain('contagem')

    // C4: a 1ª carta é a do votado, vira sozinha e mostra o nome; as outras esperam
    const cartas = page.locator('.cartas [data-testid^="carta-"]')
    await expect(cartas.first()).toHaveAttribute('data-testid', `carta-${letra(iVoto)}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Você votou no ${rotuloVotado}`)
    const nomeVotado = NOME_POR_ID[ids[iVoto]]
    await expect(cartas.first()).toHaveClass(/virada/)
    await expect(cartas.first()).toHaveClass(/destaque/)
    await expect(cartas.first().locator('.verso')).toHaveAttribute('aria-hidden', 'false')
    const nomeNaCarta = (await cartas.first().locator('.verso b').innerText()).trim()
    expect(nomeNaCarta).toBe(nomeVotado)
    for (let i = 1; i < (await cartas.count()); i++) await expect(cartas.nth(i)).not.toHaveClass(/virada/)
    // só o nome do votado está exposto (o verso das outras está aria-hidden e virado de costas)
    const expostos = await page.evaluate(() =>
      [...document.querySelectorAll('.cartas .verso[aria-hidden="false"] b')].map((b) => b.textContent?.trim()),
    )
    expect(expostos).toEqual([nomeNaCarta])

    await page.getByRole('button', { name: 'Revelar os outros' }).click()
    await expect(page.getByRole('button', { name: 'Montar meu cartão' })).toBeVisible()
    for (let i = 0; i < (await cartas.count()); i++) await expect(cartas.nth(i)).toHaveClass(/virada/)
    // depois de revelar, o detalhe tem nome, trecho e fonte
    await cartas.first().click()
    const det = page.getByRole('dialog')
    await expect(det).toBeVisible()
    await expect(det.getByRole('heading', { level: 2 })).toContainText(nomeNaCarta)
    await page.keyboard.press('Escape')
  })

  test(`7b. ${eleicao} · "Prefiro não votar" revela sem carta de destaque (C7)`, async ({ page }) => {
    await irParaCenas(page, eleicao)
    await responderCenas(page)
    await passarResumo(page)
    await page.getByTestId('resultado-votar').click()
    await esperarEtapa(page, 'voto')
    await page.getByRole('radio', { name: 'Prefiro não votar' }).check()
    const votos: string[] = []
    page.on('request', (req) => req.url().includes('/api/votos') && votos.push(req.method()))
    await page.getByTestId('voto-confirmar').click()
    await esperarEtapa(page, 'revelacao')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Os nomes')
    await expect(page.locator('.carta.destaque')).toHaveCount(0)
    await expect(page.locator('.carta.virada')).toHaveCount(0)
    await page.getByRole('button', { name: 'Revelar', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Montar meu cartão' })).toBeVisible()
    expect(votos, 'não votar não envia nada').toEqual([])
  })

  // ---------------------------------------------------------------- critério 8
  test(`8. ${eleicao} · voto com a API local: envia só {eleicao, posicao} e recebe 204`, async ({ page }) => {
    const estado = page.waitForResponse((r) => r.url().endsWith('/api/estado'))
    await irParaCenas(page, eleicao)
    await responderCenas(page)
    await passarResumo(page)
    const cfg = await (await estado).json()
    expect(cfg).toEqual({ coleta: true, contaCandidato: false, turnstileSiteKey: null })

    await page.getByTestId('resultado-votar').click()
    await esperarEtapa(page, 'voto')
    await expect(page.locator('main[data-etapa="voto"] .nota')).toContainText('sem o nome dele')
    const ids = await idsNoVoto(page)
    const iVoto = Math.min(1, ids.length - 1)
    await page.getByRole('radio').nth(iVoto).check()

    const [req] = await Promise.all([page.waitForRequest((r) => r.url().endsWith('/api/votos') && r.method() === 'POST'), page.getByTestId('voto-confirmar').click()])
    const resp = await req.response()
    expect(resp?.status()).toBe(204)
    const corpo = req.postDataJSON() as Record<string, unknown>
    expect(Object.keys(corpo).sort()).toEqual(['eleicao', 'posicao'])
    expect(corpo).toEqual({ eleicao, posicao: iVoto + 1 })
    expect(req.postData() ?? '').not.toContain(ids[iVoto])
    for (const nome of NOMES[eleicao]) expect(req.postData() ?? '').not.toContain(nome)

    await esperarEtapa(page, 'revelacao')
    await expect(page.getByText('Voto anotado sem o seu nome')).toBeVisible()
    // trava leve do aparelho: o 2º voto no mesmo navegador não é enviado
    expect(await page.evaluate((e) => localStorage.getItem(`votou:${e}`), eleicao)).toBe('1')
  })
}
