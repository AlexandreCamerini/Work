import { use, useMemo } from 'react'
import { carregarAderencia } from '../data'
import { calcularResultados } from '../lib/matching'
import type { Pergunta } from '../types'
import { useFluxoCtx } from './contexto'
import { respostasOrdenadas } from './maquina'

/**
 * Resultado das escolhas, com a mesma chamada de antes a calcularResultados: as cenas na
 * ordem sorteada e as respostas nessa ordem, sem as puladas. Suspende até a aderência chegar.
 */
export function useResultados() {
  const { dados, estado } = useFluxoCtx()
  const aderencia = use(carregarAderencia(dados.id))
  const { cenas, respostas: mapa, prioridades } = estado
  return useMemo(() => {
    const porId = new Map(dados.quiz.perguntas.map((p) => [p.id, p]))
    const perguntas = cenas.map((id) => porId.get(id)).filter((p): p is Pergunta => !!p)
    const respostas = respostasOrdenadas({ cenas, respostas: mapa })
    const resultados = calcularResultados(dados.candidatos, perguntas, aderencia, respostas, prioridades)
    const rotulo = new Map(resultados.map((r, i) => [r.candidato.id, i]))
    return { aderencia, perguntas, respostas, resultados, rotulo }
  }, [dados, aderencia, cenas, mapa, prioridades])
}
