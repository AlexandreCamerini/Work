/**
 * Cliente da votação (server/app.ts). Nenhum resultado é lido nem mostrado: o voto só vira
 * contador interno. Durante a campanha sai do aparelho apenas a posição do candidato votado
 * no ranking de afinidade da pessoa (1º, 2º…), sem dizer quem é; o id do candidato só é
 * enviado se o servidor avisar que a contagem por candidato está ligada. Sem servidor
 * (protótipo, arquivo local), o voto não é enviado e só revela os nomes.
 */

export interface EstadoVotacao {
  coleta: boolean
  contaCandidato: boolean
  turnstileSiteKey: string | null
  /** true quando não há API (protótipo ou falha de rede). */
  offline: boolean
}

export type ResultadoVoto = 'contado' | 'ja_votou' | 'nao_enviado' | 'devagar' | 'desafio' | 'erro'

export const SEM_API: EstadoVotacao = { coleta: false, contaCandidato: false, turnstileSiteKey: null, offline: true }

export async function lerEstado(): Promise<EstadoVotacao> {
  try {
    const r = await fetch('/api/estado')
    if (!r.headers.get('content-type')?.includes('application/json')) return SEM_API
    const dados = (await r.json()) as Partial<EstadoVotacao>
    if (typeof dados.coleta !== 'boolean') return SEM_API
    return {
      coleta: dados.coleta,
      contaCandidato: dados.contaCandidato === true,
      turnstileSiteKey: dados.turnstileSiteKey ?? null,
      offline: false,
    }
  } catch {
    return SEM_API
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
  voto: { eleicao: string; posicao: number; candidato: string },
  token: string | null,
): Promise<ResultadoVoto> {
  if (!estado.coleta) return 'nao_enviado'
  if (jaVotou(voto.eleicao)) return 'ja_votou'
  const corpo = {
    eleicao: voto.eleicao,
    posicao: voto.posicao,
    ...(estado.contaCandidato ? { candidato: voto.candidato } : {}),
    ...(token ? { token } : {}),
  }
  try {
    const r = await fetch('/api/votos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    if (r.status === 204) {
      marcarVoto(voto.eleicao)
      return 'contado'
    }
    if (r.status === 429) return 'devagar'
    if (r.status === 403) return 'desafio'
    return 'erro'
  } catch {
    return 'erro'
  }
}

const MENSAGEM_VOTO: Record<ResultadoVoto, string> = {
  contado: 'Voto anotado sem o seu nome, só pra análise interna. Não divulgamos resultado.',
  ja_votou: 'Você já votou nesta eleição neste aparelho. Este voto não contou de novo.',
  nao_enviado: '',
  devagar: 'Muita gente votando da mesma internet agora. Este voto não entrou. Tente de novo daqui a 1 minuto.',
  desafio: 'Não deu pra confirmar que é uma pessoa votando. O voto não entrou.',
  erro: 'Não conseguimos registrar o voto agora.',
}

export function mensagemVoto(resultado: ResultadoVoto) {
  return MENSAGEM_VOTO[resultado]
}

/** O que é enviado, dito antes do voto, em linguagem simples. */
export function avisoVotacao(estado: EstadoVotacao) {
  if (estado.offline) return 'Nesta versão de teste, o voto não vai pra lugar nenhum. Ele só mostra os nomes.'
  if (!estado.coleta) return 'Seu voto não é enviado nem guardado. Ele só mostra os nomes.'
  if (estado.contaCandidato) {
    return 'Seu voto é anônimo e só pra uso interno. Somamos 1 ao candidato escolhido, sem guardar quem você é, de onde veio nem a hora. Não divulgamos resultado. Suas respostas não saem do aparelho.'
  }
  return 'Seu voto é anônimo e só pra uso interno. Guardamos só em que lugar da sua lista estava o candidato escolhido (1º, 2º…), sem o nome dele, pra saber se o teste ajuda. Não divulgamos resultado. Suas respostas não saem do aparelho.'
}
