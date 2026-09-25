/**
 * Máquina de estados do fluxo do quiz. Pura: sem React, sem window, sem Math.random.
 * O sorteio (ordem das cenas e das opções) vem de uma `semente` que o hook anexa aos
 * eventos de avanço; com a mesma semente, o resultado é sempre o mesmo.
 *
 * abertura → perfil[0..n-1] → prioridades → cena[0..N-1] → resumo[0..1] → resultado
 *   → voto → contagem → revelacao → cartao
 */
import { embaralhar, misturarTemas, type Sorteio } from '../lib/ordem'
import { PERFIL_VAZIO, selecionarCenas } from '../lib/perfil'
import type { ResultadoVoto } from '../lib/votacao'
import type { Perfil, Pergunta, Resposta } from '../types'

export const MAX_PRIORIDADES = 3
export const CARTOES_RESUMO = 2
const VERSAO = 1

export type CampoPerfil = keyof Perfil

/** Ordem das perguntas "sobre você". A de região só existe quando a eleição a define. */
export const CAMPOS_PERFIL: CampoPerfil[] = ['saude', 'escola', 'deslocamento', 'trabalho', 'banheiros']

export type Etapa =
  | { tipo: 'abertura' }
  | { tipo: 'perfil'; passo: number }
  | { tipo: 'prioridades' }
  | { tipo: 'cena'; indice: number }
  | { tipo: 'resumo'; cartao: number }
  | { tipo: 'resultado' }
  | { tipo: 'voto' }
  | { tipo: 'contagem' }
  | { tipo: 'revelacao' }
  | { tipo: 'cartao' }

export type TipoEtapa = Etapa['tipo']

export interface VotoFeito {
  /** null = preferiu não votar. */
  candidatoId: string | null
  resultado: ResultadoVoto
}

export type Marco = 'metade' | 'ultima'

export interface EstadoFluxo {
  versao: number
  etapa: Etapa
  /** Sentido da última transição: anima a entrada e decide se o histórico ganha entrada nova. */
  direcao: 'frente' | 'tras'
  passosPerfil: CampoPerfil[]
  perfil: Perfil
  /** [] = pulou ou não marcou: todos os temas valem igual (mesma semântica de antes). */
  prioridades: string[]
  /** Ids das cenas na ordem sorteada, fixada ao sair do perfil. */
  cenas: string[]
  /** Ordem das opções de cada cena, sorteada uma vez. */
  ordemOpcoes: Record<string, string[]>
  /** cenaId → opcaoId; null = pulou; ausente = ainda sem resposta. */
  respostas: Record<string, string | null>
  marcosVistos: Marco[]
  /** Marco a anunciar ao chegar nesta cena (só na ida, uma vez cada). */
  marco: Marco | null
  /** Escolha na tela de voto, antes de confirmar. `{ candidatoId: null }` = "prefiro não votar". */
  escolhaVoto: { candidatoId: string | null } | null
  voto: VotoFeito | null
  revelados: string[]
}

export type Evento =
  | { tipo: 'escolher'; valor: string | number | null }
  | { tipo: 'avancar'; semente?: number }
  | { tipo: 'pular'; semente?: number; tudo?: boolean }
  | { tipo: 'voltar' }
  | { tipo: 'votar'; candidatoId: string | null; resultado: ResultadoVoto }
  | { tipo: 'revelar'; candidatoId?: string }
  | { tipo: 'reiniciar' }

export interface ContextoFluxo {
  perguntas: Pergunta[]
  /** Ids dos candidatos na ordem do resultado; usado para saber quando todos foram revelados. */
  candidatos?: string[]
}

export function passosDoPerfil(temRegiao: boolean): CampoPerfil[] {
  return temRegiao ? ['regiao', ...CAMPOS_PERFIL] : [...CAMPOS_PERFIL]
}

export function estadoInicial(passosPerfil: CampoPerfil[]): EstadoFluxo {
  return {
    versao: VERSAO,
    etapa: { tipo: 'abertura' },
    direcao: 'frente',
    passosPerfil,
    perfil: { ...PERFIL_VAZIO },
    prioridades: [],
    cenas: [],
    ordemOpcoes: {},
    respostas: {},
    marcosVistos: [],
    marco: null,
    escolhaVoto: null,
    voto: null,
    revelados: [],
  }
}

/** mulberry32: gerador determinístico a partir de uma semente inteira. */
export function geradorDaSemente(semente: number): Sorteio {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function mesmoConjunto(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const s = new Set(a)
  return b.every((x) => s.has(x))
}

/**
 * Seleciona as cenas do perfil. Se o conjunto for o mesmo de antes, nada muda (ordem e
 * respostas ficam). Se mudou, sorteia a ordem de novo; as respostas e a ordem das opções
 * das cenas que continuam são mantidas, e as das que saíram são descartadas.
 */
function fixarCenas(ctx: ContextoFluxo, e: EstadoFluxo, semente: number): EstadoFluxo {
  const selecionadas = selecionarCenas(ctx.perguntas, e.perfil)
  const ids = selecionadas.map((p) => p.id)
  if (e.cenas.length > 0 && mesmoConjunto(ids, e.cenas)) return e
  const sorteio = geradorDaSemente(semente)
  const cenas = misturarTemas(selecionadas, sorteio).map((p) => p.id)
  const ordemOpcoes: Record<string, string[]> = {}
  const respostas: Record<string, string | null> = {}
  for (const p of selecionadas) {
    ordemOpcoes[p.id] = e.ordemOpcoes[p.id] ?? embaralhar(p.opcoes.map((o) => o.id), sorteio)
    if (p.id in e.respostas) respostas[p.id] = e.respostas[p.id]
  }
  return { ...e, cenas, ordemOpcoes, respostas }
}

function ir(e: EstadoFluxo, etapa: Etapa, direcao: 'frente' | 'tras'): EstadoFluxo {
  return { ...e, etapa, direcao, marco: null }
}

/** Chega numa cena indo para a frente: decide o marco ("Metade!", "Última!"). */
function chegarNaCena(e: EstadoFluxo, indice: number): EstadoFluxo {
  const n = e.cenas.length
  const metade = Math.ceil(n / 2) - 1
  let marco: Marco | null = null
  if (indice === n - 1 && n > 1 && !e.marcosVistos.includes('ultima')) marco = 'ultima'
  else if (indice === metade && indice > 0 && !e.marcosVistos.includes('metade')) marco = 'metade'
  return {
    ...e,
    etapa: { tipo: 'cena', indice },
    direcao: 'frente',
    marco,
    marcosVistos: marco ? [...e.marcosVistos, marco] : e.marcosVistos,
  }
}

function sementeDe(ev: Evento): number {
  return 'semente' in ev && typeof ev.semente === 'number' ? ev.semente : 1
}

function sairDoPerfil(ctx: ContextoFluxo, e: EstadoFluxo, ev: Evento): EstadoFluxo {
  return ir(fixarCenas(ctx, e, sementeDe(ev)), { tipo: 'prioridades' }, 'frente')
}

function entrarNasCenas(ctx: ContextoFluxo, e: EstadoFluxo, ev: Evento): EstadoFluxo {
  const comCenas = e.cenas.length ? e : fixarCenas(ctx, e, sementeDe(ev))
  if (!comCenas.cenas.length) return ir(comCenas, { tipo: 'resumo', cartao: 0 }, 'frente')
  return chegarNaCena(comCenas, 0)
}

function proximaCena(e: EstadoFluxo, indice: number): EstadoFluxo {
  if (indice + 1 < e.cenas.length) return chegarNaCena(e, indice + 1)
  return ir(e, { tipo: 'resumo', cartao: 0 }, 'frente')
}

function todosRevelados(ctx: ContextoFluxo, e: EstadoFluxo) {
  return !!ctx.candidatos && ctx.candidatos.every((id) => e.revelados.includes(id))
}

export function reduzir(ctx: ContextoFluxo, e: EstadoFluxo, ev: Evento): EstadoFluxo {
  if (ev.tipo === 'reiniciar') return estadoInicial(e.passosPerfil)
  const etapa = e.etapa

  switch (etapa.tipo) {
    case 'abertura':
      if (ev.tipo === 'avancar') return ir(e, { tipo: 'perfil', passo: 0 }, 'frente')
      return e

    case 'perfil': {
      const campo = e.passosPerfil[etapa.passo]
      const ultimo = etapa.passo >= e.passosPerfil.length - 1
      const seguir = (base: EstadoFluxo) =>
        ultimo ? sairDoPerfil(ctx, base, ev) : ir(base, { tipo: 'perfil', passo: etapa.passo + 1 }, 'frente')
      switch (ev.tipo) {
        case 'escolher':
          // tocar na mesma resposta não desmarca: ela só avança (a tela avança sozinha)
          return { ...e, perfil: { ...e.perfil, [campo]: ev.valor } as Perfil }
        case 'avancar':
          return seguir(e)
        case 'pular':
          if (ev.tudo) return sairDoPerfil(ctx, { ...e, perfil: { ...PERFIL_VAZIO } }, ev)
          return seguir({ ...e, perfil: { ...e.perfil, [campo]: null } as Perfil })
        case 'voltar':
          return etapa.passo > 0 ? ir(e, { tipo: 'perfil', passo: etapa.passo - 1 }, 'tras') : ir(e, { tipo: 'abertura' }, 'tras')
        default:
          return e
      }
    }

    case 'prioridades':
      switch (ev.tipo) {
        case 'escolher': {
          const tema = String(ev.valor)
          if (e.prioridades.includes(tema)) return { ...e, prioridades: e.prioridades.filter((t) => t !== tema) }
          if (e.prioridades.length >= MAX_PRIORIDADES) return e
          return { ...e, prioridades: [...e.prioridades, tema] }
        }
        case 'avancar':
          return entrarNasCenas(ctx, e, ev)
        case 'pular':
          return entrarNasCenas(ctx, { ...e, prioridades: [] }, ev)
        case 'voltar':
          return ir(e, { tipo: 'perfil', passo: e.passosPerfil.length - 1 }, 'tras')
        default:
          return e
      }

    case 'cena': {
      const id = e.cenas[etapa.indice]
      switch (ev.tipo) {
        case 'escolher': {
          const valor = ev.valor === null ? null : String(ev.valor)
          const respostas = { ...e.respostas }
          // troca livre; tocar de novo na escolhida desmarca
          if (valor === null || respostas[id] === valor) delete respostas[id]
          else respostas[id] = valor
          return { ...e, respostas, marco: null }
        }
        case 'avancar':
          if (typeof e.respostas[id] === 'string') return proximaCena(e, etapa.indice)
          return proximaCena({ ...e, respostas: { ...e.respostas, [id]: null } }, etapa.indice)
        case 'pular':
          return proximaCena({ ...e, respostas: { ...e.respostas, [id]: null } }, etapa.indice)
        case 'voltar':
          return etapa.indice > 0 ? ir(e, { tipo: 'cena', indice: etapa.indice - 1 }, 'tras') : ir(e, { tipo: 'prioridades' }, 'tras')
        default:
          return e
      }
    }

    case 'resumo':
      switch (ev.tipo) {
        case 'avancar':
          return etapa.cartao + 1 < CARTOES_RESUMO
            ? ir(e, { tipo: 'resumo', cartao: etapa.cartao + 1 }, 'frente')
            : ir(e, { tipo: 'resultado' }, 'frente')
        case 'pular':
          return ir(e, { tipo: 'resultado' }, 'frente')
        case 'voltar':
          if (etapa.cartao > 0) return ir(e, { tipo: 'resumo', cartao: etapa.cartao - 1 }, 'tras')
          return e.cenas.length ? ir(e, { tipo: 'cena', indice: e.cenas.length - 1 }, 'tras') : ir(e, { tipo: 'prioridades' }, 'tras')
        default:
          return e
      }

    case 'resultado':
      switch (ev.tipo) {
        case 'avancar':
          return ir(e, { tipo: 'voto' }, 'frente')
        case 'pular':
          // "prefiro não votar, só quero ver os nomes": nada é enviado
          return ir({ ...e, voto: { candidatoId: null, resultado: 'nao_enviado' }, revelados: [] }, { tipo: 'contagem' }, 'frente')
        case 'voltar':
          return ir(e, { tipo: 'resumo', cartao: CARTOES_RESUMO - 1 }, 'tras')
        default:
          return e
      }

    case 'voto':
      switch (ev.tipo) {
        case 'escolher':
          return { ...e, escolhaVoto: { candidatoId: ev.valor === null ? null : String(ev.valor) } }
        case 'votar':
          return ir({ ...e, voto: { candidatoId: ev.candidatoId, resultado: ev.resultado }, revelados: [] }, { tipo: 'contagem' }, 'frente')
        case 'voltar':
          return ir(e, { tipo: 'resultado' }, 'tras')
        default:
          return e
      }

    case 'contagem':
      if (ev.tipo === 'avancar') return ir(e, { tipo: 'revelacao' }, 'frente')
      return e

    case 'revelacao':
      switch (ev.tipo) {
        case 'revelar': {
          if (ev.candidatoId === undefined) return { ...e, revelados: [...new Set([...e.revelados, ...(ctx.candidatos ?? [])])] }
          if (e.revelados.includes(ev.candidatoId)) return e
          return { ...e, revelados: [...e.revelados, ev.candidatoId] }
        }
        case 'avancar': {
          const tudo = { ...e, revelados: [...new Set([...e.revelados, ...(ctx.candidatos ?? [])])] }
          return todosRevelados(ctx, e) ? ir(tudo, { tipo: 'cartao' }, 'frente') : tudo
        }
        default:
          // sem Voltar: o voto já foi mostrado e voltar ao "às cegas" não faz sentido
          return e
      }

    case 'cartao':
      if (ev.tipo === 'voltar') return ir(e, { tipo: 'revelacao' }, 'tras')
      return e
  }
}

/* ------------------------------ seletores ------------------------------ */

/** Exatamente o array de antes: na ordem das cenas, sem as puladas nem as sem resposta. */
export function respostasOrdenadas(e: Pick<EstadoFluxo, 'cenas' | 'respostas'>): Resposta[] {
  const saida: Resposta[] = []
  for (const id of e.cenas) {
    const opcaoId = e.respostas[id]
    if (typeof opcaoId === 'string') saida.push({ perguntaId: id, opcaoId })
  }
  return saida
}

export function podeVoltar(e: EstadoFluxo): boolean {
  return !['abertura', 'contagem', 'revelacao'].includes(e.etapa.tipo)
}

/** Chave estável da tela atual (troca de foco, histórico, animação). */
export function chaveDaEtapa(etapa: Etapa): string {
  switch (etapa.tipo) {
    case 'perfil':
      return `perfil/${etapa.passo}`
    case 'cena':
      return `cena/${etapa.indice}`
    case 'resumo':
      return `resumo/${etapa.cartao}`
    default:
      return etapa.tipo
  }
}

export function excedePrioridades(e: EstadoFluxo, tema: string) {
  return !e.prioridades.includes(tema) && e.prioridades.length >= MAX_PRIORIDADES
}

/* ------------------------------ persistência ------------------------------ */

function ehTexto(v: unknown): v is string {
  return typeof v === 'string'
}

/**
 * Valida um estado lido do sessionStorage contra o quiz carregado. Qualquer coisa estranha
 * (versão, ids que não existem mais, índices fora do lugar) descarta o progresso.
 */
export function restaurar(ctx: ContextoFluxo, passosPerfil: CampoPerfil[], bruto: unknown): EstadoFluxo | null {
  if (!bruto || typeof bruto !== 'object') return null
  const e = bruto as EstadoFluxo
  if (e.versao !== VERSAO || !e.etapa || typeof e.etapa.tipo !== 'string') return null
  if (!Array.isArray(e.passosPerfil) || e.passosPerfil.join() !== passosPerfil.join()) return null
  if (!Array.isArray(e.cenas) || !e.cenas.every(ehTexto)) return null
  if (!Array.isArray(e.prioridades) || !e.prioridades.every(ehTexto) || e.prioridades.length > MAX_PRIORIDADES) return null
  if (!e.perfil || typeof e.perfil !== 'object' || !e.respostas || !e.ordemOpcoes) return null
  const porId = new Map(ctx.perguntas.map((p) => [p.id, p]))
  for (const id of e.cenas) {
    const p = porId.get(id)
    const ordem = e.ordemOpcoes[id]
    if (!p || !Array.isArray(ordem) || !mesmoConjunto(ordem, p.opcoes.map((o) => o.id))) return null
    const r = e.respostas[id]
    if (r !== undefined && r !== null && !ordem.includes(r)) return null
  }
  const etapa = e.etapa
  if (etapa.tipo === 'perfil' && !(etapa.passo >= 0 && etapa.passo < passosPerfil.length)) return null
  if (etapa.tipo === 'cena' && !(etapa.indice >= 0 && etapa.indice < e.cenas.length)) return null
  if (etapa.tipo === 'resumo' && !(etapa.cartao >= 0 && etapa.cartao < CARTOES_RESUMO)) return null
  if (['contagem', 'revelacao', 'cartao'].includes(etapa.tipo) && !e.voto) return null
  return {
    ...estadoInicial(passosPerfil),
    ...e,
    marco: null,
    marcosVistos: Array.isArray(e.marcosVistos) ? e.marcosVistos : [],
    revelados: Array.isArray(e.revelados) ? e.revelados.filter(ehTexto) : [],
  }
}
