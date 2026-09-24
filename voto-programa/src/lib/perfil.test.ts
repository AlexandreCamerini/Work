import { describe, expect, it } from 'vitest'
import type { Perfil, Pergunta, Publico } from '../types'
import { PERFIL_VAZIO, estimarFaixa, selecionarCenas } from './perfil'

function cena(id: string, grupo: string, publico?: Publico): Pergunta {
  return { id, grupo, publico, tema: 't', cena: '', pergunta: '', opcoes: [], fato: { texto: '', fonte: '', url: '' } }
}

const perfil = (p: Partial<Perfil>): Perfil => ({ ...PERFIL_VAZIO, ...p })

describe('estimarFaixa', () => {
  it('classifica pelo uso de serviços e pelos banheiros, sem perguntar renda', () => {
    expect(estimarFaixa(perfil({ saude: 'sus', escola: 'publica', deslocamento: 'publico', banheiros: 1 }))).toBe('publico')
    expect(estimarFaixa(perfil({ saude: 'plano_empresa', deslocamento: 'app', trabalho: 'carteira', banheiros: 2 }))).toBe('misto')
    expect(estimarFaixa(perfil({ saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', banheiros: 3 }))).toBe('privado')
  })

  it('não estima com menos de 3 respostas que contam', () => {
    expect(estimarFaixa(perfil({ saude: 'plano_proprio', banheiros: 3 }))).toBeNull()
    expect(estimarFaixa(perfil({ saude: 'sus', escola: 'nenhuma', deslocamento: 'casa', banheiros: 1 }))).toBeNull()
  })
})

describe('selecionarCenas', () => {
  const perguntas = [
    cena('fila', 'saude'),
    cena('trem', 'transporte'),
    cena('transito-carro', 'transporte', { deslocamento: ['carro'] }),
    cena('servidor', 'trabalho', { trabalho: ['servidor'] }),
    cena('bico', 'trabalho'),
    cena('orla', 'orla', { faixa: ['privado', 'misto'] }),
  ]

  it('mostra uma cena por grupo, escolhendo a variante do perfil', () => {
    const ids = selecionarCenas(perguntas, perfil({ deslocamento: 'carro', trabalho: 'servidor' })).map((p) => p.id)
    expect(ids).toEqual(['fila', 'transito-carro', 'servidor'])
  })

  it('quem pula o perfil vê as variantes padrão', () => {
    expect(selecionarCenas(perguntas, PERFIL_VAZIO).map((p) => p.id)).toEqual(['fila', 'trem', 'bico'])
  })

  it('grupo sem variante padrão só aparece para a faixa certa', () => {
    const privado = perfil({ saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', banheiros: 3 })
    expect(selecionarCenas(perguntas, privado).map((p) => p.id)).toContain('orla')
    const publico = perfil({ saude: 'sus', escola: 'publica', deslocamento: 'publico', banheiros: 1 })
    expect(selecionarCenas(perguntas, publico).map((p) => p.id)).not.toContain('orla')
  })
})
