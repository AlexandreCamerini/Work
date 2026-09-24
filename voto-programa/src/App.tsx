import { useEffect, useState } from 'react'
import { Acompanhamento } from './components/Acompanhamento'
import { Quiz } from './components/Quiz'
import { acompanhamentos, eleicoes } from './data'

function lerRota() {
  return window.location.hash.replace('#', '')
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

  const eleicao = eleicoes.find((e) => e.id === rota)
  if (eleicao) return <Quiz key={eleicao.id} eleicao={eleicao} />

  const acomp = acompanhamentos.find((a) => a.id === rota)
  if (acomp) return <Acompanhamento titulo={acomp.titulo} dados={acomp.dados} onVoltar={() => (window.location.hash = '')} />

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-12 pb-16">
      <h1 className="font-display text-4xl leading-tight font-extrabold text-balance sm:text-5xl">
        Qual proposta combina com o seu dia a dia?
      </h1>
      <p className="text-lg leading-relaxed text-tinta-suave">
        Escolha a eleição. Você responde situações da vida real e a gente compara com o que os
        candidatos propõem, com a fala de cada um e a fonte. Os nomes ficam escondidos até o fim.
      </p>

      <nav className="flex flex-col gap-3">
        {eleicoes.map((e) => (
          <a key={e.id} href={`#${e.id}`} className="rounded-3xl border-2 border-linha bg-white p-5 transition hover:border-mar">
            <p className="font-display text-xl font-extrabold">{e.quiz.eleicao}</p>
            <p className="text-sm text-tinta-suave">{e.candidatos.length} candidatos no teste · 1º turno em 4 de outubro</p>
          </a>
        ))}
        {acompanhamentos.map((a) => (
          <a key={a.id} href={`#${a.id}`} className="rounded-3xl border-2 border-sol bg-sol-claro p-5 transition hover:border-tinta">
            <p className="text-xs font-bold uppercase tracking-wider">Prometeu, fez?</p>
            <p className="font-display text-xl font-extrabold">{a.titulo}</p>
            <p className="text-sm text-tinta-suave">{a.dados.compromissos.length} compromissos acompanhados com evidência</p>
          </a>
        ))}
      </nav>

      <p className="text-xs leading-relaxed text-tinta-suave">
        Isto não é pesquisa eleitoral nem recomendação de voto. Suas respostas não saem do seu aparelho.
      </p>
    </main>
  )
}

export default App
