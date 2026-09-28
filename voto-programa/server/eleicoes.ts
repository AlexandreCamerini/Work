import { candidatos } from '../src/data/candidatos'
import { candidatosPresidente } from '../src/data/candidatos-presidente'

/** Única lista aceita pela urna: voto em eleição ou candidato fora dela é recusado. */
export const ELEICOES: Record<string, readonly string[]> = {
  'governador-rj': candidatos.map((c) => c.id),
  presidente: candidatosPresidente.map((c) => c.id),
}
