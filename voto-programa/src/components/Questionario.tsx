import { useMemo, useState } from 'react'
import { eixos } from '../data/eixos'
import { perguntas } from '../data/perguntas'
import type { Importancia, Posicao, RespostaUsuario } from '../types'

const OPCOES_POSICAO: { valor: Posicao; label: string }[] = [
  { valor: -2, label: 'Discordo totalmente' },
  { valor: -1, label: 'Discordo' },
  { valor: 0, label: 'Neutro' },
  { valor: 1, label: 'Concordo' },
  { valor: 2, label: 'Concordo totalmente' },
]

const OPCOES_IMPORTANCIA: { valor: Importancia; label: string }[] = [
  { valor: 1, label: 'Pouco importante' },
  { valor: 2, label: 'Importante' },
  { valor: 3, label: 'Prioridade para mim' },
]

interface QuestionarioProps {
  onConcluir: (respostas: RespostaUsuario[]) => void
}

export function Questionario({ onConcluir }: QuestionarioProps) {
  const [respostas, setRespostas] = useState<Record<string, RespostaUsuario>>({})

  const perguntasPorEixo = useMemo(
    () => eixos.map((eixo) => ({ eixo, itens: perguntas.filter((p) => p.eixoId === eixo.id) })),
    [],
  )

  const totalRespondidas = Object.keys(respostas).length

  function definirPosicao(perguntaId: string, posicao: Posicao) {
    setRespostas((atual) => ({
      ...atual,
      [perguntaId]: { perguntaId, importancia: atual[perguntaId]?.importancia ?? 2, posicao },
    }))
  }

  function definirImportancia(perguntaId: string, importancia: Importancia) {
    setRespostas((atual) => {
      const existente = atual[perguntaId]
      if (!existente) return atual
      return { ...atual, [perguntaId]: { ...existente, importancia } }
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-[#f6f7fb]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {totalRespondidas} de {perguntas.length} respondidas
          </span>
          <span>{Math.round((totalRespondidas / perguntas.length) * 100)}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(totalRespondidas / perguntas.length) * 100}%` }}
          />
        </div>
      </div>

      {perguntasPorEixo.map(({ eixo, itens }) => (
        <section key={eixo.id} className="mb-10">
          <h2 className="text-xl font-bold text-brand-900">{eixo.nome}</h2>
          <p className="mt-1 text-sm text-slate-500">{eixo.descricao}</p>

          <div className="mt-4 space-y-6">
            {itens.map((pergunta) => {
              const resposta = respostas[pergunta.id]
              return (
                <div key={pergunta.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-medium text-slate-800">{pergunta.texto}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {OPCOES_POSICAO.map((opcao) => (
                      <button
                        key={opcao.valor}
                        type="button"
                        onClick={() => definirPosicao(pergunta.id, opcao.valor)}
                        className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                          resposta?.posicao === opcao.valor
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400'
                        }`}
                      >
                        {opcao.label}
                      </button>
                    ))}
                  </div>

                  {resposta && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Quão importante é esse tema para você?</span>
                      {OPCOES_IMPORTANCIA.map((opcao) => (
                        <button
                          key={opcao.valor}
                          type="button"
                          onClick={() => definirImportancia(pergunta.id, opcao.valor)}
                          className={`rounded-full border px-3 py-1 transition ${
                            resposta.importancia === opcao.valor
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-slate-300 text-slate-500 hover:border-brand-400'
                          }`}
                        >
                          {opcao.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div className="flex flex-col items-center gap-2 pb-10">
        {totalRespondidas === 0 && (
          <p className="text-sm text-slate-500">Responda pelo menos uma pergunta para ver o resultado.</p>
        )}
        <button
          type="button"
          disabled={totalRespondidas === 0}
          onClick={() => onConcluir(Object.values(respostas))}
          className="rounded-md bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Ver resultado ({totalRespondidas}/{perguntas.length})
        </button>
      </div>
    </div>
  )
}
