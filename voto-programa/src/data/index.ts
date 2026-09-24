import aderenciaJson from './aderencia.json'
import evidenciasJson from './evidencias.json'
import quizJson from './quiz.json'
import type { Aderencia, Evidencias, Quiz } from '../types'

export const quiz = quizJson as unknown as Quiz
export const aderencia = aderenciaJson as unknown as Aderencia
export const evidencias = evidenciasJson as unknown as Evidencias
