import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import type { DadosQuiz } from '../data'
import {
  chaveDaEtapa,
  estadoInicial,
  passosDoPerfil,
  podeVoltar,
  reduzir,
  restaurar,
  type ContextoFluxo,
  type EstadoFluxo,
  type Evento,
} from './maquina'

interface EntradaHistorico {
  fluxo: string
  n: number
}

function entradaAtual(id: string): EntradaHistorico | null {
  const s = window.history.state as EntradaHistorico | null
  return s && s.fluxo === id && typeof s.n === 'number' ? s : null
}

function novaSemente() {
  return Math.floor(Math.random() * 4294967296)
}

function lerProgresso(chave: string, ctx: ContextoFluxo, passos: ReturnType<typeof passosDoPerfil>) {
  try {
    const bruto = sessionStorage.getItem(chave)
    return bruto ? restaurar(ctx, passos, JSON.parse(bruto)) : null
  } catch {
    return null
  }
}

/**
 * Liga a máquina (maquina.ts) ao navegador: sorteio, progresso no sessionStorage (nada sai do
 * aparelho) e histórico, para o Voltar do sistema fazer o mesmo que o ← da tela.
 */
export function useFluxo(dados: DadosQuiz) {
  const { id, quiz, candidatos } = dados
  const passos = useMemo(() => passosDoPerfil(!!quiz.regioes), [quiz])
  const ctx = useMemo<ContextoFluxo>(() => ({ perguntas: quiz.perguntas, candidatos: candidatos.map((c) => c.id) }), [quiz, candidatos])
  const chave = `combina:fluxo:${id}:${quiz.versao}`

  const [estado, despachar] = useReducer(
    (e: EstadoFluxo, ev: Evento) => reduzir(ctx, e, ev),
    undefined,
    () => lerProgresso(chave, ctx, passos) ?? estadoInicial(passos),
  )

  const enviar = useCallback((ev: Evento) => {
    despachar(ev.tipo === 'avancar' || ev.tipo === 'pular' ? { ...ev, semente: ev.semente ?? novaSemente() } : ev)
  }, [])

  // progresso no aparelho: recarregar a página volta na mesma tela
  useEffect(() => {
    try {
      sessionStorage.setItem(chave, JSON.stringify(estado))
    } catch {
      // modo privado ou armazenamento cheio: segue sem retomar
    }
  }, [estado, chave])

  // ---- histórico ----
  const estadoRef = useRef(estado)
  const nRef = useRef(0)
  const ultimaChave = useRef<string | null>(null)
  const chaveEtapa = chaveDaEtapa(estado.etapa)

  useLayoutEffect(() => {
    estadoRef.current = estado
  }, [estado])

  useEffect(() => {
    if (ultimaChave.current === null) {
      ultimaChave.current = chaveEtapa
      const atual = entradaAtual(id)
      if (atual) nRef.current = atual.n
      else window.history.replaceState({ fluxo: id, n: 0 } satisfies EntradaHistorico, '')
      return
    }
    if (ultimaChave.current === chaveEtapa) return
    ultimaChave.current = chaveEtapa
    if (estado.direcao === 'frente') {
      nRef.current += 1
      window.history.pushState({ fluxo: id, n: nRef.current } satisfies EntradaHistorico, '')
    }
  }, [chaveEtapa, estado.direcao, id])

  useEffect(() => {
    const aoNavegar = (e: PopStateEvent) => {
      const s = e.state as EntradaHistorico | null
      if (!s || s.fluxo !== id) return // saiu do fluxo: o App cuida da rota
      const indoParaTras = s.n < nRef.current
      nRef.current = s.n
      if (indoParaTras && podeVoltar(estadoRef.current)) despachar({ tipo: 'voltar' })
    }
    window.addEventListener('popstate', aoNavegar)
    return () => window.removeEventListener('popstate', aoNavegar)
  }, [id])

  /** ← da tela: passa pelo histórico quando há entrada, para os dois voltares ficarem iguais. */
  const voltar = useCallback(() => {
    if (!podeVoltar(estadoRef.current)) return
    const atual = entradaAtual(id)
    if (atual && atual.n > 0 && atual.n === nRef.current) window.history.back()
    else despachar({ tipo: 'voltar' })
  }, [id])

  const reiniciar = useCallback(() => {
    try {
      sessionStorage.removeItem(chave)
    } catch {
      // nada a limpar
    }
    despachar({ tipo: 'reiniciar' })
  }, [chave])

  return { estado, enviar, voltar, reiniciar, ctx }
}
