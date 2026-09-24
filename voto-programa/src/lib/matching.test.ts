import { describe, expect, it } from 'vitest'
import { eleicoes } from '../data'
import type { Aderencia, Candidato, Pergunta } from '../types'
import { COBERTURA_MINIMA, calcularResultados } from './matching'

function candidato(id: string): Candidato {
  return {
    id,
    nome: id,
    numero: '0',
    partido: 'P',
    cargo: 'Teste',
    situacaoJudicial: { status: 'regular', descricao: '', fonteUrl: 'https://x', atualizadoEm: '2026-01-01' },
    planoGovernoUrl: 'https://x',
  }
}

const perguntas: Pergunta[] = ['q1', 'q2', 'q3', 'q4'].map((id, i) => ({
  id,
  grupo: id,
  tema: i === 0 ? 'saude' : 'transporte',
  cena: '',
  pergunta: '',
  opcoes: [
    { id: 'a', texto: '', preferencia: '' },
    { id: 'b', texto: '', preferencia: '' },
  ],
  fato: { texto: '', fonte: '', url: '' },
}))

function av(nota: number | null) {
  return { nota, evidencias: nota === null ? [] : ['p1'], justificativa: '' }
}

const aderencia: Aderencia = {
  gerado_em: '',
  modelo: '',
  revisado_por: null,
  versao_quiz: '',
  itens: {
    q1: { a: { x: av(100), y: av(0) }, b: { x: av(0), y: av(100) } },
    q2: { a: { x: av(100), y: av(0) }, b: { x: av(0), y: av(100) } },
    q3: { a: { x: av(100), y: av(null) }, b: { x: av(0), y: av(100) } },
    q4: { a: { x: av(100), y: av(0) }, b: { x: av(0), y: av(100) } },
  },
}

const X = candidato('x')
const Y = candidato('y')
const tudoA = ['q1', 'q2', 'q3', 'q4'].map((perguntaId) => ({ perguntaId, opcaoId: 'a' }))

describe('calcularResultados', () => {
  it('ordena pelo candidato cujas propostas batem com as escolhas', () => {
    const [primeiro, segundo] = calcularResultados([Y, X], perguntas, aderencia, tudoA, [])
    expect(primeiro.candidato.id).toBe('x')
    expect(primeiro.afinidade).toBe(100)
    expect(segundo.afinidade).toBe(0)
  })

  it('não trata ausência de proposta como discordância', () => {
    const [, y] = calcularResultados([X, Y], perguntas, aderencia, tudoA, [])
    expect(y.cobertura).toBe(3)
    expect(y.motivos.map((m) => m.perguntaId)).not.toContain('q3')
  })

  it('dobra o peso dos temas marcados como prioridade', () => {
    const respostas = [
      { perguntaId: 'q1', opcaoId: 'a' },
      { perguntaId: 'q2', opcaoId: 'b' },
      { perguntaId: 'q4', opcaoId: 'b' },
    ]
    const semPrioridade = calcularResultados([X], perguntas, aderencia, respostas, [])[0]
    const comPrioridade = calcularResultados([X], perguntas, aderencia, respostas, ['saude'])[0]
    expect(semPrioridade.afinidade).toBe(33)
    expect(comPrioridade.afinidade).toBe(50)
  })

  it('não mostra percentual abaixo da cobertura mínima', () => {
    const poucas = tudoA.slice(0, COBERTURA_MINIMA - 1)
    const [x] = calcularResultados([X], perguntas, aderencia, poucas, [])
    expect(x.afinidade).toBeNull()
  })
})

describe.each(eleicoes.map((e) => [e.id, e] as const))('integridade dos dados publicados: %s', (_id, eleicao) => {
  const { quiz, aderencia: ad, evidencias: ev, candidatos } = eleicao

  it('toda opção do quiz tem avaliação para todo candidato', () => {
    for (const p of quiz.perguntas) {
      for (const o of p.opcoes) {
        for (const c of candidatos) {
          expect(ad.itens[p.id]?.[o.id]?.[c.id], `${p.id}/${o.id}/${c.id}`).toBeDefined()
        }
      }
    }
  })

  it('toda nota tem evidência com trecho literal e fonte; sem nota, sem evidência', () => {
    for (const [pid, porOpcao] of Object.entries(ad.itens)) {
      for (const [oid, porCand] of Object.entries(porOpcao)) {
        for (const [cid, a] of Object.entries(porCand)) {
          const rotulo = `${pid}/${oid}/${cid}`
          if (a.nota === null) {
            expect(a.evidencias, rotulo).toHaveLength(0)
            continue
          }
          expect(a.nota, rotulo).toBeGreaterThanOrEqual(0)
          expect(a.nota, rotulo).toBeLessThanOrEqual(100)
          expect(a.evidencias.length, rotulo).toBeGreaterThan(0)
          for (const e of a.evidencias) {
            expect(ev[cid]?.[e]?.trecho, `${rotulo}/${e}`).toBeTruthy()
            expect(ev[cid]?.[e]?.fonte.url, `${rotulo}/${e}`).toMatch(/^https:\/\//)
          }
        }
      }
    }
  })

  it('toda cena tem fato com fonte e tema conhecido', () => {
    const temas = new Set(quiz.temas.map((t) => t.id))
    for (const p of quiz.perguntas) {
      expect(p.fato.texto, p.id).toBeTruthy()
      expect(p.fato.url, p.id).toMatch(/^https:\/\//)
      expect(temas.has(p.tema), `${p.id}: tema ${p.tema}`).toBe(true)
    }
  })

  it('a tabela de aderência corresponde à versão atual do quiz', () => {
    expect(ad.versao_quiz).toBe(quiz.versao)
  })
})
