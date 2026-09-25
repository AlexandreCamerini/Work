import { useEffect, useMemo, useRef, useState } from 'react'
import { useIlustracoes } from '../cenas/ilustracoes/carregar'
import { useFluxoCtx } from '../fluxo/contexto'
import { ContextoLeia } from './ContextoLeia'
import { Folha } from '../ui/Folha'
import { Check, SetaEsquerda } from '../ui/icones'
import { Segmentos, Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

/** Reação curta ao escolher: nunca avalia a escolha. */
const REACOES = ['Anotado', 'Registrado', 'Guardado']

export function Cena({ indice }: { indice: number }) {
  const { dados, estado, enviar, voltar, anunciar, mostrarToast } = useFluxoCtx()
  const n = estado.cenas.length
  const id = estado.cenas[indice]
  const pergunta = useMemo(() => dados.quiz.perguntas.find((p) => p.id === id)!, [dados, id])
  const tema = dados.quiz.temas.find((t) => t.id === pergunta.tema)
  const ordem = estado.ordemOpcoes[id] ?? pergunta.opcoes.map((o) => o.id)
  const opcoes = ordem.map((oid) => pergunta.opcoes.find((o) => o.id === oid)!).filter(Boolean)
  const escolha = typeof estado.respostas[id] === 'string' ? (estado.respostas[id] as string) : null
  const ultima = indice === n - 1
  const [trocou, setTrocou] = useState(false)
  const [fatoAberto, setFatoAberto] = useState(false)
  const estava = useRef<Record<string, boolean>>({})
  useFocoAoEntrar()

  // ao chegar: anuncia a situação e, uma vez só, o marco
  useEffect(() => {
    anunciar(`Situação ${indice + 1} de ${n}. ${tema?.nome ?? ''}.`)
    if (estado.marco === 'metade') mostrarToast(`Metade! Faltam ${n - indice}`)
    if (estado.marco === 'ultima') mostrarToast('Última! Depois vem o resultado')
    // só na montagem da cena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function escolher(opcaoId: string) {
    const anterior = escolha
    enviar({ tipo: 'escolher', valor: opcaoId })
    if (anterior === opcaoId) {
      setTrocou(false)
      anunciar('Resposta desmarcada.')
    } else if (anterior) {
      setTrocou(true)
      anunciar('Resposta trocada.')
    } else {
      setTrocou(false)
      anunciar('Anotado. Dá para trocar.')
    }
  }

  function avancar() {
    setFatoAberto(false)
    enviar({ tipo: escolha ? 'avancar' : 'pular' })
  }

  // atalhos no computador: 1 a 4 escolhem
  const escolherRef = useRef(escolher)
  useEffect(() => {
    escolherRef.current = escolher
  })
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || !/^[1-9]$/.test(e.key)) return
      if (document.querySelector('dialog[open]')) return
      const oid = ordem[Number(e.key) - 1]
      if (!oid) return
      if (estado.respostas[id] !== oid) escolherRef.current(oid)
      document.querySelector<HTMLInputElement>(`input[value="${oid}"]`)?.focus()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [ordem, estado.respostas, id])

  const reacao = trocou ? 'Trocado' : REACOES[indice % REACOES.length]
  const longa = pergunta.cena.length > 120
  const ilustracoes = useIlustracoes()
  const Ilustracao = ilustracoes?.ilustracaoDe(pergunta)

  return (
    <Tela
      etapa="cena"
      animar={estado.direcao}
      topo={
        <>
          <span className="tema">{tema?.nome}</span>
          <Segmentos total={n} atual={indice} rotulo="Progresso" texto={`Situação ${indice + 1} de ${n}`} />
          <span className="contador" aria-hidden="true">
            {indice + 1}/{n}
          </span>
        </>
      }
      rodape={
        <>
          {escolha ? (
            <button
              type="button"
              className="faixa faixa-fato"
              aria-haspopup="dialog"
              data-testid="fato-chip"
              onClick={() => setFatoAberto(true)}
            >
              <span className="miolo">
                <span className="rot">{reacao} · Você sabia?</span>
                <span className="linha1">{pergunta.fato.texto}</span>
              </span>
              <span className="seta" aria-hidden="true">
                Ler ›
              </span>
            </button>
          ) : (
            <div className="faixa faixa-dica">Escolha a que mais combina com você. Dá para trocar.</div>
          )}
          <div className="acoes">
            <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="cena-voltar" onClick={voltar}>
              <SetaEsquerda />
            </button>
            <button type="button" className={`btn ${escolha ? 'btn-pri' : 'btn-sec'}`} data-testid="cena-avancar" onClick={avancar}>
              {escolha ? (ultima ? 'Ver meu resultado' : 'Próxima') : 'Nenhuma dessas. Pular'}
            </button>
          </div>
        </>
      }
    >
      {/* decorativa (o texto da cena já descreve): ocupa só a sobra e some se faltar espaço */}
      <div className="cena-ilustra" key={id} data-testid="cena-ilustracao" aria-hidden="true">
        {Ilustracao && <Ilustracao />}
      </div>
      <p className={`cena-texto ${longa ? 'longa' : ''}`} id="cena-texto">
        {pergunta.cena}
      </p>
      <fieldset className="opcoes" role="radiogroup" aria-labelledby="q-cena" aria-describedby="cena-texto">
        <legend>
          <h1 className="pergunta" id="q-cena" tabIndex={-1} data-foco>
            {pergunta.pergunta}
          </h1>
        </legend>
        <div className="lista">
          {opcoes.map((o) => (
            <label key={o.id} className={`opcao ${escolha === o.id ? 'escolhida' : ''}`} data-op={o.id}>
              <input
                type="radio"
                name={`op-${id}`}
                value={o.id}
                checked={escolha === o.id}
                onChange={() => escolher(o.id)}
                onPointerDown={(e) => (estava.current[o.id] = e.currentTarget.checked)}
                onKeyDown={() => (estava.current[o.id] = false)}
                onClick={() => {
                  // tocar de novo na escolhida desmarca (o rádio nativo não faz isso sozinho)
                  if (estava.current[o.id] && escolha === o.id) escolher(o.id)
                  estava.current[o.id] = false
                }}
              />
              <span className="marca" aria-hidden="true">
                <Check />
              </span>
              <span>{o.texto}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {fatoAberto && (
        <Folha
          titulo="Você sabia?"
          testid="fato-folha"
          onFechar={() => setFatoAberto(false)}
          acoes={
            <>
              <button type="button" className="btn btn-sec" onClick={() => setFatoAberto(false)}>
                Fechar
              </button>
              <button type="button" className="btn btn-pri" onClick={avancar}>
                {ultima ? 'Ver meu resultado' : 'Próxima'}
              </button>
            </>
          }
        >
          <p className="m-0 mb-2">{pergunta.fato.texto}</p>
          <a className="inline-flex min-h-11 items-center" href={pergunta.fato.url} target="_blank" rel="noreferrer">
            Fonte: {pergunta.fato.fonte}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          {pergunta.consenso && <p className="mt-3 mb-0 font-bold">Aqui os candidatos propõem quase a mesma coisa.</p>}
          <ContextoLeia eleicao={dados.id} perguntaId={pergunta.id} />
        </Folha>
      )}
    </Tela>
  )
}
