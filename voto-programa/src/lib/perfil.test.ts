import { describe, expect, it } from 'vitest'
import type { Perfil, Pergunta, Publico } from '../types'
import { eleicoes } from '../data/estatico'
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

describe('cenas publicadas por perfil', () => {
  const gov = eleicoes.find((e) => e.id === 'governador-rj')!.quiz.perguntas
  const pres = eleicoes.find((e) => e.id === 'presidente')!.quiz.perguntas
  const ids = (perguntas: Pergunta[], perfil: Perfil) => selecionarCenas(perguntas, perfil).map((p) => p.id)

  it('quem tem plano de saúde vê a mãe que voltou pro SUS, nas duas eleições', () => {
    const perfil: Perfil = { ...PERFIL_VAZIO, saude: 'plano_empresa' }
    expect(ids(gov, perfil)).toContain('plano-voltou-sus')
    expect(ids(pres, perfil)).toContain('plano-voltou-sus')
    expect(ids(gov, PERFIL_VAZIO)).toContain('fila-especialista')
  })

  it('cena de empresa só vai para quem trabalha de carteira ou tem empresa', () => {
    const motoboy: Perfil = { saude: 'sus', escola: 'nenhuma', deslocamento: 'moto', trabalho: 'autonomo', banheiros: 1, regiao: null }
    expect(ids(gov, motoboy)).not.toContain('falta-tecnico')
    expect(ids(gov, { ...motoboy, trabalho: 'carteira' })).toContain('falta-tecnico')
  })

  it('faixa de serviço privado vê alagamento e falta d’água do prédio', () => {
    const privado: Perfil = { saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', trabalho: 'empresario', banheiros: 3, regiao: null }
    expect(ids(gov, privado)).toEqual(expect.arrayContaining(['garagem-alagada', 'caminhao-pipa', 'vale-transporte']))
  })
})


describe('cenas por região', () => {
  const gov = eleicoes.find((e) => e.id === 'governador-rj')!.quiz
  const pres = eleicoes.find((e) => e.id === 'presidente')!.quiz
  const ids = (perguntas: Pergunta[], perfil: Partial<Perfil>) => selecionarCenas(perguntas, { ...PERFIL_VAZIO, ...perfil }).map((p) => p.id)

  it('Leste Fluminense vê a barca, mesmo de carro (região tem prioridade sobre faixa)', () => {
    expect(ids(gov.perguntas, { regiao: 'leste' })).toContain('barca-leste')
    expect(ids(gov.perguntas, { regiao: 'leste', deslocamento: 'carro' })).toContain('barca-leste')
    expect(ids(gov.perguntas, { regiao: 'leste', deslocamento: 'carro' })).not.toContain('transito-carro')
  })

  it('interior vê estrada, saúde longe de casa e encosta na serra', () => {
    expect(ids(gov.perguntas, { regiao: 'interior' })).toEqual(expect.arrayContaining(['estrada-interior', 'saude-interior', 'encosta-serra']))
  })

  it('capital, Baixada e quem não mora no estado ficam nas cenas padrão de transporte', () => {
    for (const regiao of ['capital', 'baixada', 'fora']) expect(ids(gov.perguntas, { regiao })).toContain('trem-parado')
  })

  it('regiões do Brasil mudam a cena do clima e da saúde', () => {
    expect(ids(pres.perguntas, { regiao: 'nordeste' })).toContain('seca-nordeste')
    expect(ids(pres.perguntas, { regiao: 'norte' })).toEqual(expect.arrayContaining(['fumaca-queimada', 'especialista-longe']))
    expect(ids(pres.perguntas, { regiao: 'centro-oeste' })).toContain('fumaca-queimada')
    expect(ids(pres.perguntas, { regiao: 'sul' })).toContain('enchente-sul')
    expect(ids(pres.perguntas, { regiao: 'sudeste' })).toContain('enchente-seca')
  })

  it.each([gov, pres].map((q) => [q.eleicao, q] as const))('%s: filtro de região só usa regiões da pergunta', (_n, quiz) => {
    const validas = new Set(quiz.regioes?.opcoes.map((o) => o.valor))
    for (const p of quiz.perguntas) for (const r of p.publico?.regiao ?? []) expect(validas.has(r), `${p.id}: ${r}`).toBe(true)
  })
})
