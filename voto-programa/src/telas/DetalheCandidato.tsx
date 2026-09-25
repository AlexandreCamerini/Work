import { Suspense, use } from 'react'
import { carregarEvidencias } from '../data'
import { useFluxoCtx } from '../fluxo/contexto'
import { rotuloAsCegas } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { COBERTURA_MINIMA, encaixesDoCandidato, type Encaixe, type ItemEncaixe } from '../lib/matching'
import type { Resultado } from '../types'
import { Folha } from '../ui/Folha'

const GRUPOS: { encaixe: Exclude<Encaixe, 'sem_proposta'>; titulo: string; marca: string; classe: string }[] = [
  { encaixe: 'atende', titulo: 'Propõe isso', marca: '✓', classe: 'bola-atende' },
  { encaixe: 'em_parte', titulo: 'Propõe em parte', marca: '~', classe: 'bola-parte' },
  { encaixe: 'nao_atende', titulo: 'Vai em outra direção', marca: '✗', classe: 'bola-nao' },
]

interface Props {
  resultado: Resultado
  indice: number
  /** Depois do voto: nome, justificativa, trecho e fonte. Antes: nada que entregue quem é. */
  revelado: boolean
  onFechar: () => void
}

export function DetalheCandidato({ resultado, indice, revelado, onFechar }: Props) {
  const { dados } = useFluxoCtx()
  const { perguntas, aderencia, respostas } = useResultados()
  const c = resultado.candidato
  const encaixes = encaixesDoCandidato(c.id, perguntas, aderencia, respostas)
  const nomeTema = (id: string) => dados.quiz.temas.find((t) => t.id === id)?.nome ?? id
  const pct = resultado.afinidade === null ? 'sem porcentagem' : `${resultado.afinidade}%`

  return (
    <Folha titulo={`${revelado ? c.nome : rotuloAsCegas(indice)} · ${pct}`} onFechar={onFechar} testid="detalhe-folha">
      {revelado && (
        <p className="m-0 text-sm text-texto-suave">
          {c.partido} · {c.numero}
          {c.vice ? ` · vice: ${c.vice}` : ''}
        </p>
      )}
      {resultado.afinidade === null && (
        <p className="nota">
          Este candidato falou pouco sobre essas situações (precisa de pelo menos {COBERTURA_MINIMA}). Por isso, fica sem
          porcentagem.
        </p>
      )}
      {GRUPOS.filter((g) => encaixes[g.encaixe].length > 0).map((g) => (
        <section key={g.encaixe}>
          <h3 className="grupo">
            <span className={`bola ${g.classe}`} aria-hidden="true">
              {g.marca}
            </span>
            {g.titulo} ({encaixes[g.encaixe].length})
          </h3>
          <ul className="itens">
            {encaixes[g.encaixe].map((item) => (
              <Item key={item.pergunta.id} item={item} tema={nomeTema(item.pergunta.tema)} revelado={revelado} candidatoId={c.id} />
            ))}
          </ul>
        </section>
      ))}
      {encaixes.sem_proposta.length > 0 && (
        <p className="nota">
          Não falou sobre {encaixes.sem_proposta.length === 1 ? '1 das suas escolhas' : `${encaixes.sem_proposta.length} das suas escolhas`}.
          Isso não conta nem a favor nem contra.
        </p>
      )}
      {revelado ? (
        <p className="mt-3 mb-0">
          <a className="inline-flex min-h-11 items-center" href={c.planoGovernoUrl} target="_blank" rel="noreferrer">
            Ler o plano de governo completo<span className="sr-only"> (abre em nova aba)</span>
          </a>
        </p>
      ) : (
        <p className="nota">Trecho e fonte de cada proposta aparecem depois do voto, porque entregariam quem é.</p>
      )}
    </Folha>
  )
}

function Item({ item, tema, revelado, candidatoId }: { item: ItemEncaixe; tema: string; revelado: boolean; candidatoId: string }) {
  const opcao = item.pergunta.opcoes.find((o) => o.id === item.opcaoId)
  const texto = (
    <>
      <span className="situacao">{tema}</span>
      {opcao?.texto}
    </>
  )
  // antes do voto, justificativa e fonte ficam escondidas: citação e veículo entregariam quem é
  if (!revelado || !item.avaliacao) return <li>{texto}</li>
  return (
    <li>
      <details>
        <summary>
          {texto} <span className="abre">Ver o que disse</span>
        </summary>
        <p className="mt-1 mb-0 text-texto-suave">{item.avaliacao.justificativa}</p>
        <Suspense fallback={<p className="nota">Carregando a fonte…</p>}>
          <Evidencias ids={item.avaliacao.evidencias} candidatoId={candidatoId} />
        </Suspense>
      </details>
    </li>
  )
}

function Evidencias({ ids, candidatoId }: { ids: string[]; candidatoId: string }) {
  const { dados } = useFluxoCtx()
  const evidencias = use(carregarEvidencias(dados.id))
  return (
    <>
      {ids.map((eid) => {
        const ev = evidencias[candidatoId]?.[eid]
        if (!ev) return null
        return (
          <blockquote key={eid} className="citacao">
            “{ev.trecho}”{' '}
            <a href={ev.fonte.url} target="_blank" rel="noreferrer">
              {ev.fonte.veiculo}
              {ev.fonte.data ? `, ${ev.fonte.data.split('-').reverse().join('/')}` : ''}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </blockquote>
        )
      })}
    </>
  )
}
