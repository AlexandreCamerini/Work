/**
 * Todas as eleições carregadas de uma vez, por import estático. Só para testes e scripts:
 * o app usa o carregamento sob demanda de ./index.ts.
 */
import aderenciaJson from './aderencia.json'
import evidenciasJson from './evidencias.json'
import quizJson from './quiz.json'
import contextoJson from './contexto.json'
import aderenciaPresJson from './aderencia-presidente.json'
import evidenciasPresJson from './evidencias-presidente.json'
import quizPresJson from './quiz-presidente.json'
import contextoPresJson from './contexto-presidente.json'
import { candidatos, foraDoQuiz } from './candidatos'
import { candidatosPresidente, foraDoQuizPresidente } from './candidatos-presidente'
import type { Aderencia, Contextos, Eleicao, Evidencias, Quiz } from '../types'

export const governadorRJ: Eleicao = {
  id: 'governador-rj',
  quiz: quizJson as unknown as Quiz,
  aderencia: aderenciaJson as unknown as Aderencia,
  evidencias: evidenciasJson as unknown as Evidencias,
  contextos: contextoJson as Contextos,
  candidatos,
  foraDoQuiz,
}

export const presidente: Eleicao = {
  id: 'presidente',
  quiz: quizPresJson as unknown as Quiz,
  aderencia: aderenciaPresJson as unknown as Aderencia,
  evidencias: evidenciasPresJson as unknown as Evidencias,
  contextos: contextoPresJson as Contextos,
  candidatos: candidatosPresidente,
  foraDoQuiz: foraDoQuizPresidente,
}

export const eleicoes: Eleicao[] = [governadorRJ, presidente]
