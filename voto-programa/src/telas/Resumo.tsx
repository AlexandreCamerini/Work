import { useEffect, useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { CARTOES_RESUMO } from '../fluxo/maquina'
import { consensos } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { Carregando } from '../ui/Carregando'
import { SetaEsquerda } from '../ui/icones'
import { Segmentos, Tela } from '../ui/Tela'
import { tempo, useFocoAoEntrar } from '../ui/useFoco'

/** Resumo em 2 cartões, tipo "retrospectiva", sem nomes. Avança só por toque (WCAG 2.2.2). */
export function Resumo({ cartao }: { cartao: number }) {
  const { estado } = useFluxoCtx()
  // "Comparando…" só na chegada vinda da última cena
  const [comparando, setComparando] = useState(cartao === 0 && estado.direcao === 'frente')
  useEffect(() => {
    if (!comparando) return
    const t = window.setTimeout(() => setComparando(false), tempo(1200))
    return () => window.clearTimeout(t)
  }, [comparando])
  if (comparando) return <Carregando texto="Comparando suas escolhas com as propostas…" detalhe="Tabela fixa, igual para todo mundo. Nada sai do seu celular." />
  return <Cartao cartao={cartao} />
}

function Cartao({ cartao }: { cartao: number }) {
  const { dados, estado, enviar, voltar } = useFluxoCtx()
  const { perguntas, respostas, aderencia } = useResultados()
  useFocoAoEntrar()
  const nomeTema = (id: string) => dados.quiz.temas.find((t) => t.id === id)?.nome ?? id
  const ultimo = cartao === CARTOES_RESUMO - 1
  const n = respostas.length

  let conteudo
  if (cartao === 0) {
    conteudo = (
      <>
        <p className="rotulo mt-4">Seu jeito</p>
        <p className="enorme" aria-hidden="true">
          {n}
        </p>
        <h1 className="grande mt-0" tabIndex={-1} data-foco>
          <span className="sr-only">{n} </span>
          {n === 1 ? 'situação do dia a dia com resposta sua' : 'situações do dia a dia com resposta sua'}
        </h1>
        {estado.prioridades.length ? (
          <>
            <p className="m-0">O que mais pesa pra você:</p>
            <ul className="pilulas">
              {estado.prioridades.map((p) => (
                <li key={p}>{nomeTema(p)}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Você não marcou prioridades: todos os temas valeram igual.</p>
        )}
      </>
    )
  } else {
    const lista = consensos(perguntas, respostas, aderencia)
    conteudo = (
      <>
        <p className="rotulo mt-4">Antes do resultado</p>
        {lista.length > 0 ? (
          <>
            <h1 className="grande" tabIndex={-1} data-foco>
              Nisso eles concordam
            </h1>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] leading-snug">
              {lista.map((c) => (
                <li key={c.pergunta.id}>
                  <b>{nomeTema(c.pergunta.tema)}:</b> todos propõem {c.opcoes.join('; ')}.
                </li>
              ))}
            </ul>
            <p className="mt-4 mb-0">
              Agora você vê quem ficou mais perto das suas escolhas, <b>sem os nomes</b>. Depois vota às cegas, e só aí os
              nomes aparecem.
            </p>
          </>
        ) : (
          <>
            <h1 className="grande" tabIndex={-1} data-foco>
              Agora você vê quem ficou mais perto das suas escolhas, sem os nomes.
            </h1>
            <p className="m-0">Depois você vota às cegas, e só aí os nomes aparecem.</p>
          </>
        )}
      </>
    )
  }

  return (
    <Tela
      etapa="resumo"
      className="historia"
      animar={estado.direcao}
      topo={
        <>
          <Segmentos total={CARTOES_RESUMO} atual={cartao} rotulo="Resumo" texto={`Cartão ${cartao + 1} de ${CARTOES_RESUMO}`} feitos={(i) => i <= cartao} />
          <button type="button" className="link" onClick={() => enviar({ tipo: 'pular' })}>
            Pular
          </button>
        </>
      }
      rodape={
        <div className="acoes">
          <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
            <SetaEsquerda />
          </button>
          <button type="button" className="btn btn-destaque" onClick={() => enviar({ tipo: 'avancar' })}>
            {ultimo ? 'Ver resultado às cegas' : 'Continuar'}
          </button>
        </div>
      }
    >
      {conteudo}
    </Tela>
  )
}
