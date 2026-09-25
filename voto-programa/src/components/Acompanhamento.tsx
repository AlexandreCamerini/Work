import { useState } from 'react'
import type { Acompanhamento as Dados, StatusCompromisso } from '../types'

const ROTULO_STATUS: Record<StatusCompromisso, { texto: string; cor: string }> = {
  cumprida: { texto: 'Cumprida', cor: 'bg-primaria text-sobre-primaria' },
  parcial: { texto: 'Em parte', cor: 'bg-destaque text-sobre-destaque' },
  em_andamento: { texto: 'Em andamento', cor: 'bg-primaria-suave text-texto' },
  nao_cumprida: { texto: 'Não cumprida', cor: 'bg-texto-suave text-fundo' },
  na_contramao: { texto: 'Fez o contrário', cor: 'bg-erro text-sobre-erro' },
  sem_informacao: { texto: 'Sem informação', cor: 'bg-linha text-texto' },
}

const ORDEM: StatusCompromisso[] = ['cumprida', 'parcial', 'em_andamento', 'nao_cumprida', 'na_contramao', 'sem_informacao']

function formatarData(d: string | null) {
  return d ? d.split('-').reverse().join('/') : ''
}

interface AcompanhamentoProps {
  titulo: string
  dados: Dados
  onVoltar: () => void
}

export default function Acompanhamento({ titulo, dados, onVoltar }: AcompanhamentoProps) {
  const [filtro, setFiltro] = useState<StatusCompromisso | null>(null)
  const contagem = ORDEM.map((s) => ({ status: s, n: dados.compromissos.filter((c) => c.status === s).length })).filter(
    (x) => x.n > 0,
  )
  const lista = filtro ? dados.compromissos.filter((c) => c.status === filtro) : dados.compromissos
  const total = dados.compromissos.length

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-8 pb-16">
      <button type="button" onClick={onVoltar} className="w-fit text-sm font-semibold text-texto-suave underline">
        Voltar
      </button>
      <header className="flex flex-col gap-2">
        <p className="w-fit rounded-full bg-destaque text-sobre-destaque px-3 py-1 text-xs font-bold uppercase tracking-wider">Prometeu, fez?</p>
        <h1 className="font-display text-3xl leading-tight font-extrabold text-balance">{titulo}</h1>
        <p className="text-texto-suave">
          {total} promessas de {dados.plano.titulo}, conferidas com o que foi feito no mandato ({dados.mandato}).
          Atualizado em {formatarData(dados.atualizado_em)}.
        </p>
      </header>

      <div className="flex h-4 overflow-hidden rounded-full" role="img" aria-label="Distribuição por status">
        {contagem.map(({ status, n }) => (
          <div key={status} className={ROTULO_STATUS[status].cor} style={{ width: `${(n / total) * 100}%` }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filtro === null}
          onClick={() => setFiltro(null)}
          className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${filtro === null ? 'border-texto bg-texto text-fundo' : 'border-borda bg-superficie'}`}
        >
          Todos ({total})
        </button>
        {contagem.map(({ status, n }) => (
          <button
            key={status}
            type="button"
            aria-pressed={filtro === status}
            onClick={() => setFiltro(filtro === status ? null : status)}
            className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${
              filtro === status ? 'border-texto' : 'border-transparent'
            } ${ROTULO_STATUS[status].cor}`}
          >
            {ROTULO_STATUS[status].texto} ({n})
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-4">
        {lista.map((c) => (
          <li key={c.id} className="rounded-3xl border-2 border-borda bg-superficie p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ROTULO_STATUS[c.status].cor}`}>
                {ROTULO_STATUS[c.status].texto}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-texto-suave">{c.tema}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-extrabold">{c.compromisso}</h2>
            <blockquote className="mt-2 border-l-4 border-destaque pl-3 text-sm italic text-texto-suave">
              “{c.trecho_promessa}”{' '}
              <a href={c.fonte_promessa.url} target="_blank" rel="noreferrer" className="not-italic font-semibold text-primaria-forte underline">
                {c.fonte_promessa.veiculo}
              </a>
            </blockquote>
            <p className="mt-3 text-sm">{c.explicacao}</p>
            {c.evidencias.length > 0 && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer font-semibold text-primaria-forte">Ver fontes ({c.evidencias.length})</summary>
                <ul className="mt-2 flex flex-col gap-2">
                  {c.evidencias.map((e) => (
                    <li key={e.url} className="text-texto-suave">
                      “{e.trecho}”{' '}
                      <a href={e.url} target="_blank" rel="noreferrer" className="font-semibold text-primaria-forte underline">
                        {e.veiculo}
                        {e.data ? `, ${formatarData(e.data)}` : ''}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>

      <details className="rounded-2xl border border-borda bg-superficie p-4 text-sm leading-relaxed text-texto-suave">
        <summary className="cursor-pointer font-bold text-texto">Como avaliamos</summary>
        <p className="mt-2">{dados.metodologia}</p>
        <p className="mt-2">
          A mesma régua vale para qualquer governante: quem vencer em 2026 passa a ser acompanhado a
          partir da posse. Olhamos só se fez o que prometeu, não se a ideia é boa ou ruim.{' '}
          <a href={dados.plano.url} target="_blank" rel="noreferrer" className="font-semibold text-primaria-forte underline">
            Ler o plano original
          </a>
          .
        </p>
      </details>
    </section>
  )
}
