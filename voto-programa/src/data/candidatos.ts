import type { Candidato } from '../types'

/**
 * Piloto: eleição de Governador do Rio de Janeiro 2026 (1º turno em 04/10/2026).
 * Escopo reduzido aos 2 favoritos apurados nas pesquisas até 24/09/2026 — ver
 * README para os 9 candidatos oficializados e o critério de corte.
 *
 * `posicoes` está vazio propositalmente: cada posição precisa vir do PDF de
 * "Proposta de Governo" registrado no TSE (Portal de Dados Abertos, dataset
 * `candidatos-2026`, recurso `proposta_governo_2026_RJ.zip`, casável por
 * SQ_CANDIDATO com `consulta_cand_2026.zip`) com o trecho literal citado em
 * `trechoFonte`. Nenhuma posição deve ser inferida de notícia ou opinião.
 */
export const candidatos: Candidato[] = [
  {
    id: 'eduardo-paes',
    nome: 'Eduardo Paes',
    numero: '55',
    partido: 'PSD',
    cargo: 'Governador',
    coligacao:
      'Juntos para Mudar, Coragem para Reconstruir (PSD, PDT, MDB, DC, PSB, Federação PSDB-Cidadania, Federação Brasil da Esperança [PT/PCdoB/PV], Federação Renovação Solidária [PRD/Solidariedade])',
    vice: 'Jane Reis (MDB)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Registro de candidatura sem indício de impugnação.',
      fonteUrl: 'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://divulgacandcontas.tse.jus.br',
    posicoes: [],
  },
  {
    id: 'douglas-ruas',
    nome: 'Douglas Ruas',
    numero: '22',
    partido: 'PL',
    cargo: 'Governador',
    coligacao: 'Rio Real (PL, Mobiliza, Agir, Avante)',
    vice: 'Fernanda Louback (PL)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Registro de candidatura sem indício de impugnação.',
      fonteUrl: 'https://www.nsctotal.com.br/politica/eleicoes-2026-quem-e-douglas-ruas-candidato-do-pl-ao-governo-do-rio-de-janeiro',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://divulgacandcontas.tse.jus.br',
    posicoes: [],
  },
]

/**
 * Fora do escopo do piloto por decisão de produto (ver README): candidatura
 * sub judice — TRE-RJ indeferiu em 11/09/2026 (RCand 0602359-26) por suspensão
 * de direitos políticos; recurso pendente no TSE, mérito ainda não julgado.
 * Reavaliar se o TSE reverter a decisão antes de 04/10/2026.
 */
export const candidatosEmWatch: Candidato[] = [
  {
    id: 'anthony-garotinho',
    nome: 'Anthony Garotinho',
    numero: '10',
    partido: 'Republicanos',
    cargo: 'Governador',
    coligacao: 'Coragem para Mudar (Republicanos, Democrata)',
    vice: 'André Monteiro (Democrata)',
    situacaoJudicial: {
      status: 'sub_judice',
      descricao:
        'TRE-RJ indeferiu o registro por unanimidade em 11/09/2026 (RCand 0602359-26) por suspensão de direitos políticos por 8 anos (improbidade administrativa). Recurso pendente no TSE; em 20/09/2026 o relator restabeleceu liminarmente fundo eleitoral e horário eleitoral gratuito, sem julgar o mérito do registro.',
      fonteUrl:
        'https://www.tre-rj.jus.br/comunicacao/noticias/2026/Setembro/tre-rj-indefere-registro-de-candidatura-de-anthony-garotinho-ao-governo-do-estado',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://divulgacandcontas.tse.jus.br',
    posicoes: [],
  },
]
