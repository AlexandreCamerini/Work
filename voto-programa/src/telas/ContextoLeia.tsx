import { useEffect, useState } from 'react'
import { carregarContextos, type IdEleicao } from '../data'
import type { Contexto } from '../types'

const dataCurta = (iso: string) => iso.split('-').reverse().join('/')

/**
 * Texto longo do "Leia", abaixo do fato curto. Chega sob demanda (só quem abre a folha baixa);
 * se falhar, a folha segue só com o fato, sem mensagem de erro no meio da leitura.
 */
export function ContextoLeia({ eleicao, perguntaId }: { eleicao: IdEleicao; perguntaId: string }) {
  const [ctx, setCtx] = useState<Contexto | null | undefined>(undefined)

  useEffect(() => {
    let vivo = true
    carregarContextos(eleicao)
      .then((c) => vivo && setCtx(c[perguntaId] ?? null))
      .catch(() => vivo && setCtx(null))
    return () => {
      vivo = false
    }
  }, [eleicao, perguntaId])

  if (ctx === undefined) return <p className="mt-3 mb-0 text-sm opacity-70" aria-busy="true">Carregando mais contexto…</p>
  if (ctx === null) return null

  return (
    <section className="mt-4" aria-label="Entenda o assunto" data-testid="contexto-leia">
      <h3 className="m-0 mb-2 text-base font-bold">Entenda o assunto</h3>
      {ctx.paragrafos.map((p, i) => (
        <p key={i} className="m-0 mb-3">
          {p}
        </p>
      ))}
      <h4 className="m-0 mb-1 text-sm font-bold">Fontes</h4>
      <ul className="m-0 mb-1 list-none p-0 text-sm">
        {ctx.fontes.map((f) => (
          <li key={f.url}>
            <a className="inline-flex min-h-11 items-center" href={f.url} target="_blank" rel="noreferrer">
              {f.veiculo}, {dataCurta(f.data)}: {f.titulo}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
