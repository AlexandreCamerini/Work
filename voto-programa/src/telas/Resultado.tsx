import { useEffect, useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { letra, quaseEmpate, rotuloAsCegas } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { encaixesDoCandidato } from '../lib/matching'
import { SetaEsquerda } from '../ui/icones'
import { Tela } from '../ui/Tela'
import { movimentoReduzido, useFocoAoEntrar } from '../ui/useFoco'
import { ComoCalculamos } from './ComoCalculamos'
import { DetalheCandidato } from './DetalheCandidato'

/** Conta de 0 até o valor (700 ms), depois de um atraso; direto com movimento reduzido. */
function useContagem(alvo: number, atraso: number) {
  const [valor, setValor] = useState(() => (movimentoReduzido() ? alvo : 0))
  useEffect(() => {
    if (movimentoReduzido()) return
    let quadro = 0
    const inicio = performance.now() + atraso
    const passo = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - inicio) / 700))
      setValor(Math.round(alvo * (1 - Math.pow(1 - k, 3))))
      if (k < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, atraso])
  return valor
}

function Linha({ indice, afinidade, atende, emParte, nao, onAbrir }: { indice: number; afinidade: number | null; atende: number; emParte: number; nao: number; onAbrir: () => void }) {
  const atraso = 120 + indice * 180
  const valor = useContagem(afinidade ?? 0, atraso)
  const [largura, setLargura] = useState(movimentoReduzido() ? (afinidade ?? 0) : 0)
  useEffect(() => {
    const t = window.setTimeout(() => setLargura(afinidade ?? 0), movimentoReduzido() ? 0 : atraso)
    return () => window.clearTimeout(t)
  }, [afinidade, atraso])
  const rotulo = rotuloAsCegas(indice)
  const falado =
    afinidade === null
      ? `${rotulo}, poucos dados para porcentagem.`
      : `${rotulo}, ${afinidade} por cento. ${atende} ${atende === 1 ? 'propõe' : 'propõem'} o que você escolheu, ${emParte} em parte, ${nao} em outra direção.`
  return (
    <li>
      <button type="button" className="cand" aria-haspopup="dialog" aria-label={`${falado} Ver detalhes.`} data-testid={`linha-${letra(indice)}`} onClick={onAbrir}>
        <span className="letra" aria-hidden="true">
          {letra(indice)}
        </span>
        <span aria-hidden="true" className="min-w-0">
          <span className="nome">{rotulo}</span>
          <span className="conta">
            ✓{atende} · ~{emParte} · ✗{nao}
          </span>
          {afinidade === null ? (
            <span className="block text-[13px] text-texto-suave">poucos dados</span>
          ) : (
            <span className="barra">
              <i style={{ width: `${largura}%` }} />
            </span>
          )}
        </span>
        <span className="pct" aria-hidden="true">
          {afinidade === null ? '—' : `${valor}%`}
        </span>
      </button>
    </li>
  )
}

export function Resultado() {
  const { estado, enviar, voltar } = useFluxoCtx()
  const { resultados, perguntas, aderencia, respostas } = useResultados()
  const [aberto, setAberto] = useState<number | null>(null)
  const [como, setComo] = useState(false)
  useFocoAoEntrar()
  const empate = quaseEmpate(resultados)

  return (
    <Tela
      etapa="resultado"
      animar={estado.direcao}
      topo={
        <>
          <span className="tema">Resultado às cegas</span>
          <span className="flex-1" />
          <button type="button" className="link" aria-haspopup="dialog" onClick={() => setComo(true)}>
            Como calculamos
          </button>
        </>
      }
      rodape={
        <>
          <div className="acoes">
            <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
              <SetaEsquerda />
            </button>
            <button type="button" className="btn btn-pri" data-testid="resultado-votar" onClick={() => enviar({ tipo: 'avancar' })}>
              Votar às cegas
            </button>
          </div>
          <button type="button" className="link self-center" onClick={() => enviar({ tipo: 'pular' })}>
            Prefiro não votar, só quero ver os nomes
          </button>
        </>
      }
    >
      <h1 className="titulo" style={{ fontSize: 23 }} tabIndex={-1} data-foco>
        Quem propõe algo parecido com as suas escolhas
      </h1>
      {empate && (
        <p className="aviso-empate">
          {rotuloAsCegas(0)} e {rotuloAsCegas(1)} estão quase empatados nas suas escolhas.
        </p>
      )}
      <ul className="cands">
        {resultados.map((r, i) => {
          const e = encaixesDoCandidato(r.candidato.id, perguntas, aderencia, respostas)
          return (
            <Linha
              key={r.candidato.id}
              indice={i}
              afinidade={r.afinidade}
              atende={e.atende.length}
              emParte={e.em_parte.length}
              nao={e.nao_atende.length}
              onAbrir={() => setAberto(i)}
            />
          )
        })}
      </ul>
      <p className="nota">
        Toque num candidato para ver o que ele propõe das suas escolhas. A porcentagem é afinidade com as suas escolhas, não é
        recomendação de voto. Os nomes aparecem depois do voto (ou se você preferir não votar).
      </p>
      {aberto !== null && <DetalheCandidato resultado={resultados[aberto]} indice={aberto} revelado={false} onFechar={() => setAberto(null)} />}
      {como && <ComoCalculamos onFechar={() => setComo(false)} />}
    </Tela>
  )
}
