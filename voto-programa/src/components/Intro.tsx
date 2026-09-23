interface IntroProps {
  onIniciar: () => void
}

export function Intro({ onIniciar }: IntroProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">Voto por Programa</h1>
      <p className="mt-4 text-lg text-slate-600">
        Responda a algumas perguntas sobre temas de governo e veja qual candidato mais se
        aproxima das suas posições — não da imagem ou do marketing de campanha.
      </p>

      <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-900">
        <p className="font-semibold">Antes de começar</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Esta ferramenta mede afinidade de propostas, não faz recomendação de voto.</li>
          <li>
            No resultado, os candidatos ficam ocultos até você decidir revelar cada um — a
            comparação é pelo programa, não pelo nome, número ou partido.
          </li>
          <li>Toda posição de candidato revelada tem link para a fonte pública original.</li>
          <li>Nenhuma resposta é enviada a um servidor: o cálculo acontece no seu navegador.</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onIniciar}
        className="mt-8 rounded-md bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        Começar
      </button>
    </div>
  )
}
