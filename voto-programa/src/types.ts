export interface Tema {
  id: string
  nome: string
}

export interface Opcao {
  id: string
  texto: string
  /** Direção de política pública implícita na reação; usada só pelo pipeline de aderência. */
  preferencia: string
}

export interface Fato {
  texto: string
  fonte: string
  url: string
}

export interface Pergunta {
  id: string
  tema: string
  /** Cena em que os candidatos têm propostas parecidas; mostrada como "nisso eles concordam". */
  consenso?: boolean
  cena: string
  pergunta: string
  opcoes: Opcao[]
  fato: Fato
}

export interface Quiz {
  versao: string
  titulo: string
  eleicao: string
  temas: Tema[]
  perguntas: Pergunta[]
}

export interface Avaliacao {
  /** 0-100, ou null quando o candidato não tem proposta documentada sobre o assunto. */
  nota: number | null
  evidencias: string[]
  justificativa: string
}

export interface Aderencia {
  gerado_em: string
  modelo: string
  revisado_por: string | null
  versao_quiz: string
  itens: Record<string, Record<string, Record<string, Avaliacao>>>
}

export interface Evidencia {
  resumo: string
  trecho: string
  fonte: { veiculo: string; tipo: string; data: string | null; url: string }
}

export type Evidencias = Record<string, Record<string, Evidencia>>

export interface Resposta {
  perguntaId: string
  opcaoId: string
}

export type StatusCandidatura = 'regular' | 'sub_judice' | 'indeferida'

export interface Candidato {
  id: string
  nome: string
  numero: string
  partido: string
  cargo: string
  coligacao?: string
  federacao?: string
  vice?: string
  situacaoJudicial: {
    status: StatusCandidatura
    descricao: string
    fonteUrl: string
    atualizadoEm: string
  }
  planoGovernoUrl: string
}

export interface Motivo {
  perguntaId: string
  opcaoId: string
  avaliacao: Avaliacao
}

export interface Resultado {
  candidato: Candidato
  /** null quando há menos situações com evidência do que o mínimo para calcular. */
  afinidade: number | null
  cobertura: number
  motivos: Motivo[]
}
