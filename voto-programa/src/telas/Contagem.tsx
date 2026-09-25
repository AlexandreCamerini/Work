import { useLayoutEffect, useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { movimentoReduzido } from '../ui/useFoco'

/** 3-2-1 em 2,4 s (abaixo dos 5 s de WCAG 2.2.2). Com movimento reduzido, vai direto. */
export function Contagem() {
  const { enviar, anunciar } = useFluxoCtx()
  const [numero, setNumero] = useState(3)

  // layout effect: com movimento reduzido, avança antes da 1ª pintura (sem piscar a tela escura);
  // com useEffect, depois do voto (que espera o fetch) a contagem chegava a aparecer por um quadro
  useLayoutEffect(() => {
    anunciar('Revelando os nomes.')
    if (movimentoReduzido()) {
      enviar({ tipo: 'avancar' })
      return
    }
    const timers = [
      window.setTimeout(() => setNumero(2), 800),
      window.setTimeout(() => setNumero(1), 1600),
      window.setTimeout(() => enviar({ tipo: 'avancar' }), 2400),
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [enviar, anunciar])

  return (
    <div className="tela" style={{ gridTemplateRows: 'minmax(0,1fr)' }}>
      <main id="meio" className="contagem" data-etapa="contagem">
        <div>
          <h1 className="rotulo m-0 mb-2 text-sm">Revelando em</h1>
          <p key={numero} className="num m-0" aria-hidden="true">
            {numero}
          </p>
        </div>
      </main>
    </div>
  )
}
