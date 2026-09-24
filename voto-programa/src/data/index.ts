import aderenciaJson from './aderencia.json'
import evidenciasJson from './evidencias.json'
import quizJson from './quiz.json'
import { candidatos, outrosCandidatos } from './candidatos'
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

export const eleicoes: Eleicao[] = [governadorRJ]

/** Mandatos em curso comparados com o plano da eleição anterior. Vencedores de 2026 entram após a posse. */
export const acompanhamentos: { id: string; titulo: string; dados: Acompanhamento }[] = []
