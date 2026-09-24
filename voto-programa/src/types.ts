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
  /** Variantes do mesmo assunto compartilham o grupo; cada eleitor vê só uma por grupo. */
  grupo: string
  /** Para quem a variante serve. Sem `publico`, é a variante padrão do grupo. */
  publico?: Publico
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
  /** Completa a frase "São N ..." na abertura do quiz. */
  descricao: string
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

export type Saude = 'sus' | 'plano_empresa' | 'plano_proprio'
export type Deslocamento = 'publico' | 'carro' | 'moto' | 'app' | 'casa'
export type Escola = 'publica' | 'particular' | 'nenhuma'
export type Trabalho = 'carteira' | 'servidor' | 'autonomo' | 'empresario' | 'aposentado' | 'sem_trabalho'
/** Faixa larga de uso de serviços (aproxima C2/DE, C1/B2 e B1/A do Critério Brasil). Nunca exibida. */
export type Faixa = 'publico' | 'misto' | 'privado'

/** Respostas da tela "sobre você". Todas opcionais: quem pula vê as cenas padrão. */
export interface Perfil {
  saude: Saude | null
  escola: Escola | null
  deslocamento: Deslocamento | null
  trabalho: Trabalho | null
  banheiros: 1 | 2 | 3 | null
}

export interface Publico {
  faixa?: Faixa[]
  saude?: Saude[]
  deslocamento?: Deslocamento[]
  escola?: Escola[]
  trabalho?: Trabalho[]
}

export type StatusCompromisso = 'cumprida' | 'parcial' | 'em_andamento' | 'nao_cumprida' | 'na_contramao' | 'sem_informacao'

export interface Compromisso {
  id: string
  tema: string
  compromisso: string
  trecho_promessa: string
  fonte_promessa: { veiculo: string; url: string; data: string | null }
  status: StatusCompromisso
  explicacao: string
  evidencias: { trecho: string; veiculo: string; url: string; data: string | null }[]
}

export interface Acompanhamento {
  candidato_id: string
  mandato: string
  plano: { titulo: string; url: string; observacao: string }
  metodologia: string
  atualizado_em: string
  compromissos: Compromisso[]
}

export interface Eleicao {
  id: string
  quiz: Quiz
  aderencia: Aderencia
  evidencias: Evidencias
  candidatos: Candidato[]
  /** Candidatos oficializados que não estão no quiz e por quê, listados por transparência. */
  foraDoQuiz: { motivo: string; nomes: string[] }
}
