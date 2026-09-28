/**
 * Peças das ilustrações das cenas (guia em pipeline/ux/F-ilustracoes.md).
 *
 * Tudo é desenhado num quadro de 320×160 com cantos de 28. As cores vêm de classes curtas
 * definidas em src/index.css (bloco "ilustração da cena"), que apontam para os tokens da marca,
 * então o mesmo desenho funciona no claro e no escuro:
 *   c = petróleo suave (fundo)   p = petróleo   g = goiaba   b = papel (superfície)
 *   t = tinta (currentColor)     h/hg = cabelo escuro/grisalho   k1..k4 = tons de pele
 *   n = sem traço   lp/lg/lb = traço petróleo/goiaba/papel   d = tracejado   f = traço fino
 *   w = traço largo   o = meio transparente
 * Traço padrão: 3 unidades, pontas e junções redondas, na cor da tinta.
 */
import type { ReactNode } from 'react'

export type Pele = 1 | 2 | 3 | 4
export type Cabelo = 'curto' | 'longo' | 'crespo' | 'coque' | 'careca' | 'grisalho' | 'lenco' | 'bone' | 'tranca'
export type Pose = 'lado' | 'segura' | 'celular' | 'sentada' | 'busto' | 'corre'

/** Linha do chão padrão. */
export const CHAO = 136

/** Moldura comum: fundo suave com cantos redondos; o desenho é recortado nela. Decorativa. */
export function Quadro({ children }: { children: ReactNode }) {
  return (
    <svg className="ilu" viewBox="0 0 320 160" aria-hidden="true" focusable="false">
      <clipPath id="ilu-q">
        <rect x="4" y="4" width="312" height="152" rx="28" />
      </clipPath>
      <g clipPath="url(#ilu-q)">
        <rect className="c n" width="320" height="160" />
        {children}
      </g>
    </svg>
  )
}

/** Faixa de chão (calçada, areia, pista) de y até a base. */
export function Chao({ y = CHAO, cls = 'b' }: { y?: number; cls?: string }) {
  return <path className={cls} d={`M-4 ${y}H324V170H-4z`} />
}

/** Água com ondas de y até a base, entre x0 e x1. */
export function Agua({ y, x0 = -4, x1 = 324, cls = 'p' }: { y: number; x0?: number; x1?: number; cls?: string }) {
  let d = `M${x0} ${y}`
  for (let x = x0; x < x1; x += 24) d += 'q6-5 12 0t12 0'
  return <path className={cls} d={`${d}V170H${x0}z`} />
}

// cabelo em coordenadas da cabeça (centro 0,0, raio 9): [atrás da cabeça, na frente, classe]
const TOPO = 'M-9 0a9 9 0 0 1 18 0c-2-5-16-5-18 0z'
const CAB: Record<Cabelo, [string | null, string | null, string]> = {
  curto: [null, TOPO, 'h'],
  longo: ['M-11 0a11 11 0 0 1 22 0v14a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3z', TOPO, 'h'],
  crespo: ['M-14 -3a14 14 0 1 0 28 0a14 14 0 1 0-28 0z', 'M-9 0a9 9 0 0 1 18 0q-9-4-18 0z', 'h'],
  coque: ['M-5 -12a5 5 0 1 0 10 0a5 5 0 1 0-10 0z', TOPO, 'h'],
  careca: [null, null, 'h'],
  grisalho: [null, TOPO, 'hg'],
  lenco: [null, 'M-10 2a10 10 0 0 1 20 0z', 'g'],
  bone: [null, 'M-9.5 -1a9.5 9.5 0 0 1 19 0h7v3h-26z', 'p'],
  tranca: ['M6 -3h6v19a3 3 0 0 1-6 0z', TOPO, 'h'],
}

interface PessoaProps {
  x: number
  y?: number
  s?: number
  pele?: Pele
  cabelo?: Cabelo
  roupa?: string
  calca?: string
  pose?: Pose
  /** Corpo mais largo. */
  largo?: boolean
  /** Vira para a esquerda (importa em sentada e corre). */
  espelha?: boolean
  /** Só o contorno tracejado: lugar vago, pessoa que falta. */
  fantasma?: boolean
  /** Objetos na mão, em coordenadas da pessoa (pés em 0,0; mão da pose "segura" em 0,-39). */
  children?: ReactNode
}

/** Pessoa de frente, sem rosto: cabeça, cabelo, tronco, braços e pernas. Pés em (x, y). */
export function Pessoa({
  x,
  y = CHAO,
  s = 1,
  pele = 1,
  cabelo = 'curto',
  roupa = 'p',
  calca = 't',
  pose = 'lado',
  largo,
  espelha,
  fantasma,
  children,
}: PessoaProps) {
  const k = fantasma ? 'd' : `k${pele}`
  const r = fantasma ? 'd' : roupa
  const cl = fantasma ? 'd' : calca
  const w = largo ? 15 : 12
  const meio = 2 * w - 18
  const hy = pose === 'busto' ? -27 : -64
  const [atras, frente, ch] = fantasma ? [null, null, 'd'] : CAB[cabelo]
  const esc = s !== 1 || espelha ? ` scale(${espelha ? -s : s} ${s})` : ''
  const tronco = `M${-w} -26v-19a9 9 0 0 1 9-9h${meio}a9 9 0 0 1 9 9v19z`
  return (
    <g transform={`translate(${x} ${y})${esc}`}>
      {pose === 'busto' ? (
        <path className={r} d={`M${-w} 4v-12a9 9 0 0 1 9-9h${meio}a9 9 0 0 1 9 9v12z`} />
      ) : pose === 'corre' ? (
        <>
          <rect className={cl} x="-8" y="-30" width="8" height="30" rx="4" transform="rotate(32 -4 -28)" />
          <rect className={cl} x="0" y="-30" width="8" height="30" rx="4" transform="rotate(-30 4 -28)" />
          <rect className={k} x={-w - 6} y="-52" width="6" height="24" rx="3" transform={`rotate(-40 ${-w - 3} -50)`} />
          <rect className={k} x={w} y="-52" width="6" height="24" rx="3" transform={`rotate(40 ${w + 3} -50)`} />
          <path className={r} d={tronco} />
        </>
      ) : (
        <>
          <path className={cl} d={pose === 'sentada' ? 'M-9 -28h27v28h-7v-19h-20z' : 'M-9 -28h18v28h-7v-17h-4v17h-7z'} />
          <rect className={k} x={-w - 6} y="-52" width="6" height="26" rx="3" />
          {pose === 'segura' || pose === 'celular' ? (
            <rect className={k} x={w} y="-52" width="6" height="17" rx="3" />
          ) : (
            <rect className={k} x={w} y="-52" width="6" height="26" rx="3" />
          )}
          <path className={r} d={tronco} />
          {(pose === 'segura' || pose === 'celular') && <rect className={k} x="-3" y="-42" width={w + 9} height="6" rx="3" />}
        </>
      )}
      <g transform={`translate(0 ${hy})`}>
        {atras && <path className={ch} d={atras} />}
        <circle className={k} r="9" />
        {frente && <path className={ch} d={frente} />}
      </g>
      {pose === 'celular' && <Celular x={1} y={-47} />}
      {children}
    </g>
  )
}

/** Celular de pé, centro em (x, y). */
export function Celular({ x, y, cls = 't' }: { x: number; y: number; cls?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={cls} x="-6" y="-9" width="12" height="18" rx="3" />
      {cls !== 'd' && <rect className="b n" x="-3.5" y="-6" width="7" height="10" rx="1" />}
    </g>
  )
}

/** Ônibus de lado, rodas no chão y, frente à direita. */
export function Onibus({ x, y = CHAO, w = 130, cls = 'p' }: { x: number; y?: number; w?: number; cls?: string }) {
  const n = Math.floor((w - 34) / 24)
  let jan = ''
  for (let i = 0; i < n; i++) jan += `M${10 + i * 24} -45h18v16h-18z`
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={cls} y="-54" width={w} height="46" rx="9" />
      <path className="b" d={`${jan}M${w - 20} -45h11a3 3 0 0 1 3 3v18h-14z`} />
      <path d={`M6 -22H${w - 26}`} />
      <circle className="t" cx="24" cy="-8" r="8" />
      <circle className="t" cx={w - 28} cy="-8" r="8" />
    </g>
  )
}

/** Carro de lado (80 de largura), rodas no chão y, frente à direita. */
export function Carro({ x, y = CHAO, s = 1, cls = 'g', espelha }: { x: number; y?: number; s?: number; cls?: string; espelha?: boolean }) {
  const esc = s !== 1 || espelha ? ` scale(${espelha ? -s : s} ${s})` : ''
  return (
    <g transform={`translate(${x} ${y})${esc}`}>
      <path className={cls} d="M0 -10v-12a5 5 0 0 1 5-5h12l11-13h26l13 13h8a5 5 0 0 1 5 5v12z" />
      <path className="b" d="M22 -28l8-9h10v9zM46 -28v-9h7l9 9z" />
      <circle className="t" cx="18" cy="-9" r="8" />
      <circle className="t" cx="62" cy="-9" r="8" />
    </g>
  )
}

/** Prédio com janelas em grade; base no chão y. */
export function Predio({ x, y = CHAO, w, h, cls = 'b', jan = 'p' }: { x: number; y?: number; w: number; h: number; cls?: string; jan?: string }) {
  let d = ''
  for (let yy = -h + 10; yy <= -24; yy += 18) for (let xx = 9; xx + 9 <= w - 6; xx += 17) d += `M${xx} ${yy}h9v10h-9z`
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={cls} y={-h} width={w} height={h} rx="4" />
      {d && <path className={`${jan} n`} d={d} />}
    </g>
  )
}

/** Casa com telhado; base no chão y. */
export function Casa({ x, y = CHAO, w = 70, h = 44, cls = 'b', teto = 'p', porta = 'g' }: { x: number; y?: number; w?: number; h?: number; cls?: string; teto?: string; porta?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={cls} y={-h} width={w} height={h} rx="3" />
      <path className={teto} d={`M-6 ${-h}L${w / 2} ${-h - 24}L${w + 6} ${-h}z`} />
      <rect className={porta} x={w / 2 - 8} y="-26" width="16" height="26" rx="2" />
      <rect className="c" x="8" y={-h + 10} width="14" height="12" rx="2" />
    </g>
  )
}

/** Nuvem, base plana em (x, y). */
export function Nuvem({ x, y, s = 1, cls = 'b' }: { x: number; y: number; s?: number; cls?: string }) {
  return (
    <path
      className={cls}
      transform={`translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}`}
      d="M-28 0a10 10 0 0 1 0-20a16 16 0 0 1 30-6a12 12 0 0 1 22 10a8 8 0 0 1 2 16z"
    />
  )
}

/** Chuva: tracinhos inclinados numa faixa. */
export function Chuva({ x, y, w, n = 6, cls = 'lp' }: { x: number; y: number; w: number; n?: number; cls?: string }) {
  let d = ''
  for (let i = 0; i < n; i++) d += `M${x + Math.round((i * w) / n)} ${y + (i % 2) * 10}l-4 10`
  return <path className={cls} d={d} />
}

/** Árvore de copa redonda; base em (x, y). */
export function Arvore({ x, y = CHAO, s = 1 }: { x: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}`}>
      <path className="t" d="M-2 0v-24h4v24z" />
      <circle className="p" cy="-34" r="14" />
    </g>
  )
}

/** Papel (conta, boleto, formulário) com linhas; `barras` põe código de barras no pé. */
export function Papel({ x, y, w, h, barras, cls = 'b' }: { x: number; y: number; w: number; h: number; barras?: boolean; cls?: string }) {
  let d = ''
  for (let yy = 12; yy < h - (barras ? 26 : 8); yy += 10) d += `M8 ${yy}h${yy === 12 ? w / 2 - 8 : w - 16}`
  if (barras) for (let xx = 8; xx < w - 8; xx += 4) d += `M${xx} ${h - 16}v${xx % 12 === 0 ? 10 : 7}`
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={cls} width={w} height={h} rx="4" />
      <path className="f" d={d} />
    </g>
  )
}

/** Pilha de moedas vista de lado; base em (x, y). */
export function Moedas({ x, y, n = 3, r = 11 }: { x: number; y: number; n?: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} className="g" cx={x} cy={y - 4 - i * 6} rx={r} ry="4" />
      ))}
    </g>
  )
}

/** Seta que sobe (preço, custo). Pé em (x, y). */
export function Sobe({ x, y, t = 16 }: { x: number; y: number; t?: number }) {
  return <path className="lg w" d={`M${x} ${y}l${t} ${-t}m-9 0h9v9`} />
}

/** Relógio de parede. */
export function Relogio({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="b" r={r} />
      <path d={`M0 ${-r + 5}V0h${r - 5}`} />
    </g>
  )
}

/** Sol (goiaba). */
export function Sol({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return <circle className="g" cx={x} cy={y} r={r} />
}

/** Balão de conversa com três pontos; ponta embaixo à esquerda. */
export function Balao({ x, y, w = 44, cls = 'b' }: { x: number; y: number; w?: number; cls?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={cls} d={`M8 0h${w - 16}a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8h${-(w - 22)}l-8 7v-7a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8z`} />
      <path className="t w" d={`M${w / 2 - 9} 12h0M${w / 2} 12h0M${w / 2 + 9} 12h0`} />
    </g>
  )
}

/** Cone de trânsito; base em (x, y). */
export function Cone({ x, y = CHAO }: { x: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="g" d="M-12 0h24M-8 0l6-24h4l6 24z" />
      <path className="lb" d="M-4.5 -10h9" />
    </g>
  )
}
