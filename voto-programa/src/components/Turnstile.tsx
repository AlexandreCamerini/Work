import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opcoes: Record<string, unknown>) => string
      remove: (id: string) => void
    }
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Desafio anti-robô da Cloudflare, sem cookie de rastreamento. Só carrega com a votação aberta. */
export function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (token: string | null) => void }) {
  const alvo = useRef<HTMLDivElement>(null)
  const callback = useRef(onToken)
  useEffect(() => {
    callback.current = onToken
  }, [onToken])

  useEffect(() => {
    let widget: string | undefined
    let ativo = true
    const renderizar = () => {
      if (!ativo || !alvo.current || !window.turnstile) return
      widget = window.turnstile.render(alvo.current, {
        sitekey: siteKey,
        language: 'pt-br',
        callback: (t: string) => callback.current(t),
        'expired-callback': () => callback.current(null),
        'error-callback': () => callback.current(null),
      })
    }
    if (window.turnstile) {
      renderizar()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT
        script.async = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderizar)
    }
    return () => {
      ativo = false
      if (widget) window.turnstile?.remove(widget)
    }
  }, [siteKey])

  return <div ref={alvo} />
}
