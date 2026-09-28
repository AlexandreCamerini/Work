import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { ELEICOES } from './eleicoes'
import type { Urna } from './urna'

/**
 * Nenhum resultado é divulgado: não existe rota de leitura. Enquete, pela Res. TSE 23.600/2019,
 * art. 23, §1º, é o levantamento "quando apresentados resultados que possibilitem ao eleitor
 * inferir a ordem dos candidatos"; aqui nada é apresentado, e durante a campanha nem se conta
 * voto por candidato.
 */
export interface Config {
  /** Recebe votos e grava a posição do candidato votado no ranking de afinidade da pessoa. */
  coletaAtiva: boolean
  /** Também soma +1 ao candidato. Desligado durante a campanha; ligar só após o 2º turno e com aval jurídico. */
  contarCandidato: boolean
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
      coleta: dep.config.coletaAtiva,
      contaCandidato: dep.config.coletaAtiva && dep.config.contarCandidato,
      turnstileSiteKey: dep.config.coletaAtiva ? dep.config.turnstileSiteKey : null,
    }),
  )

  app.post(
    '/api/votos',
    bodyLimit({ maxSize: 4 * 1024, onError: (c) => c.json({ erro: 'grande_demais' }, 413) }),
    async (c) => {
      if (!dep.config.coletaAtiva) return c.json({ erro: 'coleta_desligada' }, 403)
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
      const { eleicao, posicao, candidato, token } = (corpo ?? {}) as Record<string, unknown>
      const validos = typeof eleicao === 'string' ? ELEICOES[eleicao] : undefined
      if (!validos || typeof eleicao !== 'string') return c.json({ erro: 'voto_invalido' }, 400)
      if (typeof posicao !== 'number' || !Number.isInteger(posicao) || posicao < 1 || posicao > validos.length) {
        return c.json({ erro: 'voto_invalido' }, 400)
      }
      if (candidato !== undefined && (typeof candidato !== 'string' || !validos.includes(candidato))) {
        return c.json({ erro: 'voto_invalido' }, 400)
      }
      if (token !== undefined && typeof token !== 'string') return c.json({ erro: 'voto_invalido' }, 400)

      if (!(await dep.limitar(dep.ipDe((n) => c.req.header(n))))) return c.json({ erro: 'devagar' }, 429)
      if (!(await dep.verificarHumano(token))) return c.json({ erro: 'desafio' }, 403)

      await dep.urna.registrarPosicao(eleicao, posicao)
      // com a contagem desligada, o candidato é descartado aqui: nunca chega ao banco
      if (dep.config.contarCandidato && typeof candidato === 'string') await dep.urna.registrarCandidato(eleicao, candidato)
      return c.body(null, 204)
    },
  )

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
    coletaAtiva: env.COLETA_ATIVA === 'true',
    contarCandidato: env.CONTAR_CANDIDATO === 'true',
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
  }
}
