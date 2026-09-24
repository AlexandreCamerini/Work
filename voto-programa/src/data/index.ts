import aderenciaJson from './aderencia.json'
import evidenciasJson from './evidencias.json'
import quizJson from './quiz.json'
import aderenciaPresJson from './aderencia-presidente.json'
import evidenciasPresJson from './evidencias-presidente.json'
import quizPresJson from './quiz-presidente.json'
import lula2022 from '../../pipeline/acompanhamento/lula-2022.json'
import { candidatos, outrosCandidatos } from './candidatos'
import { candidatosPresidente, outrosCandidatosPresidente } from './candidatos-presidente'
import type { Acompanhamento, Aderencia, Eleicao, Evidencias, Quiz } from '../types'

export const quiz = quizJson as unknown as Quiz
export const aderencia = aderenciaJson as unknown as Aderencia
export const evidencias = evidenciasJson as unknown as Evidencias

export const governadorRJ: Eleicao = {
  id: 'governador-rj',
  quiz,
  aderencia,
  evidencias,
  candidatos,
  foraDoQuiz: outrosCandidatos,
}

export const presidente: Eleicao = {
  id: 'presidente',
  quiz: quizPresJson as unknown as Quiz,
  aderencia: aderenciaPresJson as unknown as Aderencia,
  evidencias: evidenciasPresJson as unknown as Evidencias,
  candidatos: candidatosPresidente,
  foraDoQuiz: outrosCandidatosPresidente,
}

export const eleicoes: Eleicao[] = [governadorRJ, presidente]

/**
 * Mandatos comparados com o plano de governo. Por decisão editorial, a área só vai ao ar depois
 * do 2º turno: o build de produção só inclui estes dados com VITE_PUBLICAR_ACOMPANHAMENTO=true.
 * Vencedores de 2026 entram a partir da posse.
 */
export const acompanhamentos: { id: string; titulo: string; dados: Acompanhamento }[] =
  import.meta.env.VITE_PUBLICAR_ACOMPANHAMENTO === 'true'
    ? [{ id: 'prometeu-lula-2022', titulo: 'Lula: o que foi prometido em 2022', dados: lula2022 as unknown as Acompanhamento }]
    : []
