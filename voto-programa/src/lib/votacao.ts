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
  contado: 'Registrado de forma anônima, só para análise interna. Não divulgamos resultado de votação.',
  ja_votou: 'Você já tinha votado nesta eleição neste aparelho, então este voto não foi registrado de novo.',
  nao_enviado: '',
  devagar: 'Muitos votos saindo da mesma rede agora. Este não foi registrado; tente de novo em um minuto.',
  desafio: 'Não conseguimos confirmar que é uma pessoa votando, então o voto não foi registrado.',
  erro: 'Não conseguimos registrar o voto agora.',
}

export function mensagemVoto(resultado: ResultadoVoto) {
  return MENSAGEM_VOTO[resultado]
}

/** O que é enviado, dito antes do voto, em linguagem simples. */
export function avisoVotacao(estado: EstadoVotacao) {
  if (estado.offline) return 'Neste protótipo o voto não é enviado a lugar nenhum: ele só revela os nomes.'
  if (!estado.coleta) return 'Seu voto não é enviado nem guardado: ele só revela os nomes.'
  if (estado.contaCandidato) {
    return 'Anônimo e só para uso interno: somamos +1 ao candidato escolhido, sem guardar quem você é, de onde veio ou a hora. Nenhum resultado é divulgado, e suas respostas não saem do aparelho.'
  }
  return 'Anônimo e só para uso interno: guardamos apenas em que lugar do seu resultado estava o candidato escolhido (1º, 2º…), sem dizer quem é, para saber se o teste ajuda. Nenhum resultado é divulgado, e suas respostas não saem do aparelho.'
}
