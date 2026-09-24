import type { Aderencia, Candidato, Motivo, Pergunta, Resposta, Resultado } from '../types'

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
