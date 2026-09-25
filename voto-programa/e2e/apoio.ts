/**
 * Apoio da suíte E2E: fixture que vigia console, CSP e rede em TODO teste, e passos do fluxo
 * guiados pelo contrato de acessibilidade da UI (papéis, nomes, `data-etapa`, `data-testid`),
 * nunca por classe CSS, salvo onde o critério fala da classe (ex.: `label.opcao`, A14).
 */
import { test as base, expect, type Page } from '@playwright/test'
import { candidatos } from '../src/data/candidatos'
import { candidatosPresidente } from '../src/data/candidatos-presidente'
import quizRJ from '../src/data/quiz.json' with { type: 'json' }
import quizPR from '../src/data/quiz-presidente.json' with { type: 'json' }
import { PERFIL_VAZIO, selecionarCenas } from '../src/lib/perfil'
import type { Perfil, Pergunta } from '../src/types'

export { expect }

export type Eleicao = 'governador-rj' | 'presidente'
export const ELEICOES: Eleicao[] = ['governador-rj', 'presidente']

export const NOMES: Record<Eleicao, string[]> = {
  'governador-rj': candidatos.map((c) => c.nome),
  presidente: candidatosPresidente.map((c) => c.nome),
}

export const NOME_POR_ID: Record<string, string> = Object.fromEntries([...candidatos, ...candidatosPresidente].map((c) => [c.id, c.nome]))

const QUIZ = { 'governador-rj': quizRJ, presidente: quizPR } as const

/** Cenas que o app deve sortear para este perfil (mesma função do app: src/lib/perfil.ts). */
export function cenasEsperadas(eleicao: Eleicao, perfil: Partial<Perfil>): string[] {
  return selecionarCenas(QUIZ[eleicao].perguntas as unknown as Pergunta[], { ...PERFIL_VAZIO, ...perfil }).map((p) => p.id)
}

/** Rótulos das perguntas "sobre você" (src/telas/PerfilPasso.tsx), na ordem da tela. */
const ROTULOS: Record<Exclude<keyof Perfil, 'regiao'>, Record<string, string>> = {
  saude: { sus: 'Posto, UPA ou hospital público', plano_empresa: 'Plano pago pela empresa', plano_proprio: 'Plano pago pela família ou particular' },
  escola: { publica: 'Escola pública', particular: 'Escola particular', nenhuma: 'Não tem criança em idade escolar' },
  deslocamento: {
    publico: 'Ônibus, trem, metrô, BRT ou van',
    carro: 'Carro próprio',
    moto: 'Moto, bicicleta ou a pé',
    app: 'Aplicativo ou táxi',
    casa: 'Trabalho em casa',
  },
  trabalho: {
    carteira: 'Carteira assinada',
    servidor: 'Servidor(a) público(a)',
    autonomo: 'Por conta própria, MEI ou aplicativo',
    empresario: 'Tenho empresa com funcionários',
    aposentado: 'Aposentado(a)',
    sem_trabalho: 'Estudo, procuro trabalho ou cuido da casa',
  },
  banheiros: { '1': '1', '2': '2', '3': '3 ou mais' },
}
const ORDEM_PERFIL: (keyof Perfil)[] = ['regiao', 'saude', 'escola', 'deslocamento', 'trabalho', 'banheiros']

function rotuloDoPerfil(eleicao: Eleicao, campo: keyof Perfil, valor: string | number): string {
  if (campo === 'regiao') {
    const op = QUIZ[eleicao].regioes.opcoes.find((o) => o.valor === valor)
    if (!op) throw new Error(`região ${valor} não existe em ${eleicao}`)
    return op.rotulo
  }
  return ROTULOS[campo][String(valor)]
}

export interface PerfilNomeado {
  nome: string
  perfil: Partial<Perfil>
}

/** Perfis que, juntos, cobrem todas as cenas sorteáveis de cada eleição (conferido no teste 1). */
export const PERFIS: Record<Eleicao, PerfilNomeado[]> = {
  'governador-rj': [
    { nome: 'vazio', perfil: {} },
    { nome: 'leste-privado', perfil: { regiao: 'leste', saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', trabalho: 'empresario', banheiros: 3 } },
    { nome: 'interior-publico', perfil: { regiao: 'interior', saude: 'sus', escola: 'publica', deslocamento: 'publico', trabalho: 'servidor', banheiros: 1 } },
    { nome: 'capital-app', perfil: { regiao: 'capital', saude: 'plano_empresa', escola: 'nenhuma', deslocamento: 'app', trabalho: 'carteira', banheiros: 2 } },
  ],
  presidente: [
    { nome: 'vazio', perfil: {} },
    { nome: 'nordeste-autonomo', perfil: { regiao: 'nordeste', trabalho: 'autonomo' } },
    { nome: 'norte-privado', perfil: { regiao: 'norte', saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', trabalho: 'empresario', banheiros: 3 } },
    { nome: 'sul-plano', perfil: { regiao: 'sul', saude: 'plano_empresa' } },
  ],
}

// ------------------------------------------------------------------ vigia (critério 5)

export interface Vigia {
  erros: string[]
  externas: string[]
  /** Sequência de `data-etapa` vistas no DOM (inclusive as que duram 1 quadro). */
  etapas: () => Promise<string[]>
}

let ipSeq = 0

/**
 * Fixture automática: em todo teste, falha se houver erro de console, exceção na página,
 * violação de CSP ou requisição fora da origem. O POST /api/votos segue para o Worker real,
 * só com um `cf-connecting-ip` único por teste, para o limite de 5 votos/min por IP (que a
 * Cloudflare aplica também no `wrangler dev`) não misturar testes paralelos.
 */
export const test = base.extend<{ vigia: Vigia }>({
  vigia: [
    async ({ page, baseURL }, use, info) => {
      const origem = new URL(baseURL ?? 'http://127.0.0.1:8787').origin
      const erros: string[] = []
      const externas: string[] = []
      await page.addInitScript(() => {
        const w = window as unknown as { __csp: string[]; __etapas: string[] }
        w.__csp = []
        w.__etapas = []
        document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
        const anotar = () => {
          const m = document.querySelector('main[data-etapa]')
          const et = m?.getAttribute('data-etapa')
          if (et && w.__etapas[w.__etapas.length - 1] !== et) w.__etapas.push(et)
        }
        new MutationObserver(anotar).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-etapa'] })
      })
      page.on('console', (m) => {
        if (m.type() === 'error') erros.push(`console: ${m.text()}`)
      })
      page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`))
      page.on('request', (r) => {
        const u = r.url()
        if (!u.startsWith(origem) && !u.startsWith('data:') && !u.startsWith('blob:')) externas.push(u)
      })
      const ip = `10.${info.workerIndex % 250}.${(ipSeq = (ipSeq + 1) % 250)}.${1 + (Date.now() % 250)}`
      await page.route('**/api/votos', (rota) => rota.continue({ headers: { ...rota.request().headers(), 'cf-connecting-ip': ip } }))

      const etapas = () => page.evaluate(() => (window as unknown as { __etapas: string[] }).__etapas ?? [])
      await use({ erros, externas, etapas })

      if (!page.isClosed()) {
        const csp = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []).catch(() => [])
        for (const v of csp) erros.push(`csp: ${v}`)
      }
      expect(erros, `erros de console/CSP:\n${erros.join('\n')}`).toEqual([])
      expect(externas, `requisições externas:\n${externas.join('\n')}`).toEqual([])
    },
    { auto: true },
  ],
})

// ------------------------------------------------------------------ leitura da tela

export interface EstadoTela {
  etapa: string | null
  cena: string | null
  passo: string | null
}

/** Etapa atual, id da cena (pelo `name` do rádio) e progresso; lido de uma vez, sem esperar. */
export function estadoTela(page: Page): Promise<EstadoTela> {
  return page.evaluate(() => {
    const m = document.querySelector('main[data-etapa]')
    const r = document.querySelector<HTMLInputElement>('main[data-etapa="cena"] input[type="radio"]')
    const p = document.querySelector('[data-testid="progresso"]')
    return {
      etapa: m?.getAttribute('data-etapa') ?? null,
      cena: r ? r.name.replace(/^op-/, '') : null,
      passo: p?.getAttribute('aria-valuenow') ?? null,
    }
  })
}

export async function esperarEtapa(page: Page, etapa: string) {
  await expect(page.locator(`main[data-etapa="${etapa}"]`)).toBeVisible()
}

async function esperarMudanca(page: Page, antes: EstadoTela) {
  await expect.poll(() => estadoTela(page), { timeout: 5_000 }).not.toEqual(antes)
}

export const opcoes = (page: Page) => page.locator('main[data-etapa="cena"] input[type="radio"]')
export const cartoesOpcao = (page: Page) => page.locator('main[data-etapa="cena"] label.opcao')
export const ordemOpcoes = (page: Page) => cartoesOpcao(page).evaluateAll((ls) => ls.map((l) => l.getAttribute('data-op')))
export const avancarBtn = (page: Page) => page.getByTestId('cena-avancar')

// ------------------------------------------------------------------ passos do fluxo

export async function abrir(page: Page, eleicao: Eleicao) {
  await page.goto(`/#${eleicao}`)
  await esperarEtapa(page, 'abertura')
}

export async function comecar(page: Page) {
  await page.getByRole('button', { name: /^(Bora começar|Continuar)$/ }).click()
  await esperarEtapa(page, 'perfil')
}

/** Responde "sobre você" tocando nas respostas (campo ausente = "Pular"); `{}` usa "Pular tudo". */
export async function responderPerfil(page: Page, eleicao: Eleicao, perfil: Partial<Perfil>) {
  await esperarEtapa(page, 'perfil')
  if (Object.keys(perfil).length === 0) {
    await page.getByRole('button', { name: 'Pular tudo', exact: true }).click()
    await esperarEtapa(page, 'prioridades')
    return
  }
  const campos = ORDEM_PERFIL.filter((c) => c !== 'regiao' || !!QUIZ[eleicao].regioes)
  for (const campo of campos) {
    const antes = await estadoTela(page)
    expect(antes.etapa).toBe('perfil')
    const valor = perfil[campo]
    if (valor === undefined || valor === null) {
      await page.getByRole('button', { name: 'Pular', exact: true }).click()
    } else {
      await page.getByRole('button', { name: rotuloDoPerfil(eleicao, campo, valor), exact: true }).click()
    }
    await esperarMudanca(page, antes)
  }
  await esperarEtapa(page, 'prioridades')
}

export async function escolherPrioridades(page: Page, temas: string[]) {
  await esperarEtapa(page, 'prioridades')
  for (const t of temas) await page.getByRole('group').getByRole('button', { name: t, exact: true }).click()
  await page.getByRole('button', { name: temas.length ? 'Continuar' : 'Pular', exact: true }).click()
  await expect.poll(async () => (await estadoTela(page)).etapa).not.toBe('prioridades')
}

/** Abertura → perfil → prioridades → 1ª cena. */
export async function irParaCenas(page: Page, eleicao: Eleicao, perfil: Partial<Perfil> = {}, temas: string[] = []) {
  await abrir(page, eleicao)
  await comecar(page)
  await responderPerfil(page, eleicao, perfil)
  await escolherPrioridades(page, temas)
  await esperarEtapa(page, 'cena')
}

/** Toca no "Próxima"/"Nenhuma dessas" e espera a próxima cena (ou a etapa seguinte). */
export async function avancarCena(page: Page) {
  const antes = await estadoTela(page)
  await avancarBtn(page).click()
  await esperarMudanca(page, antes)
}

/** Responde todas as cenas escolhendo a opção `i % n` (a cada `pularCada`, pula). Devolve os ids. */
export async function responderCenas(page: Page, pularCada = 0) {
  const vistas: string[] = []
  for (let i = 0; i < 40; i++) {
    const { etapa, cena } = await estadoTela(page)
    if (etapa !== 'cena' || !cena) break
    vistas.push(cena)
    if (!(pularCada && i % pularCada === pularCada - 1)) {
      const n = await opcoes(page).count()
      await opcoes(page).nth(i % n).check()
    }
    await avancarCena(page)
  }
  return vistas
}

/** Da última cena até o resultado: pula a espera "Comparando…" e os 2 cartões do resumo. */
export async function passarResumo(page: Page) {
  await esperarEtapa(page, 'resumo')
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ver resultado às cegas' })).toBeVisible()
  await page.getByRole('button', { name: 'Ver resultado às cegas' }).click()
  await esperarEtapa(page, 'resultado')
}

/** Nomes de candidatos presentes no texto ou em atributos acessíveis do documento. */
export function nomesNaTela(page: Page, nomes: string[]) {
  return page.evaluate((nomes) => {
    const textos = [document.body.textContent ?? '', document.title]
    for (const el of document.querySelectorAll('[aria-label],[alt],[title],[aria-valuetext]')) {
      for (const a of ['aria-label', 'alt', 'title', 'aria-valuetext']) textos.push(el.getAttribute(a) ?? '')
    }
    const tudo = textos.join('\n')
    return nomes.filter((n) => new RegExp(`(^|[^\\p{L}])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'u').test(tudo))
  }, nomes)
}
