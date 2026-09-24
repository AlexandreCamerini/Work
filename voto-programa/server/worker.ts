/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Workers: o build do site (dist/) é servido como asset estático pela borda;
 * este Worker só atende /api/*. Votos em D1, limite por IP no Rate Limiting da própria
 * Cloudflare (a chave não é persistida por nós), anti-robô com Turnstile.
 */
import { criarApp, lerConfig, verificadorTurnstile } from './app'
import { SQL_PLACAR, SQL_VOTAR, type Urna } from './urna'

interface Env {
  DB: D1Database
  LIMITE_VOTOS: RateLimit
  VOTACAO_ABERTA?: string
  VOTACAO_ABRE_EM?: string
  PLACAR_MINIMO?: string
  TURNSTILE_SITE_KEY?: string
  TURNSTILE_SECRET?: string
}

function urnaD1(db: D1Database): Urna {
  return {
    async votar(eleicao, candidato) {
      await db.prepare(SQL_VOTAR).bind(eleicao, candidato).run()
    },
    async placar(eleicao) {
      const { results } = await db.prepare(SQL_PLACAR).bind(eleicao).all<{ candidato: string; votos: number }>()
      return Object.fromEntries(results.map((r) => [r.candidato, r.votos]))
    },
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const app = criarApp({
      urna: urnaD1(env.DB),
      config: lerConfig(env as unknown as Record<string, string | undefined>),
      limitar: async (chave) => (await env.LIMITE_VOTOS.limit({ key: chave })).success,
      verificarHumano: verificadorTurnstile(env.TURNSTILE_SECRET),
      ipDe: (h) => h('cf-connecting-ip') ?? 'desconhecido',
    })
    return app.fetch(request, env, ctx)
  },
} satisfies ExportedHandler<Env>
