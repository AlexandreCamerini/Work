import type { Aderencia, Candidato, Motivo, Pergunta, Resposta, Resultado } from '../types'

/** Com menos situações comparáveis que isso, o percentual seria ruído: mostramos "sem dado". */
export const COBERTURA_MINIMA = 3

const PESO_PRIORIDADE = 2

/**
 * Afinidade = média das notas de aderência das opções escolhidas, com peso dobrado
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
  const temaDe = new Map(perguntas.map((p) => [p.id, p.tema]))

  return candidatos
    .map((candidato) => {
      let soma = 0
      let pesos = 0
      const motivos: Motivo[] = []

      for (const r of respostas) {
        const avaliacao = aderencia.itens[r.perguntaId]?.[r.opcaoId]?.[candidato.id]
        if (!avaliacao || avaliacao.nota === null) continue
        const peso = prioridades.includes(temaDe.get(r.perguntaId) ?? '') ? PESO_PRIORIDADE : 1
        soma += avaliacao.nota * peso
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
