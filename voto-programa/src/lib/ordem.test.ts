import { describe, expect, it } from 'vitest'
import { eleicoes } from '../data'
import { embaralhar, misturarTemas } from './ordem'
import { PERFIL_VAZIO, selecionarCenas } from './perfil'

function sorteioFixo(semente: number) {
  let s = semente
  return () => {
    s = (s * 1103515245 + 12345) % 2 ** 31
    return s / 2 ** 31
  }
}

function repeticoes(itens: { tema: string }[]) {
  return itens.filter((item, i) => i > 0 && itens[i - 1].tema === item.tema).length
}

describe('misturarTemas', () => {
  it('nunca põe dois itens do mesmo tema em sequência quando é possível evitar', () => {
    const itens = ['a', 'a', 'a', 'b', 'b', 'c', 'c'].map((tema, i) => ({ tema, i }))
    for (let s = 1; s <= 200; s++) {
      const ordem = misturarTemas(itens, sorteioFixo(s))
      expect(ordem).toHaveLength(itens.length)
      expect(new Set(ordem.map((o) => o.i)).size).toBe(itens.length)
      expect(repeticoes(ordem), `semente ${s}`).toBe(0)
    }
  })

  it('não trava quando um tema domina (repete só o inevitável)', () => {
    const itens = ['a', 'a', 'a', 'b'].map((tema, i) => ({ tema, i }))
    expect(repeticoes(misturarTemas(itens, sorteioFixo(7)))).toBe(1)
  })

  it('varia a ordem entre pessoas', () => {
    const itens = 'abcdefgh'.split('').map((tema) => ({ tema }))
    const ordens = new Set([1, 2, 3, 4, 5].map((s) => misturarTemas(itens, sorteioFixo(s)).map((o) => o.tema).join('')))
    expect(ordens.size).toBeGreaterThan(1)
  })

  it.each(eleicoes.map((e) => [e.id, e] as const))('as cenas publicadas de %s saem sem tema repetido em sequência', (_id, eleicao) => {
    const cenas = selecionarCenas(eleicao.quiz.perguntas, PERFIL_VAZIO)
    for (let s = 1; s <= 50; s++) expect(repeticoes(misturarTemas(cenas, sorteioFixo(s)))).toBe(0)
  })
})

describe('embaralhar', () => {
  it('mantém os mesmos itens', () => {
    expect(embaralhar([1, 2, 3, 4], sorteioFixo(3)).sort()).toEqual([1, 2, 3, 4])
  })
})

describe('quiz publicado', () => {
  it.each(eleicoes.map((e) => [e.id, e] as const))('%s: toda cena tem pelo menos 4 opções', (_id, eleicao) => {
    for (const p of eleicao.quiz.perguntas) expect(p.opcoes.length, p.id).toBeGreaterThanOrEqual(4)
  })
})
