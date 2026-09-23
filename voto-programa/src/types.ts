/** Escala Likert de 5 pontos: -2 discorda totalmente ... +2 concorda totalmente. */
export type Posicao = -2 | -1 | 0 | 1 | 2

/** Peso que o eleitor dá ao tema da pergunta: 1 (pouco importante) a 3 (prioridade). */
export type Importancia = 1 | 2 | 3

export interface Eixo {
  id: string
  nome: string
  descricao: string
}

export interface Pergunta {
  id: string
  eixoId: string
  texto: string
}

export interface RespostaUsuario {
  perguntaId: string
  posicao: Posicao
  importancia: Importancia
}

/** Posição de um candidato numa pergunta, sempre rastreável a uma fonte pública. */
export interface PosicaoCandidato {
  perguntaId: string
  posicao: Posicao
  /** URL da fonte primária (plano de governo registrado, site oficial, etc.). Obrigatória. */
  fonteUrl: string
}

export interface Candidato {
  id: string
  nome: string
  numero: string
  partido: string
  cargo: string
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
