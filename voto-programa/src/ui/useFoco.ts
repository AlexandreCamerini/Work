import { useEffect } from 'react'

/**
 * Ao montar uma tela, põe o foco no título dela (`data-foco`, com tabIndex -1), para o
 * leitor de tela saber que a tela mudou. `preventScroll`: o layout é fixo, nada deve pular.
 */
export function useFocoAoEntrar() {
  useEffect(() => {
    document.querySelector<HTMLElement>('#meio [data-foco]')?.focus({ preventScroll: true })
  }, [])
}

export function movimentoReduzido() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Espera respeitando o movimento reduzido (0 ms quando reduzido, salvo `sempre`). */
export function tempo(ms: number) {
  return movimentoReduzido() ? 0 : ms
}
