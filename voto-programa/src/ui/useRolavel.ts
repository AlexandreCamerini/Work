import { useEffect, useLayoutEffect, type RefObject } from 'react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

/** Entra na ordem do Tab só quando rola e não há nada focável dentro para levar a rolagem. */
function ajustar(el: HTMLElement | null) {
  if (!el) return
  const rola = el.scrollHeight > el.clientHeight + 1
  const temFocavel = !!el.querySelector(FOCAVEIS)
  if (rola && !temFocavel) {
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0
  } else if (el.getAttribute('tabindex') === '0') {
    el.removeAttribute('tabindex')
  }
}

/**
 * Região que rola precisa ser alcançável pelo teclado (WCAG 2.1.1; axe
 * `scrollable-region-focusable`): ex.: a folha de detalhe às cegas, que não tem link, e a
 * revelação com 8 cartas antes de virarem botões. Confere a cada render e quando o tamanho muda.
 */
export function useRolavelFocavel(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    ajustar(ref.current)
  })
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => ajustar(el))
    ro.observe(el)
    for (const filho of el.children) ro.observe(filho)
    return () => ro.disconnect()
  }, [ref])
}
