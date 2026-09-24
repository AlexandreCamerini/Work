import type { Faixa, Perfil, Pergunta, Publico } from '../types'

export const PERFIL_VAZIO: Perfil = {
  saude: null,
  escola: null,
  deslocamento: null,
  trabalho: null,
  banheiros: null,
}

/**
 * Pontos por resposta e máximo de cada pergunta, conforme pipeline/pesquisa-perfis.md §1.5.
 * Banheiros é o item de maior peso no Critério Brasil 2026; não se pergunta renda, que a
 * ABEP considera mau estimador de nível socioeconômico. `undefined` = resposta que não conta.
 */
const PONTOS = {
  saude: { max: 3, valores: { sus: 0, plano_empresa: 2, plano_proprio: 3 } },
  escola: { max: 3, valores: { publica: 0, particular: 3, nenhuma: undefined } },
  deslocamento: { max: 2, valores: { publico: 0, carro: 2, moto: 0, app: 1, casa: undefined } },
  trabalho: {
    max: 3,
    valores: { carteira: 1, servidor: 1, autonomo: 0, empresario: 3, aposentado: undefined, sem_trabalho: 0 },
  },
  banheiros: { max: 3, valores: { 1: 0, 2: 2, 3: 3 } },
} as const

const MINIMO_DE_RESPOSTAS = 3

/**
 * Faixa estimada pelo índice (pontos ÷ máximo das perguntas que contam). Cortes 0,34 e 0,66
 * são ponto de partida da pesquisa, não validados: calibrar com piloto contra o Critério
 * Brasil completo. Com menos de 3 respostas que contam, não estima. Nunca é mostrada na tela.
 */
export function estimarFaixa(perfil: Perfil): Faixa | null {
  let pontos = 0
  let maximo = 0
  let respostas = 0
  for (const campo of Object.keys(PONTOS) as (keyof typeof PONTOS)[]) {
    const valor = perfil[campo]
    if (valor === null) continue
    const regra = PONTOS[campo]
    const p = (regra.valores as Record<string, number | undefined>)[String(valor)]
    if (p === undefined) continue
    pontos += p
    maximo += regra.max
    respostas += 1
  }
  if (respostas < MINIMO_DE_RESPOSTAS) return null
  const indice = pontos / maximo
  if (indice > 0.66) return 'privado'
  if (indice >= 0.34) return 'misto'
  return 'publico'
}

function atende(publico: Publico, perfil: Perfil, faixa: Faixa | null): boolean {
  const checagens: [readonly string[] | undefined, string | null][] = [
    [publico.faixa, faixa],
    [publico.saude, perfil.saude],
    [publico.deslocamento, perfil.deslocamento],
    [publico.escola, perfil.escola],
    [publico.trabalho, perfil.trabalho],
  ]
  return checagens.every(([aceitos, valor]) => !aceitos || (valor !== null && aceitos.includes(valor)))
}

/**
 * Uma cena por grupo, na ordem do quiz: a primeira variante cujo público combina com o
 * perfil; se nenhuma combinar (ou o eleitor pulou), a variante padrão, sem `publico`.
 * Grupo sem variante padrão só aparece para quem se encaixa.
 */
export function selecionarCenas(perguntas: Pergunta[], perfil: Perfil): Pergunta[] {
  const faixa = estimarFaixa(perfil)
  const grupos = new Map<string, Pergunta[]>()
  for (const p of perguntas) grupos.set(p.grupo, [...(grupos.get(p.grupo) ?? []), p])

  const escolhidas: Pergunta[] = []
  for (const variantes of grupos.values()) {
    const especifica = variantes.find((v) => v.publico && atende(v.publico, perfil, faixa))
    const padrao = variantes.find((v) => !v.publico)
    const escolhida = especifica ?? padrao
    if (escolhida) escolhidas.push(escolhida)
  }
  return escolhidas
}
