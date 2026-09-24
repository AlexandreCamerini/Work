import { useEffect, useState } from 'react'
import { RESPONSAVEL } from '../config'
import { COBERTURA_MINIMA, encaixesDoCandidato, type Encaixe, type ItemEncaixe } from '../lib/matching'
import { lerEstado, mensagemVoto, type EstadoVotacao, type ResultadoVoto } from '../lib/votacao'
import type { Eleicao, Evidencias, Pergunta, Resposta, Resultado } from '../types'
import { EscolhaVoto, PlacarAnonimo } from './Votacao'

interface ResultadosProps {
  eleicao: Eleicao
  resultados: Resultado[]
  respostas: Resposta[]
  perguntas: Pergunta[]
  onRefazer: () => void
}

const ESTADO_INICIAL: EstadoVotacao = { aberta: false, abreEm: null, turnstileSiteKey: null, offline: true }

const GRUPOS: { encaixe: Exclude<Encaixe, 'sem_proposta'>; titulo: string; marca: string; cor: string }[] = [
  { encaixe: 'atende', titulo: 'Atende', marca: '✓', cor: 'bg-folha text-white' },
  { encaixe: 'em_parte', titulo: 'Atende em parte', marca: '~', cor: 'bg-sol text-tinta' },
  { encaixe: 'nao_atende', titulo: 'Não atende', marca: '✗', cor: 'bg-coral text-white' },
]

function rotuloAsCegas(i: number) {
  return `Candidato ${String.fromCharCode(65 + i)}`
}

function ItemDaLista({ item, revelado, evidencias, candidatoId }: { item: ItemEncaixe; revelado: boolean; evidencias: Evidencias; candidatoId: string }) {
  const opcao = item.pergunta.opcoes.find((o) => o.id === item.opcaoId)
  const texto = <span>{opcao?.texto}</span>
  // antes do voto, a justificativa e a fonte ficam escondidas: citação e nome do veículo entregariam quem é
  if (!revelado || !item.avaliacao) return <li className="text-sm leading-snug">{texto}</li>
  return (
    <li className="text-sm leading-snug">
      <details>
        <summary className="cursor-pointer">{texto}</summary>
        <p className="mt-1 text-tinta-suave">{item.avaliacao.justificativa}</p>
        {item.avaliacao.evidencias.map((eid) => {
          const ev = evidencias[candidatoId]?.[eid]
          if (!ev) return null
          return (
            <blockquote key={eid} className="mt-2 border-l-4 border-sol pl-3 italic text-tinta-suave">
              “{ev.trecho}”{' '}
              <a href={ev.fonte.url} target="_blank" rel="noreferrer" className="not-italic font-semibold text-mar-escuro underline">
                {ev.fonte.veiculo}
                {ev.fonte.data ? `, ${ev.fonte.data.split('-').reverse().join('/')}` : ''}
              </a>
            </blockquote>
          )
        })}
      </details>
    </li>
  )
}

export function Resultados({ eleicao, resultados, respostas, perguntas, onRefazer }: ResultadosProps) {
  const { aderencia, evidencias } = eleicao
  const [estado, setEstado] = useState<EstadoVotacao>(ESTADO_INICIAL)
  const [revelado, setRevelado] = useState(false)
  const [voto, setVoto] = useState<{ candidatoId: string | null; resultado: ResultadoVoto } | null>(null)
  const [copiado, setCopiado] = useState(false)
  const consensos = perguntas.filter((p) => p.consenso && respostas.some((r) => r.perguntaId === p.id))
  const rotulos = new Map(resultados.map((r, i) => [r.candidato.id, rotuloAsCegas(i)]))

  useEffect(() => {
    let ativo = true
    lerEstado().then((e) => ativo && setEstado(e))
    return () => {
      ativo = false
    }
  }, [])

  const textoCompartilhar = (() => {
    const partes = revelado
      ? resultados.filter((r) => r.afinidade !== null).map((r) => `${r.candidato.nome} ${r.afinidade}%`)
      : []
    const meu = partes.length ? `Meu resultado: ${partes.join(', ')}. ` : ''
    return `Fiz o teste "${eleicao.quiz.titulo}" (${eleicao.quiz.eleicao}). ${meu}Faz o seu: ${window.location.href}`
  })()

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoCompartilhar)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const votado = voto?.candidatoId ? resultados.find((r) => r.candidato.id === voto.candidatoId)?.candidato : undefined

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-10 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">{revelado ? 'Quem é quem' : 'Seu resultado'}</h1>
        <p className="text-tinta-suave">
          {revelado
            ? 'Toque em cada item para ver a proposta do candidato, com o trecho e a fonte.'
            : 'O que cada candidato atende e o que não atende nas suas escolhas. Os nomes só aparecem depois que você votar.'}
        </p>
      </header>

      {revelado && voto && (
        <div className="rounded-3xl bg-mar p-5 text-white">
          {votado ? (
            <p className="font-display text-xl font-extrabold">
              Você votou no {rotulos.get(votado.id)}: {votado.nome} ({votado.partido}, {votado.numero})
            </p>
          ) : (
            <p className="font-display text-xl font-extrabold">Você preferiu não votar.</p>
          )}
          {mensagemVoto(voto.resultado) && <p className="mt-1 text-sm opacity-90">{mensagemVoto(voto.resultado)}</p>}
        </div>
      )}

      {resultados.map((resultado, i) => {
        const c = resultado.candidato
        const encaixes = encaixesDoCandidato(c.id, perguntas, aderencia, respostas)
        return (
          <article key={c.id} className="overflow-hidden rounded-3xl border-2 border-linha bg-white">
            <div className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sol font-display text-2xl font-extrabold">
                {revelado ? c.numero : String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-extrabold">{revelado ? c.nome : rotuloAsCegas(i)}</p>
                <p className="text-sm text-tinta-suave">
                  {revelado ? `${c.partido}${c.vice ? ` · vice: ${c.vice}` : ''}` : `com base em ${resultado.cobertura} situações`}
                </p>
              </div>
              <p className="font-display text-4xl font-extrabold text-mar tabular-nums">
                {resultado.afinidade === null ? '—' : `${resultado.afinidade}%`}
              </p>
            </div>

            {resultado.afinidade !== null ? (
              <div className="mx-5 mb-4 h-3 overflow-hidden rounded-full bg-linha">
                <div className="h-full rounded-full bg-mar" style={{ width: `${resultado.afinidade}%` }} />
              </div>
            ) : (
              <p className="mx-5 mb-4 text-sm text-tinta-suave">
                Poucas situações com proposta deste candidato (mínimo de {COBERTURA_MINIMA}). Sem dado
                suficiente, sem percentual.
              </p>
            )}

            <details open={i < 3} className="border-t-2 border-linha px-5 py-4">
              <summary className="cursor-pointer font-display font-extrabold">
                O que atende e o que não atende ({encaixes.atende.length} ✓ · {encaixes.nao_atende.length} ✗)
              </summary>
              <div className="mt-3 flex flex-col gap-4">
                {GRUPOS.filter((g) => encaixes[g.encaixe].length > 0).map((g) => (
                  <div key={g.encaixe}>
                    <p className="mb-1 flex items-center gap-2 text-sm font-bold">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${g.cor}`} aria-hidden>
                        {g.marca}
                      </span>
                      {g.titulo}
                    </p>
                    <ul className="ml-7 flex list-disc flex-col gap-1">
                      {encaixes[g.encaixe].map((item) => (
                        <ItemDaLista key={item.pergunta.id} item={item} revelado={revelado} evidencias={evidencias} candidatoId={c.id} />
                      ))}
                    </ul>
                  </div>
                ))}
                {encaixes.sem_proposta.length > 0 && (
                  <p className="text-sm text-tinta-suave">
                    Sem proposta sobre {encaixes.sem_proposta.length === 1 ? '1 das suas escolhas' : `${encaixes.sem_proposta.length} das suas escolhas`}:
                    não conta nem a favor nem contra.
                  </p>
                )}
                {revelado && (
                  <a href={c.planoGovernoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-mar-escuro underline">
                    Ler o plano de governo completo
                  </a>
                )}
              </div>
            </details>
          </article>
        )
      })}

      {!revelado ? (
        <EscolhaVoto
          eleicaoId={eleicao.id}
          opcoes={resultados.map((r, i) => ({ candidato: r.candidato, rotulo: rotuloAsCegas(i) }))}
          estado={estado}
          onVotou={(candidatoId, resultado) => {
            setVoto({ candidatoId, resultado })
            setRevelado(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      ) : (
        <PlacarAnonimo eleicaoId={eleicao.id} candidatos={eleicao.candidatos} estado={estado} />
      )}

      {consensos.length > 0 && (
        <aside className="rounded-3xl border-2 border-folha bg-white p-5">
          <h2 className="font-display text-lg font-extrabold">Nisso eles concordam</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {consensos.map((p) => (
              <li key={p.id}>
                {p.pergunta} Todos propõem{' '}
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
          {revelado ? 'Seu resultado vai junto na mensagem; seu voto, não.' : 'Só o convite vai na mensagem.'}
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

      <details className="rounded-3xl border-2 border-linha bg-white p-5 text-sm">
        <summary className="cursor-pointer font-display text-base font-extrabold">Como calculamos</summary>
        <div className="mt-3 flex flex-col gap-3 leading-relaxed text-tinta-suave">
          <p>
            Cada opção foi comparada com as propostas públicas de cada candidato (plano de governo,
            sabatinas e entrevistas), sempre com o trecho e a fonte. A nota de cada combinação é
            uma tabela fixa, igual para todo mundo; nenhuma IA calcula nada na hora em que você
            responde, e suas respostas não saem do seu aparelho.
          </p>
          <p>
            “Atende” quer dizer que o candidato propõe o que você escolheu; “não atende”, que ele vai
            em outra direção. O percentual conta o quanto ele prefere a sua escolha às outras da
            mesma situação: quem apoia todas as opções igualmente fica no meio. Quando um candidato
            não tem proposta sobre o assunto, a escolha não conta nem a favor nem contra. Temas
            prioritários valem em dobro.
          </p>
          <p>
            {eleicao.foraDoQuiz.nomes.length > 0 && (
              <>
                Fora deste teste ({eleicao.foraDoQuiz.motivo}): {eleicao.foraDoQuiz.nomes.join(', ')}.
              </>
            )}
          </p>
          <p>
            Isto não é pesquisa eleitoral. O voto é anônimo: guardamos só um contador por candidato,
            sem nenhum dado de quem votou. Tabela de notas gerada em {aderencia.gerado_em}.
          </p>
          <p>Responsável pelo site: {RESPONSAVEL || '(a definir antes da publicação)'}</p>
        </div>
      </details>
    </section>
  )
}
