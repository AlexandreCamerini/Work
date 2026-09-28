// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { criarApp, lerConfig, verificadorTurnstile, type Config } from './app'
import { urnaEmMemoria } from './urna'

const ORIGEM = 'https://quiz.exemplo.org'

function montar(config: Partial<Config> = {}, extra: { limite?: number; humano?: boolean } = {}) {
  const urna = urnaEmMemoria()
  let usados = 0
  const app = criarApp({
    urna,
    config: { coletaAtiva: true, contarCandidato: false, turnstileSiteKey: 'site', ...config },
    limitar: async () => ++usados <= (extra.limite ?? 100),
    verificarHumano: async () => extra.humano ?? true,
    ipDe: () => '203.0.113.9',
  })
  const votar = (corpo: unknown, origem = ORIGEM) =>
    app.request(`${ORIGEM}/api/votos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origem },
      body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
    })
  return { app, urna, votar }
}

const VOTO = { eleicao: 'presidente', posicao: 1, candidato: 'lula' }

describe('API de votos', () => {
  it('durante a campanha grava só a posição no ranking e descarta o candidato', async () => {
    const { votar, urna } = montar()
    expect((await votar(VOTO)).status).toBe(204)
    expect((await votar({ eleicao: 'presidente', posicao: 2 })).status).toBe(204)
    expect(urna.contagem()).toEqual({ posicoes: { 'presidente/1': 1, 'presidente/2': 1 }, candidatos: {} })
  })

  it('com a contagem por candidato ligada, soma também o candidato', async () => {
    const { votar, urna } = montar({ contarCandidato: true })
    await votar(VOTO)
    expect(urna.contagem().candidatos).toEqual({ 'presidente/lula': 1 })
  })

  it('não existe rota pública de resultado', async () => {
    const { app } = montar({ contarCandidato: true })
    expect((await app.request(`${ORIGEM}/api/placar/presidente`)).status).toBe(404)
    const estado = await (await app.request(`${ORIGEM}/api/estado`)).json()
    expect(estado).toEqual({ coleta: true, contaCandidato: true, turnstileSiteKey: 'site' })
  })

  it('recusa tudo com a coleta desligada', async () => {
    const { app, votar, urna } = montar({ coletaAtiva: false, contarCandidato: true })
    expect((await votar(VOTO)).status).toBe(403)
    expect(urna.contagem()).toEqual({ posicoes: {}, candidatos: {} })
    const estado = await (await app.request(`${ORIGEM}/api/estado`)).json()
    expect(estado).toEqual({ coleta: false, contaCandidato: false, turnstileSiteKey: null })
  })

  it('recusa posição fora do ranking, candidato de outra eleição, eleição inventada e JSON quebrado', async () => {
    const { votar } = montar()
    expect((await votar({ ...VOTO, posicao: 3 })).status).toBe(400)
    expect((await votar({ ...VOTO, posicao: 0 })).status).toBe(400)
    expect((await votar({ ...VOTO, posicao: 1.5 })).status).toBe(400)
    expect((await votar({ ...VOTO, candidato: 'eduardo-paes' })).status).toBe(400)
    expect((await votar({ ...VOTO, eleicao: 'prefeito' })).status).toBe(400)
    expect((await votar('{nao é json')).status).toBe(400)
    expect((await votar({ ...VOTO, token: 42 })).status).toBe(400)
  })

  it('recusa voto vindo de outro site ou fora de JSON', async () => {
    const { app, votar } = montar()
    expect((await votar(VOTO, 'https://outro.site')).status).toBe(403)
    const textoPuro = await app.request(`${ORIGEM}/api/votos`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: ORIGEM },
      body: JSON.stringify(VOTO),
    })
    expect(textoPuro.status).toBe(415)
  })

  it('recusa corpo grande demais', async () => {
    const { votar } = montar()
    expect((await votar({ ...VOTO, lixo: 'x'.repeat(10_000) })).status).toBe(413)
  })

  it('limita a taxa e exige o desafio anti-robô', async () => {
    const limitado = montar({}, { limite: 1 })
    expect((await limitado.votar(VOTO)).status).toBe(204)
    expect((await limitado.votar(VOTO)).status).toBe(429)
    const robo = montar({}, { humano: false })
    expect((await robo.votar(VOTO)).status).toBe(403)
  })

  it('manda cabeçalhos de segurança e não deixa a API em cache', async () => {
    const { app } = montar()
    const r = await app.request(`${ORIGEM}/api/estado`)
    expect(r.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")
    expect(r.headers.get('referrer-policy')).toBe('no-referrer')
    expect(r.headers.get('cache-control')).toBe('no-store')
  })
})

describe('configuração', () => {
  it('coleta e contagem por candidato ficam desligadas por padrão', () => {
    expect(lerConfig({})).toMatchObject({ coletaAtiva: false, contarCandidato: false })
    expect(lerConfig({ COLETA_ATIVA: 'sim', CONTAR_CANDIDATO: '1' })).toMatchObject({ coletaAtiva: false, contarCandidato: false })
  })

  it('Turnstile: sem segredo passa; com segredo, exige token válido e não envia IP', async () => {
    expect(await verificadorTurnstile(undefined)('x')).toBe(true)
    let enviado: FormData | undefined
    const falso = (async (_url: string, init: RequestInit) => {
      enviado = init.body as FormData
      return new Response(JSON.stringify({ success: true }))
    }) as unknown as typeof fetch
    expect(await verificadorTurnstile('s', falso)(undefined)).toBe(false)
    expect(await verificadorTurnstile('s', falso)('tok')).toBe(true)
    expect(enviado?.has('remoteip')).toBe(false)
  })
})

describe('cabeçalhos dos arquivos estáticos (Cloudflare)', () => {
  it('public/_headers repete os cabeçalhos da API', async () => {
    const { readFileSync } = await import('node:fs')
    const { CABECALHOS_SEGURANCA } = await import('./app')
    const arquivo = readFileSync('public/_headers', 'utf8')
    for (const [nome, valor] of Object.entries(CABECALHOS_SEGURANCA)) expect(arquivo).toContain(`${nome}: ${valor}`)
  })
})
