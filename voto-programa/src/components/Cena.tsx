import { useMemo, useState } from 'react'
import { embaralhar } from '../lib/ordem'
import type { Pergunta, Tema } from '../types'

interface CenaProps {
  pergunta: Pergunta
  tema: Tema | undefined
  indice: number
  total: number
  onResponder: (opcaoId: string | null) => void
}

export function Cena({ pergunta, tema, indice, total, onResponder }: CenaProps) {
  const [escolha, setEscolha] = useState<string | null>(null)
  const ultima = indice === total - 1
  // ordem das opções sorteada por pessoa: a primeira da lista tende a ser mais escolhida
  const opcoes = useMemo(() => embaralhar(pergunta.opcoes), [pergunta])

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-5 px-4 pt-6 pb-16">
      <div className="flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-linha"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={indice + 1}
          aria-label="Progresso"
        >
          <div className="h-full rounded-full bg-mar transition-all" style={{ width: `${((indice + 1) / total) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-tinta-suave tabular-nums">
          {indice + 1}/{total}
        </span>
      </div>

      {tema && (
        <p className="w-fit rounded-full bg-mar-claro px-3 py-1 text-xs font-bold uppercase tracking-wider text-mar-escuro">
          {tema.nome}
        </p>
      )}

      <p className="font-display text-2xl leading-snug font-semibold text-balance">{pergunta.cena}</p>
      <h2 className="text-lg font-bold">{pergunta.pergunta}</h2>

      <div className="flex flex-col gap-3">
        {opcoes.map((opcao) => {
          const selecionada = escolha === opcao.id
          return (
            <button
              key={opcao.id}
              type="button"
              disabled={escolha !== null}
              onClick={() => setEscolha(opcao.id)}
              className={`rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold transition ${
                selecionada
                  ? 'border-mar bg-mar text-white'
                  : escolha !== null
                    ? 'border-linha bg-white text-tinta-suave opacity-60'
                    : 'border-linha bg-white text-tinta hover:border-mar'
              }`}
            >
              {opcao.texto}
            </button>
          )
        })}
      </div>

      {escolha === null ? (
        <button
          type="button"
          onClick={() => onResponder(null)}
          className="self-center text-sm font-semibold text-tinta-suave underline"
        >
          Nenhuma dessas / pular
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <aside className="rounded-2xl border-2 border-sol bg-sol-claro p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider">Você sabia?</p>
            <p className="mt-1 leading-relaxed">{pergunta.fato.texto}</p>
            <a href={pergunta.fato.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-mar-escuro underline">
              Fonte: {pergunta.fato.fonte}
            </a>
            {pergunta.consenso && (
              <p className="mt-3 text-sm font-semibold">
                Spoiler: aqui os candidatos propõem coisas bem parecidas.
              </p>
            )}
          </aside>
          <button
            type="button"
            onClick={() => onResponder(escolha)}
            className="rounded-2xl bg-mar px-6 py-4 font-display text-xl font-extrabold text-white shadow-[0_4px_0_var(--color-mar-escuro)] transition active:translate-y-1 active:shadow-none"
          >
            {ultima ? 'Ver meu resultado' : 'Próxima'}
          </button>
        </div>
      )}
    </section>
  )
}
