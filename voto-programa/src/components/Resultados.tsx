import { useState } from 'react'
import { outrosCandidatos } from '../data/candidatos'
import { RESPONSAVEL } from '../config'
import { COBERTURA_MINIMA } from '../lib/matching'
import type { Aderencia, Evidencias, Pergunta, Resposta, Resultado } from '../types'

interface ResultadosProps {
  resultados: Resultado[]
  respostas: Resposta[]
  perguntas: Pergunta[]
  aderencia: Aderencia
  evidencias: Evidencias
  onRefazer: () => void
}

function rotuloNota(nota: number) {
  if (nota >= 70) return { texto: 'Combina', cor: 'bg-folha text-white' }
  if (nota >= 40) return { texto: 'Combina em parte', cor: 'bg-sol text-tinta' }
  return { texto: 'Vai em outra direção', cor: 'bg-coral text-white' }
}

export function Resultados({ resultados, respostas, perguntas, aderencia, evidencias, onRefazer }: ResultadosProps) {
  const [revelados, setRevelados] = useState<string[]>([])
  const [copiado, setCopiado] = useState(false)
  const perguntaPorId = new Map(perguntas.map((p) => [p.id, p]))
  const consensos = perguntas.filter((p) => p.consenso && respostas.some((r) => r.perguntaId === p.id))

  const textoCompartilhar = (() => {
    const partes = resultados
      .filter((r) => revelados.includes(r.candidato.id) && r.afinidade !== null)
      .map((r) => `${r.candidato.nome} ${r.afinidade}%`)
    const meu = partes.length ? `Meu resultado: ${partes.join(', ')}. ` : ''
    return `Fiz o teste "Qual proposta combina com o seu dia a dia?" (governador RJ 2026). ${meu}Faz o seu: ${window.location.href}`
  })()

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoCompartilhar)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-10 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Seu resultado</h1>
        <p className="text-tinta-suave">
          Os nomes estão escondidos. Olhe primeiro o quanto as propostas combinam com as suas
          escolhas e só depois revele quem é quem.
        </p>
      </header>

      {resultados.map((resultado, i) => {
        const revelado = revelados.includes(resultado.candidato.id)
        const c = resultado.candidato
        return (
          <article key={c.id} className="overflow-hidden rounded-3xl border-2 border-linha bg-white">
            <div className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sol font-display text-2xl font-extrabold">
                {revelado ? c.numero : '?'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-extrabold">
                  {revelado ? c.nome : `Candidato ${String.fromCharCode(65 + i)}`}
                </p>
                <p className="text-sm text-tinta-suave">
                  {revelado ? `${c.partido} · vice: ${c.vice}` : `com base em ${resultado.cobertura} situações`}
                </p>
              </div>
              <p className="font-display text-4xl font-extrabold text-mar tabular-nums">
                {resultado.afinidade === null ? '—' : `${resultado.afinidade}%`}
              </p>
            </div>

            {resultado.afinidade !== null && (
              <div className="mx-5 mb-4 h-3 overflow-hidden rounded-full bg-linha">
                <div className="h-full rounded-full bg-mar" style={{ width: `${resultado.afinidade}%` }} />
              </div>
            )}
            {resultado.afinidade === null && (
              <p className="mx-5 mb-4 text-sm text-tinta-suave">
                Poucas situações com proposta deste candidato sobre os temas que você escolheu
                (mínimo de {COBERTURA_MINIMA}). Sem dado suficiente, sem percentual.
              </p>
            )}

            {!revelado ? (
              <button
                type="button"
                onClick={() => setRevelados((r) => [...r, c.id])}
                className="w-full border-t-2 border-linha bg-mar-claro px-5 py-4 font-display text-lg font-extrabold text-mar-escuro"
              >
                Revelar quem é
              </button>
            ) : (
              <div className="flex flex-col gap-4 border-t-2 border-linha p-5">
                {c.coligacao && <p className="text-sm text-tinta-suave">Coligação: {c.coligacao}</p>}
                <a href={c.planoGovernoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-mar-escuro underline">
                  Ler o plano de governo completo
                </a>

                <details className="group">
                  <summary className="cursor-pointer font-display text-lg font-extrabold">
                    Por que deu esse resultado ({resultado.motivos.length})
                  </summary>
                <ul className="mt-3 flex flex-col gap-4">
                  {resultado.motivos.map((m) => {
                    const p = perguntaPorId.get(m.perguntaId)
                    const opcao = p?.opcoes.find((o) => o.id === m.opcaoId)
                    const rotulo = rotuloNota(m.avaliacao.nota ?? 0)
                    return (
                      <li key={m.perguntaId} className="rounded-2xl bg-papel p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${rotulo.cor}`}>{rotulo.texto}</span>
                          <span className="text-sm font-semibold">Você: “{opcao?.texto}”</span>
                        </div>
                        <p className="mt-2 text-sm">{m.avaliacao.justificativa}</p>
                        {m.avaliacao.evidencias.map((eid) => {
                          const ev = evidencias[c.id]?.[eid]
                          if (!ev) return null
                          return (
                            <blockquote key={eid} className="mt-2 border-l-4 border-sol pl-3 text-sm italic text-tinta-suave">
                              “{ev.trecho}”{' '}
                              <a href={ev.fonte.url} target="_blank" rel="noreferrer" className="not-italic font-semibold text-mar-escuro underline">
                                {ev.fonte.veiculo}
                                {ev.fonte.data ? `, ${ev.fonte.data.split('-').reverse().join('/')}` : ''}
                              </a>
                            </blockquote>
                          )
                        })}
                      </li>
                    )
                  })}
                </ul>
                </details>
                {respostas.length > resultado.motivos.length && (
                  <p className="text-sm text-tinta-suave">
                    Em {respostas.length - resultado.motivos.length} das suas escolhas não achamos proposta
                    deste candidato sobre o assunto, então elas não contaram nem a favor nem contra.
                  </p>
                )}
              </div>
            )}
          </article>
        )
      })}

      {consensos.length > 0 && (
        <aside className="rounded-3xl border-2 border-folha bg-white p-5">
          <h2 className="font-display text-lg font-extrabold">Nisso os dois concordam</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {consensos.map((p) => (
              <li key={p.id}>
                {p.pergunta} Os dois propõem{' '}
                {p.opcoes
                  .filter((o) => Object.values(aderencia.itens[p.id]?.[o.id] ?? {}).every((a) => (a.nota ?? 0) >= 70))
                  .map((o) => o.texto.replace(/\.$/, '').toLowerCase())
                  .join('; ')}
                .
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="flex flex-col gap-3 rounded-3xl bg-mar p-5 text-white">
        <p className="font-display text-lg font-extrabold">Manda pra galera</p>
        <p className="text-sm opacity-90">
          {revelados.length ? 'Seu resultado vai junto na mensagem.' : 'Revele os candidatos se quiser que seu resultado vá na mensagem.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(textoCompartilhar)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-sol px-5 py-3 font-bold text-tinta"
          >
            Compartilhar no WhatsApp
          </a>
          <button type="button" onClick={copiar} className="rounded-2xl border-2 border-white px-5 py-3 font-bold">
            {copiado ? 'Copiado!' : 'Copiar texto'}
          </button>
        </div>
      </div>

      <button type="button" onClick={onRefazer} className="self-center text-sm font-semibold text-tinta-suave underline">
        Refazer o teste
      </button>

      <details className="rounded-2xl border border-linha bg-white p-4 text-sm leading-relaxed text-tinta-suave">
        <summary className="cursor-pointer font-bold text-tinta">Como funciona e o que ficou de fora</summary>
        <div className="mt-3 flex flex-col gap-2">
          <p>
            Cada opção foi comparada com as propostas públicas de cada candidato (plano de governo,
            sabatinas e entrevistas), sempre com o trecho e a fonte. A nota de cada combinação é
            uma tabela fixa, igual para todo mundo; nenhuma IA calcula nada na hora em que você
            responde, e suas respostas não saem do seu aparelho.
          </p>
          <p>
            Quando um candidato não tem proposta sobre o assunto, a escolha não conta nem a favor
            nem contra. Temas prioritários valem em dobro.
          </p>
          <p>
            Este piloto cobre os dois candidatos com maior intenção de voto. Também concorrem:{' '}
            {outrosCandidatos.join(', ')}.
          </p>
          <p>
            Isto não é pesquisa eleitoral: não guardamos nem divulgamos respostas de ninguém.
            Tabela de notas gerada em {aderencia.gerado_em}.
          </p>
          <p>Responsável pelo site: {RESPONSAVEL || '(a definir antes da publicação)'}</p>
        </div>
      </details>
    </section>
  )
}
