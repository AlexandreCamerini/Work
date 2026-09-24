/**
 * Onde os votos ficam. Só contadores: nada por pessoa, sem horário. Não há leitura pela
 * API: os números são consultados só por quem tem acesso ao banco (ver README).
 */
export interface Urna {
  /** Posição, no ranking de afinidade da pessoa, do candidato em que ela votou (1 = primeiro). */
  registrarPosicao(eleicao: string, posicao: number): Promise<void>
  /** Contador por candidato: desligado durante a campanha (CONTAR_CANDIDATO). */
  registrarCandidato(eleicao: string, candidato: string): Promise<void>
}

export const SQL_POSICAO =
  'INSERT INTO posicao_voto (eleicao, posicao, votos) VALUES (?, ?, 1) ' +
  'ON CONFLICT (eleicao, posicao) DO UPDATE SET votos = posicao_voto.votos + 1'
export const SQL_CANDIDATO =
  'INSERT INTO placar (eleicao, candidato, votos) VALUES (?, ?, 1) ' +
  'ON CONFLICT (eleicao, candidato) DO UPDATE SET votos = placar.votos + 1'

/** Para testes e desenvolvimento local; perde tudo ao reiniciar. */
export function urnaEmMemoria() {
  const posicoes = new Map<string, number>()
  const candidatos = new Map<string, number>()
  const somar = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1)
  return {
    async registrarPosicao(eleicao: string, posicao: number) {
      somar(posicoes, `${eleicao}/${posicao}`)
    },
    async registrarCandidato(eleicao: string, candidato: string) {
      somar(candidatos, `${eleicao}/${candidato}`)
    },
    contagem: () => ({ posicoes: Object.fromEntries(posicoes), candidatos: Object.fromEntries(candidatos) }),
  } satisfies Urna & { contagem: () => unknown }
}
