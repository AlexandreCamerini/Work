import { createContext, useContext } from 'react'
import type { DadosQuiz } from '../data'
import type { EstadoVotacao } from '../lib/votacao'
import type { EstadoFluxo, Evento } from './maquina'

export interface ValorFluxo {
  dados: DadosQuiz
  estado: EstadoFluxo
  enviar: (e: Evento) => void
  voltar: () => void
  reiniciar: () => void
  /** Mensagem para leitor de tela (aria-live educado). */
  anunciar: (mensagem: string) => void
  /** Marco sobre a barra de progresso ("Metade!"). */
  mostrarToast: (mensagem: string) => void
  votacao: EstadoVotacao
}

export const FluxoContexto = createContext<ValorFluxo | null>(null)

export function useFluxoCtx(): ValorFluxo {
  const v = useContext(FluxoContexto)
  if (!v) throw new Error('useFluxoCtx fora do FluxoContexto')
  return v
}
