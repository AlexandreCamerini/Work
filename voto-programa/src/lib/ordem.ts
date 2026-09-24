/** Gerador aleatório injetável, para os testes serem determinísticos. */
export type Sorteio = () => number

export function embaralhar<T>(itens: readonly T[], sorteio: Sorteio = Math.random): T[] {
  const saida = [...itens]
  for (let i = saida.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1))
    ;[saida[i], saida[j]] = [saida[j], saida[i]]
  }
  return saida
}

/**
 * Ordem aleatória em que dois itens seguidos nunca têm o mesmo tema, quando isso é
 * possível. A cada passo, sorteia entre os temas diferentes do anterior e dá preferência
 * ao tema com mais itens sobrando, para não sobrar um tema só no fim.
 */
export function misturarTemas<T extends { tema: string }>(itens: readonly T[], sorteio: Sorteio = Math.random): T[] {
  const porTema = new Map<string, T[]>()
  for (const item of embaralhar(itens, sorteio)) {
    porTema.set(item.tema, [...(porTema.get(item.tema) ?? []), item])
  }
  const saida: T[] = []
  let anterior: string | null = null
  while (saida.length < itens.length) {
    const disponiveis = [...porTema].filter(([tema, resto]) => resto.length > 0 && tema !== anterior)
    const candidatos = disponiveis.length ? disponiveis : [...porTema].filter(([, resto]) => resto.length > 0)
    const restantes = itens.length - saida.length
    // tema que ocupa mais da metade do que sobra precisa sair agora, senão se repete no fim
    const urgentes = candidatos.filter(([, resto]) => resto.length > (restantes - 1) / 2)
    const opcoes = urgentes.length ? urgentes : candidatos
    const [tema, resto] = opcoes[Math.floor(sorteio() * opcoes.length)]
    saida.push(resto.shift() as T)
    anterior = tema
  }
  return saida
}
