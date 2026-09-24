import { describe, expect, it } from 'vitest'
import type { Perfil, Pergunta, Publico } from '../types'
import { PERFIL_VAZIO, estimarEstrato, selecionarCenas } from './perfil'

function cena(id: string, grupo: string, publico?: Publico): Pergunta {
  return { id, grupo, publico, tema: 't', cena: '', pergunta: '', opcoes: [], fato: { texto: '', fonte: '', url: '' } }
}

const perfil = (p: Partial<Perfil>): Perfil => ({ ...PERFIL_VAZIO, ...p })

describe('estimarEstrato', () => {
  it('usa renda por pessoa, não só renda total', () => {
    expect(estimarEstrato(perfil({ renda: '4a10', pessoas: 1 }))).toBe('A')
    expect(estimarEstrato(perfil({ renda: '4a10', pessoas: 6 }))).toBe('C')
  })

  it('sem renda informada, não estima', () => {
    expect(estimarEstrato(perfil({ pessoas: 3 }))).toBeNull()
  })
})

describe('selecionarCenas', () => {
  const perguntas = [
    cena('fila-sus', 'saude'),
    cena('plano-reajuste', 'saude', { saude: ['plano'] }),
    cena('trem', 'transporte'),
    cena('transito-carro', 'transporte', { deslocamento: ['carro'] }),
    cena('so-empresario', 'negocio', { trabalho: ['empresario'] }),
  ]

  it('mostra uma cena por grupo, escolhendo a variante do perfil', () => {
    const ids = selecionarCenas(perguntas, perfil({ saude: 'plano', deslocamento: 'carro' })).map((p) => p.id)
    expect(ids).toEqual(['plano-reajuste', 'transito-carro'])
  })

  it('quem pula o perfil vê as variantes padrão', () => {
    const ids = selecionarCenas(perguntas, PERFIL_VAZIO).map((p) => p.id)
    expect(ids).toEqual(['fila-sus', 'trem'])
  })

  it('grupo só com variante específica aparece apenas para quem se encaixa', () => {
    expect(selecionarCenas(perguntas, perfil({ trabalho: 'empresario' })).map((p) => p.id)).toContain('so-empresario')
    expect(selecionarCenas(perguntas, perfil({ trabalho: 'carteira' })).map((p) => p.id)).not.toContain('so-empresario')
  })
})
