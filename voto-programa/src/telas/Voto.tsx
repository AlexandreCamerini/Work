import { useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { rotuloAsCegas } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { avisoVotacao, enviarVoto } from '../lib/votacao'
import { Turnstile } from '../components/Turnstile'
import { Check, SetaEsquerda } from '../ui/icones'
import { Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

const NENHUM = 'nenhum'

export function Voto() {
  const { dados, estado, enviar, voltar, votacao } = useFluxoCtx()
  const { resultados } = useResultados()
  const [erro, setErro] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  useFocoAoEntrar()
  const exigeDesafio = votacao.coleta && !!votacao.turnstileSiteKey
  const escolha = estado.escolhaVoto === null ? undefined : (estado.escolhaVoto.candidatoId ?? NENHUM)
  const aguardando = exigeDesafio && !token && escolha !== NENHUM

  async function confirmar() {
    if (enviando) return
    if (escolha === undefined) {
      setErro(true)
      document.querySelector<HTMLInputElement>('input[name="voto"]')?.focus()
      return
    }
    if (escolha === NENHUM) {
      enviar({ tipo: 'votar', candidatoId: null, resultado: 'nao_enviado' })
      return
    }
    if (aguardando) return
    const posicao = resultados.findIndex((r) => r.candidato.id === escolha) + 1
    setEnviando(true)
    // sai do aparelho só {eleicao, posicao}; o candidato só se o servidor disser que conta
    const resultado = await enviarVoto(votacao, { eleicao: dados.id, posicao, candidato: escolha }, token)
    setEnviando(false)
    enviar({ tipo: 'votar', candidatoId: escolha, resultado })
  }

  function marcar(valor: string) {
    setErro(false)
    enviar({ tipo: 'escolher', valor: valor === NENHUM ? null : valor })
  }

  return (
    <Tela
      etapa="voto"
      animar={estado.direcao}
      topo={<span className="tema">Voto às cegas</span>}
      rodape={
        <>
          {erro ? (
            <div className="faixa faixa-erro" role="alert">
              Escolha uma opção acima, ou “Prefiro não votar”.
            </div>
          ) : (
            <div className="faixa faixa-dica">Dá para trocar até confirmar.</div>
          )}
          <div className="acoes">
            <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
              <SetaEsquerda />
            </button>
            <button type="button" className="btn btn-pri" data-testid="voto-confirmar" aria-busy={enviando || aguardando} onClick={confirmar}>
              {enviando ? 'Enviando…' : aguardando ? 'Verificando…' : 'Confirmar e revelar'}
            </button>
          </div>
        </>
      }
    >
      <fieldset className="opcoes" role="radiogroup" aria-labelledby="q-voto">
        <legend>
          <h1 className="titulo" id="q-voto" style={{ fontSize: 23 }} tabIndex={-1} data-foco>
            Agora é com você: em qual deles você votaria?
          </h1>
        </legend>
        <p className="sub">Só pelas propostas. Os nomes aparecem logo depois.</p>
        <div className="lista">
          {resultados.map((r, i) => (
            <label key={r.candidato.id} className={`opcao ${escolha === r.candidato.id ? 'escolhida' : ''}`}>
              <input type="radio" name="voto" value={r.candidato.id} checked={escolha === r.candidato.id} onChange={() => marcar(r.candidato.id)} />
              <span className="marca" aria-hidden="true">
                <Check />
              </span>
              <span className="flex-1">{rotuloAsCegas(i)}</span>
              <span className="font-display font-extrabold" aria-hidden="true">
                {r.afinidade === null ? '—' : `${r.afinidade}%`}
              </span>
              <span className="sr-only">{r.afinidade === null ? ', sem porcentagem' : `, ${r.afinidade} por cento`}</span>
            </label>
          ))}
          <label className={`opcao ${escolha === NENHUM ? 'escolhida' : ''}`}>
            <input type="radio" name="voto" value={NENHUM} checked={escolha === NENHUM} onChange={() => marcar(NENHUM)} />
            <span className="marca" aria-hidden="true">
              <Check />
            </span>
            <span>Prefiro não votar</span>
          </label>
        </div>
      </fieldset>
      {exigeDesafio && (
        <div className="mt-3">
          <Turnstile siteKey={votacao.turnstileSiteKey as string} onToken={setToken} />
        </div>
      )}
      <p className="nota">{avisoVotacao(votacao)} Seu voto não vai no cartão de compartilhar.</p>
    </Tela>
  )
}
