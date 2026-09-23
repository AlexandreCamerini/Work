import { eixos } from '../data/eixos'
import { perguntas } from '../data/perguntas'
import type { Candidato, CandidatoResultado, EixoScore, RespostaUsuario } from '../types'

const ESCALA_MAX = 4 // distância máxima possível entre posições -2..+2
const eixoPorPerguntaId = new Map(perguntas.map((p) => [p.id, p.eixoId]))

/** Afinidade 0–100 entre um conjunto de respostas do usuário e as posições de um candidato. */
export function calcularAfinidade(
  candidato: Candidato,
  respostas: RespostaUsuario[],
): CandidatoResultado {
  const posicaoPorPergunta = new Map(candidato.posicoes.map((p) => [p.perguntaId, p]))

  let somaPonderada = 0
  let somaPesos = 0
  let perguntasComparadas = 0

  const acumuladorPorEixo = new Map<string, { ponderada: number; pesos: number; qtd: number }>()

  for (const resposta of respostas) {
    const posicaoCandidato = posicaoPorPergunta.get(resposta.perguntaId)
    if (!posicaoCandidato) continue

    const distancia = Math.abs(resposta.posicao - posicaoCandidato.posicao)
    const afinidadeItem = 1 - distancia / ESCALA_MAX
    const peso = resposta.importancia

    somaPonderada += afinidadeItem * peso
    somaPesos += peso
    perguntasComparadas += 1

    const eixoId = eixoPorPerguntaId.get(resposta.perguntaId)
    if (eixoId) {
      const acumulado = acumuladorPorEixo.get(eixoId) ?? { ponderada: 0, pesos: 0, qtd: 0 }
      acumulado.ponderada += afinidadeItem * peso
      acumulado.pesos += peso
      acumulado.qtd += 1
      acumuladorPorEixo.set(eixoId, acumulado)
    }
  }

  const porEixo: EixoScore[] = eixos
    .map((eixo) => {
      const acumulado = acumuladorPorEixo.get(eixo.id)
      if (!acumulado || acumulado.pesos === 0) return null
      return {
        eixoId: eixo.id,
        afinidade: Math.round((acumulado.ponderada / acumulado.pesos) * 100),
        perguntasRespondidas: acumulado.qtd,
      }
    })
    .filter((v): v is EixoScore => v !== null)

  return {
    candidato,
    afinidadeGeral: somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) : 0,
    perguntasComparadas,
    porEixo,
  }
}

export function calcularRanking(
  candidatos: Candidato[],
  respostas: RespostaUsuario[],
): CandidatoResultado[] {
  return candidatos
    .map((candidato) => calcularAfinidade(candidato, respostas))
    .sort((a, b) => b.afinidadeGeral - a.afinidadeGeral)
}
