import { useRef, type ReactNode } from 'react'
import type { TipoEtapa } from '../fluxo/maquina'
import { useRolavelFocavel } from './useRolavel'

interface TelaProps {
  etapa: TipoEtapa
  topo?: ReactNode
  rodape?: ReactNode
  children: ReactNode
  className?: string
  /** Sentido da animação de entrada do conteúdo. */
  animar?: 'frente' | 'tras' | null
  rotulo?: string
}

/** Casca de todas as telas do fluxo: topo (44 px), meio e doca fixa com área segura. */
export function Tela({ etapa, topo, rodape, children, className = '', animar, rotulo }: TelaProps) {
  const meio = useRef<HTMLElement>(null)
  useRolavelFocavel(meio)
  return (
    <div className={`tela ${className}`}>
      <header className="topo">{topo}</header>
      <main ref={meio} id="meio" className={`meio ${animar ? `entra-${animar}` : ''}`} data-etapa={etapa} aria-label={rotulo}>
        {children}
      </main>
      {rodape ? <footer className="doca">{rodape}</footer> : <div />}
    </div>
  )
}

interface SegmentosProps {
  total: number
  atual: number
  rotulo: string
  texto: string
  /** Segmentos já feitos (padrão: os anteriores ao atual). */
  feitos?: (i: number) => boolean
}

export function Segmentos({ total, atual, rotulo, texto, feitos = (i) => i < atual }: SegmentosProps) {
  return (
    <div
      className="segmentos"
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={atual + 1}
      aria-valuetext={texto}
      data-testid="progresso"
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={feitos(i) ? 'feito' : i === atual ? 'atual' : ''} />
      ))}
    </div>
  )
}
