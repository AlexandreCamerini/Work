/** Escala de afinidade: -2 opção mais distante do eixo ... +2 opção mais próxima. */
export type Posicao = -2 | -1 | 0 | 1 | 2

/** Peso que o eleitor dá ao tema da pergunta: 1 (pouco importante) a 3 (prioridade). */
export type Importancia = 1 | 2 | 3

export interface Eixo {
  id: string
  nome: string
  descricao: string
}

/** Uma reação concreta à situação, mapeada numa posição no eixo temático. */
export interface OpcaoResposta {
  id: string
  label: string
  posicao: Posicao
}

/**
 * Pergunta situacional: descreve um cenário do dia a dia (não uma afirmação
 * ideológica) e oferece reações concretas em vez de escala concordo/discordo.
 * O eleitor reconhece a situação; a tradução para posição no eixo é do produto,
 * não do eleitor.
 */
export interface Pergunta {
  id: string
  eixoId: string
  cenario: string
  opcoes: OpcaoResposta[]
}

export interface RespostaUsuario {
  perguntaId: string
  posicao: Posicao
  importancia: Importancia
}

/**
 * Posição de um candidato numa pergunta, sempre rastreável a uma fonte pública.
 * `trechoFonte` é o trecho literal do documento oficial que embasa a posição —
 * exigido para que a extração seja auditável e contestável.
 */
export interface PosicaoCandidato {
  perguntaId: string
  posicao: Posicao
  fonteUrl: string
  trechoFonte: string
}

export type StatusCandidatura = 'regular' | 'sub_judice' | 'indeferida'

export interface SituacaoJudicial {
  status: StatusCandidatura
  descricao: string
  fonteUrl: string
  /** Data (ISO) da última checagem — status sub judice pode mudar até o pleito. */
  atualizadoEm: string
}

export interface Candidato {
  id: string
  nome: string
  numero: string
  partido: string
  cargo: string
  /** Coligação eleitoral (aliança temporária) — distinta de federação partidária. */
  coligacao?: string
  /** Federação partidária (fusão formal de partidos) — distinta de coligação. */
  federacao?: string
  vice?: string
  situacaoJudicial: SituacaoJudicial
  planoGovernoUrl: string
  posicoes: PosicaoCandidato[]
}

export interface EixoScore {
  eixoId: string
  afinidade: number
  perguntasRespondidas: number
}

export interface CandidatoResultado {
  candidato: Candidato
  afinidadeGeral: number
  perguntasComparadas: number
  porEixo: EixoScore[]
}
