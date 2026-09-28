/** Regras de apresentação do resultado, puras e testáveis (sem React). */
import type { Aderencia, Pergunta, Resposta, Resultado } from '../types'

export function letra(i: number) {
  return String.fromCharCode(65 + i)
}

export function rotuloAsCegas(i: number) {
  return `Candidato ${letra(i)}`
}

/**
 * Baixa só a primeira letra, para a opção caber no meio da frase ("Todos propõem mais
 * Patrulha Maria da Penha"). Sigla no começo (SUS, BRT) fica como está.
 */
export function inicialMinuscula(texto: string) {
  const primeira = texto.split(/\s+/)[0] ?? ''
  if (primeira.length > 1 && primeira === primeira.toUpperCase() && /[A-ZÀ-Ý]/.test(primeira)) return texto
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

export function semPontoFinal(texto: string) {
  return texto.replace(/[.;]\s*$/, '')
}

export interface Consenso {
  pergunta: Pergunta
  /** Opções que todos os candidatos atendem (nota >= 70), já prontas para o meio da frase. */
  opcoes: string[]
}

/** Cenas marcadas como consenso que a pessoa respondeu: "Nisso eles concordam". */
export function consensos(perguntas: Pergunta[], respostas: Resposta[], aderencia: Aderencia): Consenso[] {
  const respondidas = new Set(respostas.map((r) => r.perguntaId))
  return perguntas
    .filter((p) => p.consenso && respondidas.has(p.id))
    .map((p) => ({
      pergunta: p,
      opcoes: p.opcoes
        .filter((o) => Object.values(aderencia.itens[p.id]?.[o.id] ?? {}).every((a) => (a.nota ?? 0) >= 70))
        .map((o) => inicialMinuscula(semPontoFinal(o.texto))),
    }))
    .filter((c) => c.opcoes.length > 0)
}

/** Os dois primeiros com menos de 5 pontos de diferença: dizemos que é empate. */
export function quaseEmpate(resultados: Resultado[]) {
  const [a, b] = resultados
  return !!a && !!b && a.afinidade !== null && b.afinidade !== null && a.afinidade - b.afinidade < 5
}

/** Texto do WhatsApp. Resultado com nomes só se a pessoa escolher incluir; o voto, nunca. */
export function textoCompartilhar(titulo: string, eleicao: string, endereco: string, resultados: Resultado[], comNomes: boolean) {
  const partes = comNomes ? resultados.filter((r) => r.afinidade !== null).map((r) => `${r.candidato.nome} ${r.afinidade}%`) : []
  const meu = partes.length ? `Meu resultado: ${partes.join(', ')}. ` : ''
  return `Fiz o teste "${titulo}" (${eleicao}). ${meu}Faz o seu: ${endereco}`
}
