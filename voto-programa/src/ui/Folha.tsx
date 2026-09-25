import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

interface FolhaProps {
  titulo: ReactNode
  onFechar: () => void
  children: ReactNode
  /** Botões do pé da folha. Sem eles, entra um "Fechar". */
  acoes?: ReactNode
  testid?: string
}

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

/**
 * Folha de baixo modal (<dialog>): foco no título ao abrir, Tab preso dentro, Esc ou toque no
 * véu fecham, e o foco volta para quem abriu. Sempre há um botão para fechar (WCAG 2.5.7).
 */
export function Folha({ titulo, onFechar, children, acoes, testid }: FolhaProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const fechar = useRef(onFechar)
  useEffect(() => {
    fechar.current = onFechar
  }, [onFechar])

  useLayoutEffect(() => {
    const d = ref.current
    const anterior = document.activeElement as HTMLElement | null
    if (d && !d.open && typeof d.showModal === 'function') d.showModal()
    tituloRef.current?.focus({ preventScroll: true })
    const aoCancelar = (e: Event) => {
      e.preventDefault()
      fechar.current()
    }
    d?.addEventListener('cancel', aoCancelar)
    return () => {
      d?.removeEventListener('cancel', aoCancelar)
      if (d?.open) d.close()
      if (anterior?.isConnected) anterior.focus({ preventScroll: true })
    }
  }, [])

  function prenderFoco(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      fechar.current()
      return
    }
    if (e.key !== 'Tab' || !ref.current) return
    const alvos = [...ref.current.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((el) => el.offsetParent !== null)
    if (!alvos.length) return
    const primeiro = alvos[0]
    const ultimo = alvos[alvos.length - 1]
    const ativo = document.activeElement
    if (e.shiftKey && (ativo === primeiro || ativo === tituloRef.current)) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && ativo === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  function tocarNoVeu(e: MouseEvent<HTMLDialogElement>) {
    if (e.target !== ref.current) return
    const r = ref.current.getBoundingClientRect()
    const fora = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    if (fora) fechar.current()
  }

  return (
    // o <dialog> já é interativo; o clique só serve para fechar pelo véu
    <dialog ref={ref} className="folha" aria-labelledby="folha-titulo" onKeyDown={prenderFoco} onClick={tocarNoVeu} data-testid={testid}>
      <div className="puxador" aria-hidden="true" />
      <h2 id="folha-titulo" ref={tituloRef} tabIndex={-1}>
        {titulo}
      </h2>
      <div className="corpo">{children}</div>
      <div className="acoes">
        {acoes ?? (
          <button type="button" className="btn btn-sec" onClick={() => fechar.current()}>
            Fechar
          </button>
        )}
      </div>
    </dialog>
  )
}
