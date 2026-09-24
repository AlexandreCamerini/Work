import type { Candidato } from '../types'

/**
 * Presidente da República 2026: os dois primeiros nas pesquisas (Datafolha 17/09 e Quaest 21/09).
 * Número, vice e coligação conforme a lista oficial do TSE publicada em 18/09/2026.
 */
const FONTE_TSE =
  'https://sintse.tse.jus.br/documentos/2026/Set/18/diario-da-justica-eletronico-tse/lista-de-candidatas-e-candidatos-aos-cargos-de-presidente-e-vice-presidente-da-republica'

export const candidatosPresidente: Candidato[] = [
  {
    id: 'lula',
    nome: 'Lula',
    numero: '13',
    partido: 'PT',
    cargo: 'Presidente',
    coligacao: 'Brasil Pronto pra Mais (PSB, PDT, Federação Brasil da Esperança [PT/PCdoB/PV], Federação PSOL/Rede)',
    vice: 'Geraldo Alckmin (PSB)',
    situacaoJudicial: { status: 'regular', descricao: 'Candidatura registrada no TSE.', fonteUrl: FONTE_TSE, atualizadoEm: '2026-09-24' },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/br-presidente-lula.pdf',
  },
  {
    id: 'flavio-bolsonaro',
    nome: 'Flávio Bolsonaro',
    numero: '22',
    partido: 'PL',
    cargo: 'Presidente',
    vice: 'Alfredo Gaspar (PL)',
    situacaoJudicial: { status: 'regular', descricao: 'Candidatura registrada no TSE.', fonteUrl: FONTE_TSE, atualizadoEm: '2026-09-24' },
    planoGovernoUrl: 'https://static.poder360.com.br/uploads/2026/08/FLAVIO-BOLSONARO-PARA-O-BRASIL-VENCER-O-ATRASO-1-1.pdf',
  },
]

export const outrosCandidatosPresidente = [
  'Augusto Cury (Avante)',
  'Clariana Barão (DC)',
  'Edmilson Costa (PCB)',
  'Hertz Dias (PSTU)',
  'Leonardo Avalanche (PRTB)',
  'Renan Santos (Missão)',
  'Romeu Zema (Novo)',
  'Ronaldo Caiado (PSD)',
  'Rui Costa Pimenta (PCO)',
  'Samara Martins (UP)',
  'Veterinário Wilson Grassi (Democrata)',
]
