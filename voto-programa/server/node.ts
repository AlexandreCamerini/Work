/**
 * Node (Railway ou qualquer VPS): serve dist/ e /api/* no mesmo processo.
 * Votos em Postgres (DATABASE_URL); sem ela, urna em memória só para desenvolvimento.
 * Atenção: o Railway grava o IP de origem de toda requisição nos logs HTTP da
 * plataforma; ver README antes de escolher este caminho.
 */
import { createHash, randomBytes } from 'node:crypto'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import postgres from 'postgres'
import { criarApp, lerConfig, verificadorTurnstile } from './app'
import { SQL_CANDIDATO, SQL_POSICAO, type Urna, urnaEmMemoria } from './urna'

const SQL_TABELAS = [
  `CREATE TABLE IF NOT EXISTS placar (
    eleicao TEXT NOT NULL, candidato TEXT NOT NULL, votos INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (eleicao, candidato))`,
  `CREATE TABLE IF NOT EXISTS posicao_voto (
    eleicao TEXT NOT NULL, posicao INTEGER NOT NULL, votos INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (eleicao, posicao))`,
]

function paraPostgres(sql: string) {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

async function urnaPostgres(url: string): Promise<Urna> {
  const sql = postgres(url, { max: 5 })
  for (const tabela of SQL_TABELAS) await sql.unsafe(tabela)
  return {
    async registrarPosicao(eleicao, posicao) {
      await sql.unsafe(paraPostgres(SQL_POSICAO), [eleicao, posicao])
    },
    async registrarCandidato(eleicao, candidato) {
      await sql.unsafe(paraPostgres(SQL_CANDIDATO), [eleicao, candidato])
    },
  }
}

/** Janela deslizante em memória. A chave é o IP com sal aleatório por processo: nem a memória guarda o IP. */
function limitadorEmMemoria(limite: number, janelaMs: number) {
  const sal = randomBytes(16)
  const marcas = new Map<string, number[]>()
  setInterval(() => {
    const corte = Date.now() - janelaMs
    for (const [k, v] of marcas) if (v.every((t) => t < corte)) marcas.delete(k)
  }, janelaMs).unref()
  return async (chave: string) => {
    const k = createHash('sha256').update(sal).update(chave).digest('base64url')
    const agora = Date.now()
    const recentes = (marcas.get(k) ?? []).filter((t) => t > agora - janelaMs)
    if (recentes.length >= limite) return false
    marcas.set(k, [...recentes, agora])
    return true
  }
}

const env = process.env
const urna = env.DATABASE_URL ? await urnaPostgres(env.DATABASE_URL) : urnaEmMemoria()
if (!env.DATABASE_URL) console.warn('DATABASE_URL ausente: votos só em memória (desenvolvimento).')

const api = criarApp({
  urna,
  config: lerConfig(env),
  limitar: limitadorEmMemoria(5, 60_000),
  verificarHumano: verificadorTurnstile(env.TURNSTILE_SECRET),
  // no Railway, X-Real-IP vem da borda da plataforma
  ipDe: (h) => h('x-real-ip') ?? 'desconhecido',
})
api.use('/*', serveStatic({ root: './dist' }))

const porta = Number(env.PORT ?? 3000)
serve({ fetch: api.fetch, port: porta, hostname: '0.0.0.0' })
console.log(`ouvindo na porta ${porta}`)
