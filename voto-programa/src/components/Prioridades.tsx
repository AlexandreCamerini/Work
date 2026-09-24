import { useState } from 'react'
import type { Tema } from '../types'

const MAXIMO = 3

interface PrioridadesProps {
  temas: Tema[]
  onContinuar: (prioridades: string[]) => void
}

export function Prioridades({ temas, onContinuar }: PrioridadesProps) {
  const [escolhidos, setEscolhidos] = useState<string[]>([])

  function alternar(id: string) {
    setEscolhidos((atual) =>
      atual.includes(id)
        ? atual.filter((t) => t !== id)
        : atual.length < MAXIMO
          ? [...atual, id]
          : atual,
    )
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-12 pb-16">
      <h1 className="font-display text-3xl leading-tight font-extrabold text-balance">
        O que mais pesa no seu dia?
      </h1>
      <p className="text-tinta-suave">
        Marque até {MAXIMO}. Esses temas contam em dobro no seu resultado.
      </p>

      <div className="flex flex-wrap gap-3">
        {temas.map((tema) => {
          const ativo = escolhidos.includes(tema.id)
          return (
            <button
              key={tema.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => alternar(tema.id)}
              className={`rounded-2xl border-2 px-4 py-3 text-base font-bold transition ${
                ativo
                  ? 'border-mar bg-mar text-white'
                  : 'border-linha bg-white text-tinta hover:border-mar'
              }`}
            >
              {tema.nome}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onContinuar([])}
          className="text-sm font-semibold text-tinta-suave underline"
        >
          Pular
        </button>
        <button
          type="button"
          onClick={() => onContinuar(escolhidos)}
          className="rounded-2xl bg-mar px-6 py-3 font-display text-lg font-extrabold text-white shadow-[0_4px_0_var(--color-mar-escuro)] transition active:translate-y-1 active:shadow-none"
        >
          Continuar
        </button>
      </div>
    </section>
  )
}
