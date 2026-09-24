/**
 * Cliente da votação anônima (server/app.ts). Só o id do candidato sai do aparelho, e só
 * quando o servidor diz que a votação está aberta. Sem servidor (protótipo, arquivo
 * local), tudo degrada para "votação simbólica": o voto só revela os nomes.
 */

export interface EstadoVotacao {
  aberta: boolean
  abreEm: string | null
  turnstileSiteKey: string | null
  /** true quando não há API (protótipo ou falha de rede). */
  offline: boolean
}

export interface Placar {
  total: number
  minimo: number
  /** null enquanto o total não atinge o mínimo para mostrar a divisão. */
  votos: Record<string, number> | null
}

export type ResultadoVoto = 'contado' | 'ja_votou' | 'nao_enviado' | 'devagar' | 'desafio' | 'erro'

const FECHADA_OFFLINE: EstadoVotacao = { aberta: false, abreEm: null, turnstileSiteKey: null, offline: true }

async function json<T>(resposta: Response): Promise<T | null> {
  if (!resposta.headers.get('content-type')?.includes('application/json')) return null
  try {
    return (await resposta.json()) as T
  } catch {
    return null
  }
}

export async function lerEstado(): Promise<EstadoVotacao> {
  try {
    const dados = await json<Omit<EstadoVotacao, 'offline'>>(await fetch('/api/estado'))
    return dados && typeof dados.aberta === 'boolean' ? { ...dados, offline: false } : FECHADA_OFFLINE
  } catch {
    return FECHADA_OFFLINE
  }
}

function chave(eleicao: string) {
  return `votou:${eleicao}`
}

/** Trava leve contra voto repetido no mesmo navegador. Não identifica ninguém nem vai ao servidor. */
export function jaVotou(eleicao: string): boolean {
  try {
    return localStorage.getItem(chave(eleicao)) === '1'
  } catch {
    return false
  }
}

function marcarVoto(eleicao: string) {
  try {
    localStorage.setItem(chave(eleicao), '1')
  } catch {
    // modo privado ou armazenamento bloqueado: segue sem a trava
  }
}

export async function enviarVoto(
  estado: EstadoVotacao,
  eleicao: string,
  candidato: string,
  token: string | null,
): Promise<ResultadoVoto> {
  if (!estado.aberta) return 'nao_enviado'
  if (jaVotou(eleicao)) return 'ja_votou'
  try {
    const r = await fetch('/api/votos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eleicao, candidato, ...(token ? { token } : {}) }),
    })
    if (r.status === 204) {
      marcarVoto(eleicao)
      return 'contado'
    }
    if (r.status === 429) return 'devagar'
    if (r.status === 403) return 'desafio'
    return 'erro'
  } catch {
    return 'erro'
  }
}

export async function lerPlacar(eleicao: string): Promise<Placar | null> {
  try {
    const r = await fetch(`/api/placar/${encodeURIComponent(eleicao)}`)
    return r.ok ? await json<Placar>(r) : null
  } catch {
    return null
  }
}

export function dataBr(iso: string | null) {
  return iso ? iso.split('-').reverse().join('/') : null
}

const MENSAGEM_VOTO: Record<ResultadoVoto, string> = {
  contado: 'Seu voto entrou no placar.',
  ja_votou: 'Você já tinha votado nesta eleição neste aparelho, então este voto não foi somado de novo.',
  nao_enviado: '',
  devagar: 'Muitos votos saindo da mesma rede agora. Seu voto não foi somado; tente de novo em um minuto.',
  desafio: 'Não conseguimos confirmar que é uma pessoa votando, então o voto não foi somado.',
  erro: 'Não conseguimos registrar o voto agora. Ele não foi somado.',
}

export function mensagemVoto(resultado: ResultadoVoto) {
  return MENSAGEM_VOTO[resultado]
}
