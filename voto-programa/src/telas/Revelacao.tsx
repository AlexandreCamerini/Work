import { useEffect, useRef, useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { letra, rotuloAsCegas } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { mensagemVoto } from '../lib/votacao'
import type { Resultado } from '../types'
import { Tela } from '../ui/Tela'
import { tempo, useFocoAoEntrar } from '../ui/useFoco'
import { ComoCalculamos } from './ComoCalculamos'
import { DetalheCandidato } from './DetalheCandidato'

function Carta({ r, indice, destaque, virada, onAbrir }: { r: Resultado; indice: number; destaque: boolean; virada: boolean; onAbrir?: () => void }) {
  const c = r.candidato
  const pct = r.afinidade === null ? '—' : `${r.afinidade}%`
  const conteudo = (
    <span className="carta-in">
      <span className="face frente" aria-hidden={virada}>
        <span className="letra">{letra(indice)}</span>
        <span className="qual">
          {destaque && <small>Seu voto às cegas</small>}
          <b>{rotuloAsCegas(indice)}</b>
        </span>
        <span className="pct">{pct}</span>
      </span>
      <span className="face verso" aria-hidden={!virada}>
        <span className="letra">{letra(indice)}</span>
        <span className="qual">
          {destaque && <small>Seu voto às cegas</small>}
          <b>{c.nome}</b>
          <small>
            {c.partido} · {c.numero}
          </small>
        </span>
        <span className="flex flex-col items-end">
          <span className="pct">{pct}</span>
          {onAbrir && <span className="ver">Ver ›</span>}
        </span>
      </span>
    </span>
  )
  const classe = `carta ${destaque ? 'destaque' : ''} ${virada ? 'virada' : ''}`
  if (onAbrir) {
    return (
      <button type="button" className={classe} data-testid={`carta-${letra(indice)}`} aria-haspopup="dialog" onClick={onAbrir}>
        <span className="sr-only">
          {rotuloAsCegas(indice)} é {c.nome}, {c.partido}, número {c.numero}, {pct}. Ver o que propõe, com trecho e fonte.
        </span>
        {conteudo}
      </button>
    )
  }
  return (
    <div className={classe} data-testid={`carta-${letra(indice)}`}>
      {conteudo}
    </div>
  )
}

export function Revelacao() {
  const { estado, enviar, anunciar, reiniciar } = useFluxoCtx()
  const { resultados } = useResultados()
  const [aberto, setAberto] = useState<number | null>(null)
  const [como, setComo] = useState(false)
  const [virando, setVirando] = useState(false)
  const cancelado = useRef(false)
  useFocoAoEntrar()

  const voto = estado.voto
  const iVotado = voto?.candidatoId ? resultados.findIndex((r) => r.candidato.id === voto.candidatoId) : -1
  const votado = iVotado >= 0 ? resultados[iVotado] : null
  const revelado = (id: string) => estado.revelados.includes(id)
  const todos = resultados.every((r) => revelado(r.candidato.id))

  const falar = (i: number) => {
    const c = resultados[i].candidato
    anunciar(`${rotuloAsCegas(i)} é ${c.nome}, ${c.partido}, número ${c.numero}.`)
  }

  // o voto se revela sozinho ao chegar: é a recompensa (descobrir em quem votou só pelas propostas)
  useEffect(() => {
    cancelado.current = false
    if (!votado || revelado(votado.candidato.id)) return
    const t = window.setTimeout(() => {
      enviar({ tipo: 'revelar', candidatoId: votado.candidato.id })
      falar(iVotado)
    }, tempo(350))
    return () => {
      window.clearTimeout(t)
      cancelado.current = true
    }
    // só na chegada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function revelarOutros() {
    if (virando) return
    setVirando(true)
    for (let i = 0; i < resultados.length; i++) {
      const id = resultados[i].candidato.id
      if (revelado(id) || cancelado.current) continue
      enviar({ tipo: 'revelar', candidatoId: id })
      falar(i)
      await new Promise((ok) => window.setTimeout(ok, tempo(420)))
    }
    setVirando(false)
  }

  const outros = resultados.map((r, i) => ({ r, i })).filter(({ i }) => i !== iVotado)
  const mensagem = voto ? mensagemVoto(voto.resultado) : ''

  return (
    <Tela
      etapa="revelacao"
      topo={
        <>
          <span className="tema">Quem é quem</span>
          <span className="flex-1" />
          <button type="button" className="link" aria-haspopup="dialog" onClick={() => setComo(true)}>
            Como calculamos
          </button>
        </>
      }
      rodape={
        todos ? (
          <>
            <div className="acoes">
              <button type="button" className="btn btn-destaque" onClick={() => enviar({ tipo: 'avancar' })}>
                Montar meu cartão
              </button>
            </div>
            <button type="button" className="link self-center" onClick={reiniciar}>
              Refazer o teste
            </button>
          </>
        ) : (
          <div className="acoes">
            <button type="button" className="btn btn-pri" aria-busy={virando} onClick={revelarOutros}>
              {votado ? 'Revelar os outros' : 'Revelar'}
            </button>
          </div>
        )
      }
    >
      <h1 className="titulo" style={{ fontSize: 24 }} tabIndex={-1} data-foco>
        {votado ? `Você votou no ${rotuloAsCegas(iVotado)}` : 'Os nomes'}
      </h1>
      {todos && <p className="sub mb-2">Pronto! Toque em um nome para ver o que ele propõe das suas escolhas, com o trecho e a fonte.</p>}
      {mensagem && <p className="nota mt-0 mb-2">{mensagem}</p>}
      <div className="cartas">
        {votado && <Carta r={votado} indice={iVotado} destaque virada={revelado(votado.candidato.id)} onAbrir={todos ? () => setAberto(iVotado) : undefined} />}
        {votado && outros.length > 0 && <p className="nota mt-1">E os outros:</p>}
        {outros.map(({ r, i }) => (
          <Carta key={r.candidato.id} r={r} indice={i} destaque={false} virada={revelado(r.candidato.id)} onAbrir={todos ? () => setAberto(i) : undefined} />
        ))}
      </div>
      {aberto !== null && <DetalheCandidato resultado={resultados[aberto]} indice={aberto} revelado onFechar={() => setAberto(null)} />}
      {como && <ComoCalculamos onFechar={() => setComo(false)} />}
    </Tela>
  )
}
