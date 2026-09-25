// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { governadorRJ } from '../data/estatico'
import { consensos, inicialMinuscula, textoCompartilhar } from './resultado'
import { desenharCartao, type DadosCartao } from './cartao'
import type { Resultado } from '../types'

describe('inicialMinuscula', () => {
  it('baixa só a primeira letra e preserva nomes próprios', () => {
    expect(inicialMinuscula('Mais Patrulha Maria da Penha, visitando')).toBe('mais Patrulha Maria da Penha, visitando')
    expect(inicialMinuscula('Pagar clínicas para atender a fila do SUS')).toBe('pagar clínicas para atender a fila do SUS')
  })
  it('não mexe em sigla no começo', () => {
    expect(inicialMinuscula('SUS com mais médicos')).toBe('SUS com mais médicos')
    expect(inicialMinuscula('BRT até a Baixada')).toBe('BRT até a Baixada')
  })
})

describe('consensos ("Nisso eles concordam")', () => {
  it('lista só cenas de consenso respondidas, sem forçar minúsculas', () => {
    const { quiz, aderencia } = governadorRJ
    const cenas = quiz.perguntas.filter((p) => p.consenso)
    expect(cenas.length).toBeGreaterThan(0)
    const respostas = cenas.map((p) => ({ perguntaId: p.id, opcaoId: p.opcoes[0].id }))
    const lista = consensos(quiz.perguntas, respostas, aderencia)
    expect(consensos(quiz.perguntas, [], aderencia)).toEqual([])
    for (const c of lista) for (const o of c.opcoes) expect(o).not.toMatch(/maria da penha|\bsus\b/)
  })
})

describe('texto para o WhatsApp', () => {
  const r = [{ candidato: { nome: 'Fulana' }, afinidade: 70 }, { candidato: { nome: 'Beltrano' }, afinidade: null }] as unknown as Resultado[]
  it('sem a chave, só o convite', () => {
    expect(textoCompartilhar('T', 'E', 'https://x', r, false)).toBe('Fiz o teste "T" (E). Faz o seu: https://x')
  })
  it('com a chave, nomes e percentuais', () => {
    expect(textoCompartilhar('T', 'E', 'https://x', r, true)).toContain('Meu resultado: Fulana 70%.')
  })
})

describe('cartão compartilhável', () => {
  // contexto de canvas falso: registra o que for escrito, o resto não faz nada
  const falso = new Proxy({} as Record<string, unknown>, {
    get: (_, p) => (p === 'measureText' ? (t: string) => ({ width: t.length * 20 }) : () => {}),
    set: () => true,
  }) as unknown as CanvasRenderingContext2D
  const base: DadosCartao = {
    eleicao: 'Governador do Rio de Janeiro 2026',
    prioridades: ['Saúde', 'Transporte'],
    linhas: governadorRJ.candidatos.map((c, i) => ({ rotulo: `Candidato ${String.fromCharCode(65 + i)}`, nome: c.nome, afinidade: 50 + i })),
    comNomes: false,
    endereco: 'combina.exemplo',
  }

  it('sem a chave: nenhum nome, nenhum percentual, nenhum voto', () => {
    const textos = desenharCartao(falso, base).join('\n')
    for (const c of governadorRJ.candidatos) expect(textos).not.toContain(c.nome)
    expect(textos).not.toMatch(/%|votei|meu voto|seu voto/i)
    expect(textos).toContain('Candidato A')
    expect(textos).toContain('Não é pesquisa eleitoral')
  })

  it('com a chave: nomes e %, ainda sem voto', () => {
    const textos = desenharCartao(falso, { ...base, comNomes: true }).join('\n')
    for (const c of governadorRJ.candidatos) expect(textos).toContain(c.nome)
    expect(textos).toContain('%')
    expect(textos).not.toMatch(/votei|meu voto|seu voto/i)
  })
})
