import { lazy, Suspense, use, useEffect, useState } from 'react'
import { acompanhamentos, ehEleicao, manifesto, type ResumoAcompanhamento } from './data'
import { Carregando } from './ui/Carregando'
import { Falha } from './ui/Falha'

// o fluxo e a área "Prometeu, fez?" chegam só quando a pessoa abre
const Quiz = lazy(() => import('./telas/Quiz'))
const Acompanhamento = lazy(() => import('./components/Acompanhamento'))

function lerRota() {
  return window.location.hash.replace('#', '')
}

function ContagemPromessas({ a }: { a: ResumoAcompanhamento }) {
  const dados = use(a.carregar())
  return <>{dados.compromissos.length} promessas conferidas, com fonte</>
}

function Inicio() {
  useEffect(() => {
    document.title = 'Combina? · Eleições 2026'
  }, [])
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <p className="m-0">
        <picture>
          <source srcSet="/logo-horizontal-escuro.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo-horizontal.svg" alt="Combina?" width={178} height={40} />
        </picture>
      </p>
      <h1 className="m-0 font-display text-4xl leading-tight font-extrabold text-balance">Qual proposta combina com o seu dia a dia?</h1>
      <p className="m-0 text-lg leading-relaxed text-texto-suave">
        Escolha a eleição. Você diz o que faria em situações do dia a dia. A gente mostra qual candidato propõe o mesmo, com a
        fonte. Os nomes só aparecem no fim.
      </p>

      <nav className="flex flex-col gap-3" aria-label="Eleições">
        {manifesto.map((e) => (
          <a
            key={e.id}
            href={`#${e.id}`}
            className="rounded-3xl border-2 border-borda bg-superficie p-5 text-texto no-underline transition hover:border-primaria"
          >
            <span className="block font-display text-xl font-extrabold">{e.nome}</span>
            <span className="block text-sm text-texto-suave">
              {e.nCandidatos} candidatos no teste · 1º turno em {e.primeiroTurno}
            </span>
          </a>
        ))}
        {acompanhamentos.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            className="rounded-3xl border-2 border-destaque bg-destaque-suave p-5 text-texto no-underline transition hover:border-texto"
          >
            <span className="block text-xs font-bold tracking-wider uppercase">Prometeu, fez?</span>
            <span className="block font-display text-xl font-extrabold">{a.titulo}</span>
            <span className="block text-sm text-texto-suave">
              <Suspense fallback="Promessas conferidas, com fonte">
                <ContagemPromessas a={a} />
              </Suspense>
            </span>
          </a>
        ))}
      </nav>

      <p className="m-0 text-sm leading-relaxed text-texto-suave">
        Isto não é pesquisa eleitoral. Não dizemos em quem votar. Suas respostas não saem do seu celular ou computador.
      </p>
    </main>
  )
}

function AreaAcompanhamento({ a }: { a: ResumoAcompanhamento }) {
  const dados = use(a.carregar())
  return <Acompanhamento titulo={a.titulo} dados={dados} onVoltar={() => (window.location.hash = '')} />
}

function App() {
  const [rota, setRota] = useState(lerRota)

  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  if (ehEleicao(rota)) {
    return (
      <Suspense
        fallback={
          <div className="app">
            <Carregando />
          </div>
        }
      >
        <Quiz key={rota} id={rota} />
      </Suspense>
    )
  }

  const acomp = acompanhamentos.find((a) => a.id === rota)
  if (acomp) {
    return (
      <Falha>
        <Suspense fallback={<Carregando />}>
          <AreaAcompanhamento a={acomp} />
        </Suspense>
      </Falha>
    )
  }

  return <Inicio />
}

export default App
