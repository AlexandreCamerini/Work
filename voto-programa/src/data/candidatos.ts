import type { Candidato } from '../types'

/**
 * DADOS FICTÍCIOS DE DEMONSTRAÇÃO — NÃO REPRESENTAM CANDIDATOS REAIS.
 *
 * Este arquivo é o único lugar que precisa ser editado para colocar o site no ar
 * com uma eleição real. Cada `posicao` deve ser inferida de uma fonte pública
 * verificável (plano de governo registrado no TSE, entrevista, site oficial) e
 * `fonteUrl` deve apontar exatamente para essa fonte — a UI exibe esse link ao
 * lado de cada posição para que o eleitor possa auditar a informação.
 *
 * Nunca publique posições inferidas sem uma fonte citável: a ferramenta perde
 * credibilidade e pode induzir o eleitor a erro.
 */
export const candidatos: Candidato[] = [
  {
    id: 'exemplo-a',
    nome: 'Candidato Exemplo A',
    numero: '10',
    partido: 'Partido Exemplo',
    cargo: 'Presidente',
    planoGovernoUrl: 'https://www.tse.jus.br/eleicoes/planos-de-governo',
    posicoes: [
      { perguntaId: 'econ-1', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'econ-2', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'econ-3', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'saude-1', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'saude-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'saude-3', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'edu-1', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'edu-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'edu-3', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'seg-1', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'seg-2', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'seg-3', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'amb-1', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'amb-2', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'amb-3', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'dir-1', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'dir-2', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-a' },
      { perguntaId: 'dir-3', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-a' },
    ],
  },
  {
    id: 'exemplo-b',
    nome: 'Candidato Exemplo B',
    numero: '20',
    partido: 'Partido Exemplo',
    cargo: 'Presidente',
    planoGovernoUrl: 'https://www.tse.jus.br/eleicoes/planos-de-governo',
    posicoes: [
      { perguntaId: 'econ-1', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'econ-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'econ-3', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'saude-1', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'saude-2', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'saude-3', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'edu-1', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'edu-2', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'edu-3', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'seg-1', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'seg-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'seg-3', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'amb-1', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'amb-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'amb-3', posicao: -2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'dir-1', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'dir-2', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
      { perguntaId: 'dir-3', posicao: 2, fonteUrl: 'https://exemplo.invalid/plano-b' },
    ],
  },
  {
    id: 'exemplo-c',
    nome: 'Candidato Exemplo C',
    numero: '30',
    partido: 'Partido Exemplo',
    cargo: 'Presidente',
    planoGovernoUrl: 'https://www.tse.jus.br/eleicoes/planos-de-governo',
    posicoes: [
      { perguntaId: 'econ-1', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'econ-2', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'econ-3', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'saude-1', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'saude-2', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'saude-3', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'edu-1', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'edu-2', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'edu-3', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'seg-1', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'seg-2', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'seg-3', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'amb-1', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'amb-2', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'amb-3', posicao: -1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'dir-1', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'dir-2', posicao: 1, fonteUrl: 'https://exemplo.invalid/plano-c' },
      { perguntaId: 'dir-3', posicao: 0, fonteUrl: 'https://exemplo.invalid/plano-c' },
    ],
  },
]
