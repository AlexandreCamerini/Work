import { Suspense, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { carregarIlustracoes } from '../cenas/ilustracoes/carregar'
import { carregarAderencia, carregarEvidencias, carregarQuiz, type IdEleicao } from '../data'
import { FluxoContexto, type ValorFluxo } from '../fluxo/contexto'
import { chaveDaEtapa, type EstadoFluxo } from '../fluxo/maquina'
import { useFluxo } from '../fluxo/useFluxo'
import { lerEstado, SEM_API, type EstadoVotacao } from '../lib/votacao'
import { Carregando } from '../ui/Carregando'
import { Falha } from '../ui/Falha'
import { Abertura } from './Abertura'
import { Cartao } from './Cartao'
import { Cena } from './Cena'
import { Contagem } from './Contagem'
import { PerfilPasso } from './PerfilPasso'
import { Prioridades } from './Prioridades'
import { Resultado } from './Resultado'
import { Resumo } from './Resumo'
import { Revelacao } from './Revelacao'
import { Voto } from './Voto'

export default function Quiz({ id }: { id: IdEleicao }) {
  // ilustrações das cenas: chegam junto com a eleição, em paralelo aos dados do quiz
  useEffect(() => {
    carregarIlustracoes().catch(() => {})
  }, [])
  return (
    <Falha>
      <Suspense
        fallback={
          <div className="app">
            <Carregando />
          </div>
        }
      >
        <QuizCarregado id={id} />
      </Suspense>
    </Falha>
  )
}

function tituloDaEtapa(e: EstadoFluxo) {
  const et = e.etapa
  switch (et.tipo) {
    case 'perfil':
      return `Sobre você ${et.passo + 1} de ${e.passosPerfil.length}`
    case 'prioridades':
      return 'Prioridades'
    case 'cena':
      return `Situação ${et.indice + 1} de ${e.cenas.length}`
    case 'resumo':
      return 'Resumo'
    case 'resultado':
      return 'Resultado às cegas'
    case 'voto':
      return 'Voto às cegas'
    case 'contagem':
    case 'revelacao':
      return 'Quem é quem'
    case 'cartao':
      return 'Compartilhar'
    default:
      return ''
  }
}

function QuizCarregado({ id }: { id: IdEleicao }) {
  const dados = use(carregarQuiz(id))
  const { estado, enviar, voltar, reiniciar } = useFluxo(dados)
  const [anuncio, setAnuncio] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [votacao, setVotacao] = useState<EstadoVotacao>(SEM_API)
  const leuVotacao = useRef(false)
  const tipo = estado.etapa.tipo

  // limpa e escreve de novo, para o leitor de tela repetir mensagens iguais; a última vence
  const timerAnuncio = useRef<number | undefined>(undefined)
  const anunciar = useCallback((mensagem: string) => {
    setAnuncio('')
    window.clearTimeout(timerAnuncio.current)
    timerAnuncio.current = window.setTimeout(() => setAnuncio(mensagem), 40)
  }, [])

  const timerToast = useRef<number | undefined>(undefined)
  const mostrarToast = useCallback((mensagem: string) => {
    setToast(mensagem)
    window.clearTimeout(timerToast.current)
    timerToast.current = window.setTimeout(() => setToast(null), 2400)
  }, [])
  useEffect(
    () => () => {
      window.clearTimeout(timerToast.current)
      window.clearTimeout(timerAnuncio.current)
    },
    [],
  )

  // dados em ondas: a aderência baixa durante as cenas; as evidências, só na revelação
  useEffect(() => {
    if (tipo !== 'abertura' && tipo !== 'perfil') carregarAderencia(id).catch(() => {})
    if (tipo === 'contagem' || tipo === 'revelacao' || tipo === 'cartao') carregarEvidencias(id).catch(() => {})
    if ((tipo === 'resultado' || tipo === 'voto') && !leuVotacao.current) {
      leuVotacao.current = true
      lerEstado().then(setVotacao)
    }
  }, [tipo, id])

  const titulo = tituloDaEtapa(estado)
  useEffect(() => {
    document.title = `${titulo ? `${titulo} · ` : ''}${dados.quiz.eleicao} · Combina?`
    return () => {
      document.title = 'Combina? · Eleições 2026'
    }
  }, [titulo, dados])

  const valor = useMemo<ValorFluxo>(
    () => ({ dados, estado, enviar, voltar, reiniciar, anunciar, mostrarToast, votacao }),
    [dados, estado, enviar, voltar, reiniciar, anunciar, mostrarToast, votacao],
  )

  const chave = chaveDaEtapa(estado.etapa)
  const et = estado.etapa
  let tela
  switch (et.tipo) {
    case 'abertura':
      tela = <Abertura />
      break
    case 'perfil':
      tela = <PerfilPasso key={chave} passo={et.passo} />
      break
    case 'prioridades':
      tela = <Prioridades />
      break
    case 'cena':
      tela = <Cena key={chave} indice={et.indice} />
      break
    case 'resumo':
      tela = <Resumo key={chave} cartao={et.cartao} />
      break
    case 'resultado':
      tela = <Resultado />
      break
    case 'voto':
      tela = <Voto />
      break
    case 'contagem':
      tela = <Contagem />
      break
    case 'revelacao':
      tela = <Revelacao />
      break
    case 'cartao':
      tela = <Cartao />
      break
  }

  return (
    <FluxoContexto.Provider value={valor}>
      <div className="app">
        <Suspense fallback={<Carregando texto="Comparando suas escolhas com as propostas…" />}>{tela}</Suspense>
        {/* o marco é da cena: não atravessa para o resultado */}
        <div className={`toast ${toast && tipo === 'cena' ? 'on' : ''}`} role="status">
          {tipo === 'cena' ? toast : null}
        </div>
        <div className="sr-only" aria-live="polite">
          {anuncio}
        </div>
      </div>
    </FluxoContexto.Provider>
  )
}
