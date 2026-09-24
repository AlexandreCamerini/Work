import type { Aderencia, Avaliacao, Candidato, Motivo, Pergunta, Resposta, Resultado } from '../types'

/** Com menos situações comparáveis que isso, o percentual seria ruído: mostramos "sem dado". */
export const COBERTURA_MINIMA = 3

const PESO_PRIORIDADE = 2

/** Referência de uma opção sem proposta documentada ao centrar as notas da cena. */
const NOTA_NEUTRA = 50

/**
 * Quanto o candidato prefere a opção escolhida às outras da mesma cena: 50 + (nota da
 * escolhida - média das notas dele na cena), limitado a 0-100. Sem centrar, quem recebe
 * nota alta em opções opostas "ganha" de qualquer eleitor (numa simulação com respostas
 * aleatórias, um candidato ficava em 1º em 76% dos casos); centrado, apoiar tudo vale 50.
 */
export function pontoNaCena(pergunta: Pergunta, aderencia: Aderencia, opcaoId: string, candidatoId: string): number | null {
  const porOpcao = aderencia.itens[pergunta.id]
  const nota = porOpcao?.[opcaoId]?.[candidatoId]?.nota
  if (nota === null || nota === undefined) return null
  const notas = pergunta.opcoes.map((o) => porOpcao[o.id]?.[candidatoId]?.nota ?? NOTA_NEUTRA)
  const media = notas.reduce((a, b) => a + b, 0) / notas.length
  return Math.min(100, Math.max(0, NOTA_NEUTRA + nota - media))
}

/**
 * Afinidade = média dos pontos das cenas respondidas (ver pontoNaCena), com peso dobrado
 * nos temas que o eleitor marcou como prioridade. Opção sem proposta documentada
 * (nota null) sai do cálculo: ausência de proposta não é discordância.
 * Determinístico, sem IA em tempo de uso: só lê a tabela pré-calculada e revisada.
 */
export function calcularResultados(
  candidatos: Candidato[],
  perguntas: Pergunta[],
  aderencia: Aderencia,
  respostas: Resposta[],
  prioridades: string[],
): Resultado[] {
  const perguntaDe = new Map(perguntas.map((p) => [p.id, p]))

  return candidatos
    .map((candidato) => {
      let soma = 0
      let pesos = 0
      const motivos: Motivo[] = []

      for (const r of respostas) {
        const pergunta = perguntaDe.get(r.perguntaId)
        const avaliacao = aderencia.itens[r.perguntaId]?.[r.opcaoId]?.[candidato.id]
        const ponto = pergunta ? pontoNaCena(pergunta, aderencia, r.opcaoId, candidato.id) : null
        if (!pergunta || !avaliacao || ponto === null) continue
        const peso = prioridades.includes(pergunta.tema) ? PESO_PRIORIDADE : 1
        soma += ponto * peso
        pesos += peso
        motivos.push({ perguntaId: r.perguntaId, opcaoId: r.opcaoId, avaliacao })
      }

      const cobertura = motivos.length
      return {
        candidato,
        afinidade: cobertura >= COBERTURA_MINIMA ? Math.round(soma / pesos) : null,
        cobertura,
        motivos,
      }
    })
    .sort((a, b) => (b.afinidade ?? -1) - (a.afinidade ?? -1))
}

export type Encaixe = 'atende' | 'em_parte' | 'nao_atende' | 'sem_proposta'

/** Mesmos cortes dos rótulos de cada motivo: 70+ combina, 40-69 em parte, abaixo disso outra direção. */
export function encaixe(nota: number | null): Encaixe {
  if (nota === null) return 'sem_proposta'
  if (nota >= 70) return 'atende'
  if (nota >= 40) return 'em_parte'
  return 'nao_atende'
}

export interface ItemEncaixe {
  pergunta: Pergunta
  opcaoId: string
  avaliacao: Avaliacao | null
}

/**
 * O que o candidato atende e o que não atende nas escolhas do eleitor, pela nota da opção
 * escolhida (sem centrar): responde "ele propõe o que eu escolhi?".
 */
export function encaixesDoCandidato(
  candidatoId: string,
  perguntas: Pergunta[],
  aderencia: Aderencia,
  respostas: Resposta[],
): Record<Encaixe, ItemEncaixe[]> {
  const saida: Record<Encaixe, ItemEncaixe[]> = { atende: [], em_parte: [], nao_atende: [], sem_proposta: [] }
  const porId = new Map(perguntas.map((p) => [p.id, p]))
  for (const r of respostas) {
    const pergunta = porId.get(r.perguntaId)
    if (!pergunta) continue
    const avaliacao = aderencia.itens[r.perguntaId]?.[r.opcaoId]?.[candidatoId] ?? null
    saida[encaixe(avaliacao?.nota ?? null)].push({ pergunta, opcaoId: r.opcaoId, avaliacao })
  }
  return saida
}
