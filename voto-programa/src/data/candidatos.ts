import type { Candidato } from '../types'

/**
 * Piloto: Governador do Rio de Janeiro 2026 (1º turno em 04/10/2026). Paes e Ruas
 * lideram (Datafolha, 14/09/2026); os demais seguem a ordem do registro. As propostas
 * estão em pipeline/dossies/governador-rj/, e a aderência em src/data/aderencia.json.
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
  {
    id: 'andre-marinho',
    nome: 'André Marinho',
    numero: '30',
    partido: 'Novo',
    cargo: 'Governador',
    vice: 'Erigreyce Monteiro (Novo)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/rj-governador-andre-marinho.pdf',
  },
  {
    id: 'william-siri',
    nome: 'William Siri',
    numero: '50',
    partido: 'PSOL',
    cargo: 'Governador',
    federacao: 'Federação PSOL/REDE',
    vice: 'Juliana Carvalho (PSOL)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/rj-governador-william-siri.pdf',
  },
  {
    id: 'coronel-busnello',
    nome: 'Coronel Busnello',
    numero: '14',
    partido: 'Missão',
    cargo: 'Governador',
    vice: 'Rafael Luz (Missão)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/rj-governador-coronel-busnello.pdf',
  },
  {
    id: 'cyro-garcia',
    nome: 'Cyro Garcia',
    numero: '16',
    partido: 'PSTU',
    cargo: 'Governador',
    vice: 'Perciliana Rodrigues (PSTU)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://candidatos.nexojornal.com.br/planos/rj-governador-cyro-garcia.pdf',
  },
  {
    id: 'juliete-pantoja',
    nome: 'Juliete Pantoja',
    numero: '80',
    partido: 'UP',
    cargo: 'Governador',
    vice: 'Bia Martins (UP)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://static.ndmais.com.br/eleicoes/2026/planos-de-governo/RJ/2026RJ190002547272_01.pdf',
  },
  {
    id: 'luan-monteiro',
    nome: 'Luan Monteiro',
    numero: '29',
    partido: 'PCO',
    cargo: 'Governador',
    vice: 'Caetano Albuquerque (PCO)',
    situacaoJudicial: {
      status: 'regular',
      descricao: 'Candidatura registrada; situação do registro no DivulgaCand ainda não conferida.',
      fonteUrl:
        'https://www.gazetadopovo.com.br/eleicoes/2026/rio-de-janeiro/quem-sao-candidatos-governador-rio-de-janeiro-2026/',
      atualizadoEm: '2026-09-24',
    },
    planoGovernoUrl: 'https://static.ndmais.com.br/eleicoes/2026/planos-de-governo/RJ/2026RJ190002552513_01.pdf',
  },
]

/** Oficializados que não entram no teste, com o motivo, para o aviso de escopo do site. */
export const foraDoQuiz = {
  motivo: 'candidatura sub judice (registro indeferido pelo TRE-RJ, recurso no TSE) e sem plano de governo registrado',
  nomes: ['Anthony Garotinho (Republicanos)'],
}
