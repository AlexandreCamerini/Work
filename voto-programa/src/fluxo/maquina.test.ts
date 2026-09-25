// @vitest-environment node
import { describe, expect, it } from 'vitest'
import quizGov from '../data/quiz.json'
import quizPres from '../data/quiz-presidente.json'
import { PERFIL_VAZIO, selecionarCenas } from '../lib/perfil'
import type { Perfil, Quiz } from '../types'
import {
  CARTOES_RESUMO,
  MAX_PRIORIDADES,
  estadoInicial,
  passosDoPerfil,
  reduzir,
  respostasOrdenadas,
  restaurar,
  type ContextoFluxo,
  type EstadoFluxo,
  type Evento,
} from './maquina'

const quiz = quizGov as unknown as Quiz
const ctx: ContextoFluxo = { perguntas: quiz.perguntas, candidatos: ['a', 'b', 'c'] }
const passos = passosDoPerfil(true)

function rodar(eventos: Evento[], inicio: EstadoFluxo = estadoInicial(passos), c: ContextoFluxo = ctx) {
  return eventos.reduce((e, ev) => reduzir(c, e, ev), inicio)
}

/** Abertura → perfil todo pulado → prioridades puladas → primeira cena. */
function ateAsCenas(semente = 7, perfil: Partial<Perfil> = {}): EstadoFluxo {
  const eventos: Evento[] = [{ tipo: 'avancar' }]
  for (const campo of passos) {
    const v = perfil[campo]
    eventos.push(v === undefined ? { tipo: 'pular', semente } : { tipo: 'escolher', valor: v }, ...(v === undefined ? [] : [{ tipo: 'avancar', semente } as Evento]))
  }
  eventos.push({ tipo: 'pular', semente })
  return rodar(eventos)
}

describe('máquina do fluxo: perfil e prioridades', () => {
  it('abertura → perfil passo a passo → prioridades', () => {
    let e = rodar([{ tipo: 'avancar' }])
    expect(e.etapa).toEqual({ tipo: 'perfil', passo: 0 })
    e = rodar([{ tipo: 'escolher', valor: 'baixada' }, { tipo: 'avancar', semente: 1 }], e)
    expect(e.perfil.regiao).toBe('baixada')
    expect(e.etapa).toEqual({ tipo: 'perfil', passo: 1 })
    e = rodar([{ tipo: 'voltar' }], e)
    expect(e.etapa).toEqual({ tipo: 'perfil', passo: 0 })
    expect(e.perfil.regiao).toBe('baixada')
    expect(e.direcao).toBe('tras')
  })

  it('"Pular tudo" zera o perfil e vai direto às prioridades, com as cenas sorteadas', () => {
    const e = rodar([{ tipo: 'avancar' }, { tipo: 'escolher', valor: 'baixada' }, { tipo: 'pular', tudo: true, semente: 3 }])
    expect(e.etapa.tipo).toBe('prioridades')
    expect(e.perfil).toEqual(PERFIL_VAZIO)
    expect(new Set(e.cenas)).toEqual(new Set(selecionarCenas(quiz.perguntas, PERFIL_VAZIO).map((p) => p.id)))
  })

  it('prioridades: no máximo 3, tocar de novo desmarca, pular zera', () => {
    let e = rodar([{ tipo: 'avancar' }, { tipo: 'pular', tudo: true, semente: 3 }])
    const temas = quiz.temas.map((t) => t.id)
    e = rodar(temas.slice(0, 4).map((valor) => ({ tipo: 'escolher', valor }) as Evento), e)
    expect(e.prioridades).toEqual(temas.slice(0, MAX_PRIORIDADES))
    e = rodar([{ tipo: 'escolher', valor: temas[0] }], e)
    expect(e.prioridades).toEqual(temas.slice(1, 3))
    const pulado = rodar([{ tipo: 'pular', semente: 3 }], e)
    expect(pulado.prioridades).toEqual([])
    expect(pulado.etapa).toEqual({ tipo: 'cena', indice: 0 })
    const continuado = rodar([{ tipo: 'avancar', semente: 3 }], e)
    expect(continuado.prioridades).toEqual(temas.slice(1, 3))
  })

  it('a mesma semente dá a mesma ordem de cenas e de opções', () => {
    expect(ateAsCenas(11).cenas).toEqual(ateAsCenas(11).cenas)
    expect(ateAsCenas(11).ordemOpcoes).toEqual(ateAsCenas(11).ordemOpcoes)
    expect(ateAsCenas(11).cenas).not.toEqual(ateAsCenas(12).cenas)
  })

  it('a ordem das opções é uma permutação das opções de cada cena', () => {
    const e = ateAsCenas()
    for (const id of e.cenas) {
      const p = quiz.perguntas.find((q) => q.id === id)!
      expect([...e.ordemOpcoes[id]].sort()).toEqual(p.opcoes.map((o) => o.id).sort())
    }
  })
})

describe('máquina do fluxo: cenas', () => {
  it('escolher troca livre; tocar de novo desmarca; sempre uma entrada por cena', () => {
    let e = ateAsCenas()
    const id = e.cenas[0]
    const [a, b] = e.ordemOpcoes[id]
    e = rodar([{ tipo: 'escolher', valor: a }], e)
    expect(e.respostas[id]).toBe(a)
    e = rodar([{ tipo: 'escolher', valor: b }], e)
    expect(e.respostas[id]).toBe(b)
    expect(Object.keys(e.respostas)).toEqual([id])
    e = rodar([{ tipo: 'escolher', valor: b }], e)
    expect(id in e.respostas).toBe(false)
  })

  it('pular grava null e avança; avançar sem escolha também conta como pular', () => {
    let e = ateAsCenas()
    e = rodar([{ tipo: 'pular' }], e)
    expect(e.respostas[e.cenas[0]]).toBeNull()
    expect(e.etapa).toEqual({ tipo: 'cena', indice: 1 })
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.respostas[e.cenas[1]]).toBeNull()
  })

  it('voltar preserva resposta e ordem; na 1ª cena volta às prioridades', () => {
    let e = ateAsCenas()
    const [c0, c1] = e.cenas
    const ordem = e.ordemOpcoes
    e = rodar([{ tipo: 'escolher', valor: ordem[c0][2] }, { tipo: 'avancar' }, { tipo: 'escolher', valor: ordem[c1][1] }, { tipo: 'voltar' }], e)
    expect(e.etapa).toEqual({ tipo: 'cena', indice: 0 })
    expect(e.respostas).toEqual({ [c0]: ordem[c0][2], [c1]: ordem[c1][1] })
    expect(e.ordemOpcoes).toBe(ordem)
    e = rodar([{ tipo: 'voltar' }], e)
    expect(e.etapa.tipo).toBe('prioridades')
    e = rodar([{ tipo: 'avancar', semente: 999 }], e)
    expect(e.ordemOpcoes).toBe(ordem)
  })

  it('respostasOrdenadas = ordem das cenas, sem puladas, mesmo respondendo fora de ordem', () => {
    let e = ateAsCenas()
    const n = e.cenas.length
    // responde tudo, pula a 3ª, volta e troca a 2ª, depois desmarca a 5ª e pula
    for (let i = 0; i < n; i++) {
      const id = e.cenas[i]
      e = i === 2 ? rodar([{ tipo: 'pular' }], e) : rodar([{ tipo: 'escolher', valor: e.ordemOpcoes[id][i % 4] }, { tipo: 'avancar' }], e)
    }
    expect(e.etapa).toEqual({ tipo: 'resumo', cartao: 0 })
    const esperado = e.cenas
      .map((id, i) => ({ perguntaId: id, opcaoId: e.ordemOpcoes[id][i % 4] }))
      .filter((_, i) => i !== 2)
    expect(respostasOrdenadas(e)).toEqual(esperado)

    // edição: volta até a cena 1 e troca; a lista continua na ordem das cenas
    for (let k = 0; k < n - 1; k++) e = rodar([{ tipo: 'voltar' }], e)
    e = rodar([{ tipo: 'voltar' }], e) // resumo → cena n-1 → … → cena 1 no laço; este chega na cena 0
    expect(e.etapa).toEqual({ tipo: 'cena', indice: 0 })
    e = rodar([{ tipo: 'avancar' }], e)
    const c1 = e.cenas[1]
    e = rodar([{ tipo: 'escolher', valor: e.ordemOpcoes[c1][3] }], e)
    const lista = respostasOrdenadas(e)
    expect(lista.map((r) => r.perguntaId)).toEqual(esperado.map((r) => r.perguntaId))
    expect(lista[1]).toEqual({ perguntaId: c1, opcaoId: e.ordemOpcoes[c1][3] })
  })

  it('marcos "Metade" e "Última" aparecem uma vez só, e só indo para a frente', () => {
    let e = ateAsCenas()
    const n = e.cenas.length
    const metade = Math.ceil(n / 2) - 1
    const vistos: string[] = []
    for (let i = 0; i < n - 1; i++) {
      e = rodar([{ tipo: 'pular' }], e)
      if (e.marco) vistos.push(`${e.marco}@${(e.etapa as { indice: number }).indice}`)
    }
    expect(vistos).toEqual([`metade@${metade}`, `ultima@${n - 1}`])
    e = rodar([{ tipo: 'voltar' }], e)
    expect(e.marco).toBeNull()
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa).toEqual({ tipo: 'cena', indice: n - 1 })
    expect(e.marco).toBeNull()
  })

  it('mudar o perfil mantém as respostas das cenas que continuam e descarta as outras', () => {
    let e = ateAsCenas(5)
    for (const id of e.cenas) e = rodar([{ tipo: 'escolher', valor: e.ordemOpcoes[id][0] }, { tipo: 'avancar' }], e)
    const antes = e
    // volta tudo até o perfil (resumo → cenas → prioridades → último passo do perfil)
    while (e.etapa.tipo !== 'perfil') e = rodar([{ tipo: 'voltar' }], e)
    while (e.etapa.tipo === 'perfil' && e.etapa.passo > 0) e = rodar([{ tipo: 'voltar' }], e)
    // mesma seleção: nada muda
    const igual = rodar(passos.map(() => ({ tipo: 'avancar', semente: 77 }) as Evento), e)
    expect(igual.cenas).toEqual(antes.cenas)
    expect(igual.respostas).toEqual(antes.respostas)
    // perfil que troca variantes: interior do estado (trem, fila e alagamento viram outras cenas)
    const novo = rodar(
      [{ tipo: 'escolher', valor: 'interior' }, ...passos.map(() => ({ tipo: 'avancar', semente: 77 }) as Evento)],
      e,
    )
    expect(novo.etapa.tipo).toBe('prioridades')
    const esperadas = selecionarCenas(quiz.perguntas, novo.perfil).map((p) => p.id)
    expect(new Set(novo.cenas)).toEqual(new Set(esperadas))
    expect(novo.cenas).not.toEqual(antes.cenas)
    for (const id of novo.cenas) {
      if (antes.cenas.includes(id)) {
        expect(novo.respostas[id]).toBe(antes.respostas[id])
        expect(novo.ordemOpcoes[id]).toEqual(antes.ordemOpcoes[id])
      } else {
        expect(id in novo.respostas).toBe(false)
      }
    }
    expect(Object.keys(novo.respostas).every((id) => novo.cenas.includes(id))).toBe(true)
  })
})

describe('máquina do fluxo: resumo, voto e revelação', () => {
  function ateOResumo() {
    let e = ateAsCenas()
    while (e.etapa.tipo === 'cena') e = rodar([{ tipo: 'escolher', valor: e.ordemOpcoes[e.cenas[(e.etapa as { indice: number }).indice]][0] }, { tipo: 'avancar' }], e)
    return e
  }

  it('resumo em 2 cartões; voltar do 1º cartão volta à última cena', () => {
    let e = ateOResumo()
    expect(e.etapa).toEqual({ tipo: 'resumo', cartao: 0 })
    expect(rodar([{ tipo: 'voltar' }], e).etapa).toEqual({ tipo: 'cena', indice: e.cenas.length - 1 })
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa).toEqual({ tipo: 'resumo', cartao: CARTOES_RESUMO - 1 })
    expect(rodar([{ tipo: 'pular' }], ateOResumo()).etapa.tipo).toBe('resultado')
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa.tipo).toBe('resultado')
    expect(rodar([{ tipo: 'voltar' }], e).etapa).toEqual({ tipo: 'resumo', cartao: CARTOES_RESUMO - 1 })
  })

  it('voto às cegas: escolhe, troca, vota; contagem; revelação sem Voltar; cartão', () => {
    let e = rodar([{ tipo: 'avancar' }, { tipo: 'avancar' }, { tipo: 'avancar' }], ateOResumo())
    expect(e.etapa.tipo).toBe('voto')
    e = rodar([{ tipo: 'escolher', valor: 'a' }, { tipo: 'escolher', valor: 'b' }], e)
    expect(e.escolhaVoto).toEqual({ candidatoId: 'b' })
    expect(rodar([{ tipo: 'voltar' }], e).etapa.tipo).toBe('resultado')
    e = rodar([{ tipo: 'votar', candidatoId: 'b', resultado: 'contado' }], e)
    expect(e.etapa.tipo).toBe('contagem')
    expect(e.voto).toEqual({ candidatoId: 'b', resultado: 'contado' })
    expect(rodar([{ tipo: 'voltar' }], e)).toBe(e)
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa.tipo).toBe('revelacao')
    expect(rodar([{ tipo: 'voltar' }], e)).toBe(e)
    e = rodar([{ tipo: 'revelar', candidatoId: 'b' }], e)
    expect(e.revelados).toEqual(['b'])
    // avançar com cartas ainda viradas revela todas, mas fica na tela
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa.tipo).toBe('revelacao')
    expect(new Set(e.revelados)).toEqual(new Set(['a', 'b', 'c']))
    e = rodar([{ tipo: 'avancar' }], e)
    expect(e.etapa.tipo).toBe('cartao')
    expect(rodar([{ tipo: 'voltar' }], e).etapa.tipo).toBe('revelacao')
    const zerado = rodar([{ tipo: 'reiniciar' }], e)
    expect(zerado).toEqual(estadoInicial(passos))
  })

  it('"prefiro não votar" no resultado registra voto nulo sem envio', () => {
    const e = rodar([{ tipo: 'avancar' }, { tipo: 'avancar' }, { tipo: 'pular' }], ateOResumo())
    expect(e.etapa.tipo).toBe('contagem')
    expect(e.voto).toEqual({ candidatoId: null, resultado: 'nao_enviado' })
  })
})

describe('máquina do fluxo: persistência', () => {
  it('restaura o que foi salvo (ida e volta por JSON)', () => {
    let e = ateAsCenas()
    e = rodar([{ tipo: 'escolher', valor: e.ordemOpcoes[e.cenas[0]][1] }, { tipo: 'avancar' }], e)
    const volta = restaurar(ctx, passos, JSON.parse(JSON.stringify(e)))
    expect(volta).toEqual({ ...e, marco: null })
  })

  it('descarta estado de outra versão do quiz ou corrompido', () => {
    const e = ateAsCenas()
    const outroQuiz: ContextoFluxo = { perguntas: (quizPres as unknown as Quiz).perguntas }
    expect(restaurar(outroQuiz, passos, JSON.parse(JSON.stringify(e)))).toBeNull()
    expect(restaurar(ctx, passos, { ...e, etapa: { tipo: 'cena', indice: 99 } })).toBeNull()
    expect(restaurar(ctx, passos, { ...e, versao: 0 })).toBeNull()
    expect(restaurar(ctx, passos, { ...e, etapa: { tipo: 'revelacao' } })).toBeNull()
    expect(restaurar(ctx, passosDoPerfil(false), JSON.parse(JSON.stringify(e)))).toBeNull()
    expect(restaurar(ctx, passos, 'lixo')).toBeNull()
    expect(restaurar(ctx, passos, null)).toBeNull()
  })
})
