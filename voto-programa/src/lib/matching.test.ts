import { describe, expect, it } from 'vitest'
import type { Candidato, RespostaUsuario } from '../types'
import { calcularAfinidade, calcularRanking } from './matching'

function candidato(posicoes: Candidato['posicoes']): Candidato {
  return {
    id: 'c1',
    nome: 'Candidato',
    numero: '1',
    partido: 'P',
    cargo: 'Teste',
    planoGovernoUrl: 'https://exemplo.invalid',
    posicoes,
  }
}

describe('calcularAfinidade', () => {
  it('retorna 100% quando todas as posições coincidem', () => {
    const c = candidato([{ perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' }])
    const respostas: RespostaUsuario[] = [{ perguntaId: 'econ-1', posicao: 2, importancia: 2 }]

    const resultado = calcularAfinidade(c, respostas)

    expect(resultado.afinidadeGeral).toBe(100)
    expect(resultado.perguntasComparadas).toBe(1)
  })

  it('retorna 0% quando as posições são diametralmente opostas', () => {
    const c = candidato([{ perguntaId: 'econ-1', posicao: -2, fonteUrl: 'https://x' }])
    const respostas: RespostaUsuario[] = [{ perguntaId: 'econ-1', posicao: 2, importancia: 1 }]

    expect(calcularAfinidade(c, respostas).afinidadeGeral).toBe(0)
  })

  it('pondera pela importância declarada pelo usuário', () => {
    const c = candidato([
      { perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' }, // concorda total
      { perguntaId: 'econ-2', posicao: -2, fonteUrl: 'https://x' }, // discorda total
    ])
    const respostasPesoIgual: RespostaUsuario[] = [
      { perguntaId: 'econ-1', posicao: 2, importancia: 1 },
      { perguntaId: 'econ-2', posicao: 2, importancia: 1 },
    ]
    const respostasPriorizandoDiscordancia: RespostaUsuario[] = [
      { perguntaId: 'econ-1', posicao: 2, importancia: 1 },
      { perguntaId: 'econ-2', posicao: 2, importancia: 3 },
    ]

    const semPeso = calcularAfinidade(c, respostasPesoIgual).afinidadeGeral
    const comPeso = calcularAfinidade(c, respostasPriorizandoDiscordancia).afinidadeGeral

    expect(comPeso).toBeLessThan(semPeso)
  })

  it('ignora perguntas sem posição cadastrada para o candidato', () => {
    const c = candidato([{ perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' }])
    const respostas: RespostaUsuario[] = [
      { perguntaId: 'econ-1', posicao: 2, importancia: 2 },
      { perguntaId: 'pergunta-inexistente', posicao: -2, importancia: 3 },
    ]

    const resultado = calcularAfinidade(c, respostas)

    expect(resultado.perguntasComparadas).toBe(1)
    expect(resultado.afinidadeGeral).toBe(100)
  })

  it('agrupa o score por eixo temático', () => {
    const c = candidato([
      { perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' },
      { perguntaId: 'saude-1', posicao: -2, fonteUrl: 'https://x' },
    ])
    const respostas: RespostaUsuario[] = [
      { perguntaId: 'econ-1', posicao: 2, importancia: 2 },
      { perguntaId: 'saude-1', posicao: 2, importancia: 2 },
    ]

    const resultado = calcularAfinidade(c, respostas)
    const eixoEconomia = resultado.porEixo.find((e) => e.eixoId === 'economia')
    const eixoSaude = resultado.porEixo.find((e) => e.eixoId === 'saude')

    expect(eixoEconomia?.afinidade).toBe(100)
    expect(eixoSaude?.afinidade).toBe(0)
  })

  it('não conta perguntas sem resposta do usuário na afinidade geral', () => {
    const c = candidato([{ perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' }])
    const resultado = calcularAfinidade(c, [])

    expect(resultado.afinidadeGeral).toBe(0)
    expect(resultado.perguntasComparadas).toBe(0)
  })
})

describe('calcularRanking', () => {
  it('ordena candidatos do maior para o menor grau de afinidade', () => {
    const candidatoAlinhado = candidato([{ perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://x' }])
    const candidatoOposto = candidato([{ perguntaId: 'econ-1', posicao: -2, fonteUrl: 'https://x' }])
    const respostas: RespostaUsuario[] = [{ perguntaId: 'econ-1', posicao: 2, importancia: 2 }]

    const ranking = calcularRanking([candidatoOposto, candidatoAlinhado], respostas)

    expect(ranking[0].candidato).toBe(candidatoAlinhado)
    expect(ranking[1].candidato).toBe(candidatoOposto)
  })
})
