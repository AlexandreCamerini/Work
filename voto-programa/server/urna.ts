/** Onde os votos ficam. Só contadores por (eleição, candidato): nada por pessoa. */
export interface Urna {
  votar(eleicao: string, candidato: string): Promise<void>
  placar(eleicao: string): Promise<Record<string, number>>
}

export const SQL_VOTAR =
  'INSERT INTO placar (eleicao, candidato, votos) VALUES (?, ?, 1) ' +
  'ON CONFLICT (eleicao, candidato) DO UPDATE SET votos = placar.votos + 1'
export const SQL_PLACAR = 'SELECT candidato, votos FROM placar WHERE eleicao = ?'

/** Para testes e desenvolvimento local; perde tudo ao reiniciar. */
export function urnaEmMemoria(): Urna {
  const contagem = new Map<string, Map<string, number>>()
  return {
    async votar(eleicao, candidato) {
      const porCandidato = contagem.get(eleicao) ?? new Map<string, number>()
      porCandidato.set(candidato, (porCandidato.get(candidato) ?? 0) + 1)
      contagem.set(eleicao, porCandidato)
    },
    async placar(eleicao) {
      return Object.fromEntries(contagem.get(eleicao) ?? [])
    },
  }
}
