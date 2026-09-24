import type { Quiz } from '../types'

interface IntroProps {
  quiz: Quiz
  totalCenas: number
  onComecar: () => void
}

export function Intro({ quiz, totalCenas, onComecar }: IntroProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-12 pb-16">
      <p className="w-fit rounded-full bg-sol px-3 py-1 text-xs font-bold uppercase tracking-wider text-tinta">
        {quiz.eleicao} · 1º turno em 4 de outubro
      </p>
      <h1 className="font-display text-4xl leading-tight font-extrabold text-balance sm:text-5xl">
        {quiz.titulo}
      </h1>
      <p className="text-lg leading-relaxed text-tinta-suave">
        São {totalCenas} {quiz.descricao}. Você escolhe o que faria mais sentido, e a gente
        compara com o que os candidatos propõem, com a fala de cada um e o link da fonte.
      </p>

      <ul className="flex flex-wrap gap-2 text-sm font-semibold">
        <li className="rounded-full border border-linha bg-white px-3 py-1">Uns 3 minutos</li>
        <li className="rounded-full border border-linha bg-white px-3 py-1">Sem cadastro</li>
        <li className="rounded-full border border-linha bg-white px-3 py-1">Nada sai do seu celular</li>
        <li className="rounded-full border border-linha bg-white px-3 py-1">Candidatos escondidos até o fim</li>
      </ul>

      <button
        type="button"
        onClick={onComecar}
        className="rounded-2xl bg-mar px-6 py-4 font-display text-xl font-extrabold text-white shadow-[0_4px_0_var(--color-mar-escuro)] transition active:translate-y-1 active:shadow-none"
      >
        Bora começar
      </button>

      <p className="text-xs leading-relaxed text-tinta-suave">
        Isto não é pesquisa eleitoral nem recomendação de voto: mostra só o seu resultado,
        comparando as suas escolhas com propostas públicas dos candidatos.
      </p>
    </section>
  )
}
