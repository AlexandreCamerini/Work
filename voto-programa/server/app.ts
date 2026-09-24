import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { ELEICOES } from './eleicoes'
import type { Urna } from './urna'

export interface Config {
  /** Coleta e placar ligados. Enquete é proibida durante a campanha (Lei 9.504/97, art. 33, §5º). */
  votacaoAberta: boolean
  /** Data exibida enquanto a votação estiver fechada (AAAA-MM-DD). */
  abreEm: string | null
  /** Abaixo disso o placar mostra só o total, não a divisão por candidato. */
  placarMinimo: number
  turnstileSiteKey: string | null
}

export interface Dependencias {
  urna: Urna
  config: Config
  /** true se ainda cabe voto para esta chave. A chave vive só na memória do limitador. */
  limitar: (chave: string) => Promise<boolean>
  /** true se o desafio anti-robô passou (ou se não há desafio configurado). */
  verificarHumano: (token: string | undefined) => Promise<boolean>
  /** IP da requisição, usado só como chave do limitador; nunca é gravado nem logado. */
  ipDe: (cabecalho: (nome: string) => string | undefined) => string
}

export const CABECALHOS_SEGURANCA: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com',
    "connect-src 'self'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

export function criarApp(dep: Dependencias) {
  const app = new Hono()

  app.use('*', async (c, next) => {
    await next()
    for (const [nome, valor] of Object.entries(CABECALHOS_SEGURANCA)) c.header(nome, valor)
  })
  app.use('/api/*', async (c, next) => {
    await next()
    if (!c.res.headers.has('Cache-Control')) c.header('Cache-Control', 'no-store')
  })

  app.get('/api/estado', (c) =>
    c.json({
      aberta: dep.config.votacaoAberta,
      abreEm: dep.config.abreEm,
      turnstileSiteKey: dep.config.votacaoAberta ? dep.config.turnstileSiteKey : null,
    }),
  )

  app.post(
    '/api/votos',
    bodyLimit({ maxSize: 4 * 1024, onError: (c) => c.json({ erro: 'grande_demais' }, 413) }),
    async (c) => {
      if (!dep.config.votacaoAberta) return c.json({ erro: 'votacao_fechada' }, 403)
      // outro site não vota por aqui: exige JSON (força preflight de CORS, que não liberamos)
      // e, quando o navegador informa a origem, ela tem de ser esta
      const origem = c.req.header('origin')
      // compara só o host: atrás de proxy (Railway) o processo enxerga http, o navegador https
      const host = c.req.header('x-forwarded-host') ?? c.req.header('host') ?? new URL(c.req.url).host
      if (origem && URL.canParse(origem) && new URL(origem).host !== host) return c.json({ erro: 'origem' }, 403)
      if (origem && !URL.canParse(origem)) return c.json({ erro: 'origem' }, 403)
      if (!c.req.header('content-type')?.startsWith('application/json')) return c.json({ erro: 'tipo' }, 415)

      let corpo: unknown
      try {
        corpo = await c.req.json()
      } catch {
        return c.json({ erro: 'json_invalido' }, 400)
      }
      const { eleicao, candidato, token } = (corpo ?? {}) as Record<string, unknown>
      if (typeof eleicao !== 'string' || typeof candidato !== 'string' || !ELEICOES[eleicao]?.includes(candidato)) {
        return c.json({ erro: 'voto_invalido' }, 400)
      }
      if (token !== undefined && typeof token !== 'string') return c.json({ erro: 'voto_invalido' }, 400)

      if (!(await dep.limitar(dep.ipDe((n) => c.req.header(n))))) return c.json({ erro: 'devagar' }, 429)
      if (!(await dep.verificarHumano(token))) return c.json({ erro: 'desafio' }, 403)

      await dep.urna.votar(eleicao, candidato)
      return c.body(null, 204)
    },
  )

  app.get('/api/placar/:eleicao', async (c) => {
    const eleicao = c.req.param('eleicao')
    const validos = ELEICOES[eleicao]
    if (!validos) return c.json({ erro: 'eleicao_desconhecida' }, 404)
    if (!dep.config.votacaoAberta) return c.json({ erro: 'votacao_fechada', abreEm: dep.config.abreEm }, 403)

    const bruto = await dep.urna.placar(eleicao)
    const votos = Object.fromEntries(validos.map((id) => [id, bruto[id] ?? 0]))
    const total = Object.values(votos).reduce((a, b) => a + b, 0)
    c.header('Cache-Control', 'public, max-age=30')
    return c.json({ total, minimo: dep.config.placarMinimo, votos: total >= dep.config.placarMinimo ? votos : null })
  })

  app.all('/api/*', (c) => c.json({ erro: 'nao_encontrado' }, 404))
  return app
}

/** Validação do token do Cloudflare Turnstile. Não envia o IP do eleitor para a Cloudflare. */
export function verificadorTurnstile(segredo: string | undefined, buscar: typeof fetch = fetch) {
  return async (token: string | undefined) => {
    if (!segredo) return true
    if (!token) return false
    const corpo = new FormData()
    corpo.append('secret', segredo)
    corpo.append('response', token)
    try {
      const resp = await buscar('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: corpo })
      const dados = (await resp.json()) as { success?: boolean }
      return dados.success === true
    } catch {
      return false
    }
  }
}

export function lerConfig(env: Record<string, string | undefined>): Config {
  return {
    votacaoAberta: env.VOTACAO_ABERTA === 'true',
    abreEm: env.VOTACAO_ABRE_EM || null,
    placarMinimo: Number(env.PLACAR_MINIMO) > 0 ? Number(env.PLACAR_MINIMO) : 30,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
  }
}
