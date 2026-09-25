import { describe, expect, it } from 'vitest'
import { eleicoes } from './estatico'
import { carregarAderencia, carregarEvidencias, carregarQuiz, manifesto } from './index'

describe('manifesto leve das eleições', () => {
  it('bate com os dados completos (nome, nº de candidatos, ordem)', () => {
    expect(manifesto.map((m) => m.id)).toEqual(eleicoes.map((e) => e.id))
    for (const m of manifesto) {
      const e = eleicoes.find((x) => x.id === m.id)!
      expect(m.nome).toBe(e.quiz.eleicao)
      expect(m.nCandidatos).toBe(e.candidatos.length)
    }
  })

  it.each(manifesto.map((m) => [m.id] as const))('%s: o carregador dinâmico entrega os mesmos dados', async (id) => {
    const e = eleicoes.find((x) => x.id === id)!
    const [q, a, ev] = await Promise.all([carregarQuiz(id), carregarAderencia(id), carregarEvidencias(id)])
    expect(q.quiz).toEqual(e.quiz)
    expect(q.candidatos).toEqual(e.candidatos)
    expect(q.foraDoQuiz).toEqual(e.foraDoQuiz)
    expect(a).toEqual(e.aderencia)
    expect(ev).toEqual(e.evidencias)
    expect(carregarQuiz(id)).toBe(carregarQuiz(id))
  })
})
