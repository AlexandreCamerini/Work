import { useState } from 'react'
import { eixos } from '../data/eixos'
import { perguntas } from '../data/perguntas'
import type { CandidatoResultado, RespostaUsuario } from '../types'

interface ResultadosProps {
  ranking: CandidatoResultado[]
  respostas: RespostaUsuario[]
  onRefazer: () => void
}

const nomeEixo = new Map(eixos.map((e) => [e.id, e.nome]))
const textoPergunta = new Map(perguntas.map((p) => [p.id, p.texto]))

export function Resultados({ ranking, respostas, onRefazer }: ResultadosProps) {
  const respostaPorPergunta = new Map(respostas.map((r) => [r.perguntaId, r]))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">Seu resultado</h1>
        <button
          type="button"
          onClick={onRefazer}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-400"
        >
          Refazer questionário
        </button>
      </div>

      <div className="space-y-4">
        {ranking.map((resultado, indice) => (
          <CandidatoCard
            key={resultado.candidato.id}
            resultado={resultado}
            posicao={indice + 1}
            respostaPorPergunta={respostaPorPergunta}
          />
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        Afinidade calculada apenas entre as perguntas que você respondeu e as posições
        cadastradas de cada candidato. Isto não é uma recomendação de voto.
      </p>
    </div>
  )
}

function CandidatoCard({
  resultado,
  posicao,
  respostaPorPergunta,
}: {
  resultado: CandidatoResultado
  posicao: number
  respostaPorPergunta: Map<string, RespostaUsuario>
}) {
  const [aberto, setAberto] = useState(false)
  const { candidato, afinidadeGeral, perguntasComparadas } = resultado

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
          {posicao}
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-slate-800">
            {candidato.nome} <span className="font-normal text-slate-400">· {candidato.numero}</span>
          </span>
          <span className="block text-sm text-slate-500">{candidato.partido}</span>
        </span>
        <span className="text-2xl font-bold text-brand-600">{afinidadeGeral}%</span>
      </button>

      {aberto && (
        <div className="border-t border-slate-100 p-4">
          <p className="text-xs text-slate-500">
            Baseado em {perguntasComparadas} pergunta(s) respondida(s) com posição cadastrada para
            este candidato.{' '}
            <a
              href={candidato.planoGovernoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline"
            >
              Ver plano de governo completo
            </a>
          </p>

          <div className="mt-3 space-y-2">
            {resultado.porEixo.map((eixoScore) => (
              <div key={eixoScore.eixoId} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{nomeEixo.get(eixoScore.eixoId)}</span>
                <span className="font-medium text-slate-800">{eixoScore.afinidade}%</span>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-brand-600">
              Ver posição pergunta a pergunta
            </summary>
            <ul className="mt-2 space-y-2 text-sm">
              {candidato.posicoes
                .filter((p) => respostaPorPergunta.has(p.perguntaId))
                .map((p) => (
                  <li key={p.perguntaId} className="border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
                    <p className="text-slate-700">{textoPergunta.get(p.perguntaId)}</p>
                    <a
                      href={p.fonteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-600 underline"
                    >
                      Fonte da posição do candidato
                    </a>
                  </li>
                ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  )
}
