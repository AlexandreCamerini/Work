import { useState } from 'react'
import { avisoVotacao, enviarVoto, type EstadoVotacao, type ResultadoVoto } from '../lib/votacao'
import type { Candidato } from '../types'
import { Turnstile } from './Turnstile'

interface EscolhaVotoProps {
  eleicaoId: string
  /** Na ordem do resultado, com o rótulo às cegas ("Candidato A") e a posição no ranking (1 = mais afinidade). */
  opcoes: { candidato: Candidato; rotulo: string; posicao: number }[]
  estado: EstadoVotacao
  onVotou: (candidatoId: string | null, resultado: ResultadoVoto) => void
}

export function EscolhaVoto({ eleicaoId, opcoes, estado, onVotou }: EscolhaVotoProps) {
  const [escolha, setEscolha] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const exigeDesafio = estado.coleta && !!estado.turnstileSiteKey

  async function confirmar() {
    const opcao = opcoes.find((o) => o.candidato.id === escolha)
    if (!opcao) return
    setEnviando(true)
    const resultado = await enviarVoto(estado, { eleicao: eleicaoId, posicao: opcao.posicao, candidato: opcao.candidato.id }, token)
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
