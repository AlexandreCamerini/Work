import { describe, expect, it } from 'vitest'
import { criarApp, lerConfig, verificadorTurnstile, type Config } from './app'
import { urnaEmMemoria } from './urna'

const ORIGEM = 'https://quiz.exemplo.org'

function montar(config: Partial<Config> = {}, extra: { limite?: number; humano?: boolean } = {}) {
  const urna = urnaEmMemoria()
  let usados = 0
  const app = criarApp({
    urna,
    config: { votacaoAberta: true, abreEm: '2026-10-26', placarMinimo: 2, turnstileSiteKey: 'site', ...config },
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

describe('API de votos', () => {
  it('conta o voto e só mostra a divisão acima do mínimo', async () => {
    const { app, votar } = montar()
    expect((await votar({ eleicao: 'presidente', candidato: 'lula' })).status).toBe(204)
    let placar = await (await app.request(`${ORIGEM}/api/placar/presidente`)).json()
    expect(placar).toEqual({ total: 1, minimo: 2, votos: null })
    await votar({ eleicao: 'presidente', candidato: 'flavio-bolsonaro' })
    placar = await (await app.request(`${ORIGEM}/api/placar/presidente`)).json()
    expect(placar.votos).toEqual({ lula: 1, 'flavio-bolsonaro': 1 })
  })

  it('recusa tudo com a votação fechada (período de campanha)', async () => {
    const { app, votar, urna } = montar({ votacaoAberta: false })
    expect((await votar({ eleicao: 'presidente', candidato: 'lula' })).status).toBe(403)
    expect((await app.request(`${ORIGEM}/api/placar/presidente`)).status).toBe(403)
    expect(await urna.placar('presidente')).toEqual({})
    const estado = await (await app.request(`${ORIGEM}/api/estado`)).json()
    expect(estado).toEqual({ aberta: false, abreEm: '2026-10-26', turnstileSiteKey: null })
  })

  it('recusa candidato fora da eleição, eleição inventada e JSON quebrado', async () => {
    const { votar } = montar()
    expect((await votar({ eleicao: 'presidente', candidato: 'eduardo-paes' })).status).toBe(400)
    expect((await votar({ eleicao: 'prefeito', candidato: 'lula' })).status).toBe(400)
    expect((await votar('{nao é json')).status).toBe(400)
    expect((await votar({ eleicao: 'presidente', candidato: 'lula', token: 42 })).status).toBe(400)
  })

  it('recusa voto vindo de outro site ou fora de JSON', async () => {
    const { app, votar } = montar()
    expect((await votar({ eleicao: 'presidente', candidato: 'lula' }, 'https://outro.site')).status).toBe(403)
    const textoPuro = await app.request(`${ORIGEM}/api/votos`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: ORIGEM },
      body: JSON.stringify({ eleicao: 'presidente', candidato: 'lula' }),
    })
    expect(textoPuro.status).toBe(415)
  })

  it('recusa corpo grande demais', async () => {
    const { votar } = montar()
    expect((await votar({ eleicao: 'presidente', candidato: 'lula', lixo: 'x'.repeat(10_000) })).status).toBe(413)
  })

  it('limita a taxa e exige o desafio anti-robô', async () => {
    const limitado = montar({}, { limite: 1 })
    expect((await limitado.votar({ eleicao: 'presidente', candidato: 'lula' })).status).toBe(204)
    expect((await limitado.votar({ eleicao: 'presidente', candidato: 'lula' })).status).toBe(429)
    const robo = montar({}, { humano: false })
    expect((await robo.votar({ eleicao: 'presidente', candidato: 'lula' })).status).toBe(403)
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
  it('votação fica fechada por padrão', () => {
    expect(lerConfig({}).votacaoAberta).toBe(false)
    expect(lerConfig({ VOTACAO_ABERTA: 'sim' }).votacaoAberta).toBe(false)
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
