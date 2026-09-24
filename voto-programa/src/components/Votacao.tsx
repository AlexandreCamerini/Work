import { useEffect, useState } from 'react'
import { dataBr, enviarVoto, lerPlacar, type EstadoVotacao, type Placar, type ResultadoVoto } from '../lib/votacao'
import type { Candidato } from '../types'
import { Turnstile } from './Turnstile'

interface EscolhaVotoProps {
  eleicaoId: string
  /** Na ordem do resultado, com o rótulo às cegas ("Candidato A"). */
  opcoes: { candidato: Candidato; rotulo: string }[]
  estado: EstadoVotacao
  onVotou: (candidatoId: string | null, resultado: ResultadoVoto) => void
}

function avisoVotacao(estado: EstadoVotacao) {
  if (estado.aberta) {
    return 'Voto anônimo: só somamos +1 ao candidato escolhido. Não guardamos quem você é, de onde veio nem a hora do voto, e suas respostas não saem do aparelho.'
  }
  if (estado.offline) return 'Neste protótipo o voto não é enviado a lugar nenhum: ele só revela os nomes.'
  const quando = dataBr(estado.abreEm)
  return `Voto simbólico: durante a campanha a lei eleitoral proíbe enquetes, então seu voto não é enviado nem guardado${
    quando ? ` e o placar só abre em ${quando}` : ''
  }. Ele só revela os nomes.`
}

export function EscolhaVoto({ eleicaoId, opcoes, estado, onVotou }: EscolhaVotoProps) {
  const [escolha, setEscolha] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const exigeDesafio = estado.aberta && !!estado.turnstileSiteKey

  async function confirmar() {
    if (!escolha) return
    setEnviando(true)
    const resultado = await enviarVoto(estado, eleicaoId, escolha, token)
    setEnviando(false)
    onVotou(escolha, resultado)
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border-2 border-mar bg-white p-5" aria-labelledby="titulo-voto">
      <div>
        <h2 id="titulo-voto" className="font-display text-2xl font-extrabold">Agora é com você: em quem você vota?</h2>
        <p className="mt-1 text-sm text-tinta-suave">Os nomes aparecem depois do voto.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Candidatos">
        {opcoes.map(({ candidato, rotulo }) => {
          const ativo = escolha === candidato.id
          return (
            <button
              key={candidato.id}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => setEscolha(candidato.id)}
              className={`rounded-2xl border-2 px-3 py-3 font-display font-extrabold transition ${
                ativo ? 'border-mar bg-mar text-white' : 'border-linha bg-papel hover:border-mar'
              }`}
            >
              {rotulo}
            </button>
          )
        })}
      </div>
      {exigeDesafio && <Turnstile siteKey={estado.turnstileSiteKey as string} onToken={setToken} />}
      <button
        type="button"
        disabled={!escolha || enviando || (exigeDesafio && !token)}
        onClick={confirmar}
        className="rounded-2xl bg-mar px-6 py-4 font-display text-xl font-extrabold text-white shadow-[0_4px_0_var(--color-mar-escuro)] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:opacity-40"
      >
        {enviando ? 'Votando…' : 'Confirmar voto e ver quem é quem'}
      </button>
      <p className="text-xs leading-relaxed text-tinta-suave">{avisoVotacao(estado)}</p>
      <button type="button" onClick={() => onVotou(null, 'nao_enviado')} className="self-center text-sm font-semibold text-tinta-suave underline">
        Prefiro não votar, só quero ver os nomes
      </button>
    </section>
  )
}

export function PlacarAnonimo({ eleicaoId, candidatos, estado }: { eleicaoId: string; candidatos: Candidato[]; estado: EstadoVotacao }) {
  const [placar, setPlacar] = useState<Placar | null>(null)
  const [carregou, setCarregou] = useState(false)

  useEffect(() => {
    if (!estado.aberta) return
    let ativo = true
    lerPlacar(eleicaoId).then((p) => {
      if (!ativo) return
      setPlacar(p)
      setCarregou(true)
    })
    return () => {
      ativo = false
    }
  }, [eleicaoId, estado.aberta])

  if (!estado.aberta) {
    const quando = dataBr(estado.abreEm)
    return (
      <aside className="rounded-3xl border-2 border-linha bg-white p-5">
        <h2 className="font-display text-lg font-extrabold">Como está a votação</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          {estado.offline
            ? 'O placar anônimo só existe na versão publicada do site.'
            : `Placar fechado durante a campanha, por lei${quando ? `. Abre em ${quando}` : ''}.`}
        </p>
      </aside>
    )
  }

  const votos = placar?.votos
  const ordenados = votos ? [...candidatos].sort((a, b) => (votos[b.id] ?? 0) - (votos[a.id] ?? 0)) : []
  return (
    <aside className="flex flex-col gap-3 rounded-3xl border-2 border-linha bg-white p-5">
      <h2 className="font-display text-lg font-extrabold">Como está a votação anônima</h2>
      {!carregou && <p className="text-sm text-tinta-suave">Carregando…</p>}
      {carregou && !placar && <p className="text-sm text-tinta-suave">Placar indisponível agora.</p>}
      {placar && !votos && (
        <p className="text-sm text-tinta-suave">
          {placar.total === 1 ? '1 voto' : `${placar.total} votos`} até agora. A divisão aparece a partir de {placar.minimo}.
        </p>
      )}
      {placar && votos && (
        <ul className="flex flex-col gap-2">
          {ordenados.map((c) => {
            const pct = placar.total ? Math.round(((votos[c.id] ?? 0) / placar.total) * 100) : 0
            return (
              <li key={c.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span>
                    {c.nome} ({c.partido})
                  </span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-linha">
                  <div className="h-full rounded-full bg-mar" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {placar && (
        <p className="text-xs leading-relaxed text-tinta-suave">
          {placar.total === 1 ? '1 voto' : `${placar.total} votos`}. Votação aberta na internet, de quem quis participar: não é pesquisa
          eleitoral e não representa o eleitorado.
        </p>
      )}
    </aside>
  )
}
