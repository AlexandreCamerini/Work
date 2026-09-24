import type { Candidato } from '../types'

/**
 * Piloto: Governador do Rio de Janeiro 2026 (1º turno em 04/10/2026), restrito aos
 * dois candidatos com maior intenção de voto (Datafolha, 14/09/2026). As propostas
 * de cada um estão em pipeline/dossies/, e a aderência em src/data/aderencia.json.
 */
export const candidatos: Candidato[] = [
  {
    id: 'eduardo-paes',
    nome: 'Eduardo Paes',
    numero: '55',
    partido: 'PSD',
    cargo: 'Governador',
    coligacao:
      'Juntos para Mudar, Coragem para Reconstruir (PSD, PDT, MDB, DC, PSB, Federação PSDB-Cidadania, Federação Brasil da Esperança, Federação Renovação Solidária)',
    vice: 'Jane Reis (MDB)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Registro de candidatura sem indício de impugnação.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl:
      'https://static.ndmais.com.br/eleicoes/2026/planos-de-governo/RJ/2026RJ190002543380_01.pdf',
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
      fonteUrl:
        'https://www.nsctotal.com.br/politica/eleicoes-2026-quem-e-douglas-ruas-candidato-do-pl-ao-governo-do-rio-de-janeiro',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/rj-governador-douglas-ruas.pdf',
  },
]

/** Todos os candidatos oficializados, para o aviso de escopo exibido no site. */
export const outrosCandidatos = [
  'André Marinho (Novo)',
  'Anthony Garotinho (Republicanos, candidatura sub judice)',
  'Coronel Busnello (Missão)',
  'Cyro Garcia (PSTU)',
  'Juliete Pantoja (UP)',
  'Luan Monteiro (PCO)',
  'William Siri (PSOL)',
]
