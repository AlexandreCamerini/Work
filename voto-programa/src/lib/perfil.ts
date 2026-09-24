import type { Estrato, FaixaRenda, Perfil, Pergunta, Publico } from '../types'

export const PERFIL_VAZIO: Perfil = {
  renda: null,
  pessoas: null,
  saude: null,
  deslocamento: null,
  escola: null,
  trabalho: null,
}

/** Ponto médio de cada faixa de renda familiar, em salários mínimos. */
const MEIO_DA_FAIXA: Record<FaixaRenda, number> = {
  ate2: 1.5,
  '2a4': 3,
  '4a10': 7,
  '10a20': 15,
  mais20: 25,
}

/**
 * Cortes de renda per capita (em salários mínimos) para o estrato.
 * PROVISÓRIO: ajustar à referência escolhida em pipeline/pesquisa-perfis.md.
 */
const CORTES: { minimo: number; estrato: Estrato }[] = [
  { minimo: 5, estrato: 'A' },
  { minimo: 1.5, estrato: 'B' },
  { minimo: 0.5, estrato: 'C' },
  { minimo: 0, estrato: 'DE' },
]

/**
 * Estrato estimado pela renda familiar por pessoa. Serve só para escolher cenas:
 * nunca é mostrado ao eleitor. Sem renda informada, não há estrato.
 */
export function estimarEstrato(perfil: Perfil): Estrato | null {
  if (!perfil.renda) return null
  const porPessoa = MEIO_DA_FAIXA[perfil.renda] / Math.max(1, perfil.pessoas ?? 1)
  return CORTES.find((c) => porPessoa >= c.minimo)!.estrato
}

function atende(publico: Publico, perfil: Perfil, estrato: Estrato | null): boolean {
  const checagens: [readonly string[] | undefined, string | null][] = [
    [publico.estrato, estrato],
    [publico.saude, perfil.saude],
    [publico.deslocamento, perfil.deslocamento],
    [publico.escola, perfil.escola],
    [publico.trabalho, perfil.trabalho],
  ]
  return checagens.every(([aceitos, valor]) => !aceitos || (valor !== null && aceitos.includes(valor)))
}

/**
 * Uma cena por grupo, na ordem do quiz: a primeira variante cujo público combina com
 * o perfil; se nenhuma combinar (ou o eleitor pulou), a variante padrão, sem `publico`.
 */
export function selecionarCenas(perguntas: Pergunta[], perfil: Perfil): Pergunta[] {
  const estrato = estimarEstrato(perfil)
  const grupos = new Map<string, Pergunta[]>()
  for (const p of perguntas) grupos.set(p.grupo, [...(grupos.get(p.grupo) ?? []), p])

  const escolhidas: Pergunta[] = []
  for (const variantes of grupos.values()) {
    const especifica = variantes.find((v) => v.publico && atende(v.publico, perfil, estrato))
    const padrao = variantes.find((v) => !v.publico)
    const escolhida = especifica ?? padrao
    if (escolhida) escolhidas.push(escolhida)
  }
  return escolhidas
}
