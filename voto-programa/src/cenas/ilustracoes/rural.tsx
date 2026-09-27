import { Arvore, Casa, Chao, Nuvem, Pessoa, Quadro, Sol } from './pecas'

/** Moto de lado, rodas no chão y, frente à direita. */
function Moto({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="b" cx="-26" cy="-11" r="11" />
      <circle className="b" cx="26" cy="-11" r="11" />
      <path className="g" d="M-20 -24h30l10 8H-14z" />
      <path d="M-26 -11L-14 -24M26 -11L18 -34h8M10 -24l8-10" />
    </g>
  )
}

/** Fileiras de plantação entre x0 e x1, a partir de y. */
function Roca({ x0, x1, y, seca }: { x0: number; x1: number; y: number; seca?: boolean }) {
  let d = ''
  for (let x = x0; x <= x1; x += 22) d += seca ? `M${x} ${y}l-4-10M${x} ${y}l5-8` : `M${x} ${y}v-14m0 6l-7-6m7 2l7-7`
  return <path className={seca ? 'f' : 'lp'} d={d} />
}

/** celular-estrada / assalto-estrada: estrada de terra, moto parada, a mão vazia. */
export function EstradaTerra() {
  return (
    <Quadro>
      <Nuvem x={250} y={36} s={0.8} />
      <path className="b" d="M-4 96Q80 70 160 90T330 84V170H-4z" />
      <Arvore x={40} y={92} s={0.7} />
      <Arvore x={286} y={88} s={0.6} />
      <path className="c" d="M120 90h40l110 80H0z" />
      <path className="f" d="M120 90L0 170M160 90L270 170" />
      <path className="f d" d="M134 100L104 160M146 100L176 160" />
      <path className="f" d="M70 150h6M210 140h5M150 120h4" />
      <Moto x={108} y={146} />
      <Pessoa x={176} y={150} s={0.9} pele={2} cabelo="bone" roupa="p" largo pose="segura">
        <path className="lg" d="M22 -44l6-6M26 -38l8-2" />
      </Pessoa>
    </Quadro>
  )
}

/** jornada-roca / primo-roca: diária na lavoura, sol a pino, casa do sítio ao fundo. */
export function Lavoura() {
  return (
    <Quadro>
      <Sol x={58} y={38} r={18} />
      <Casa x={236} y={100} w={62} h={36} />
      <Chao y={100} cls="b" />
      <Roca x0={20} x1={200} y={120} />
      <Roca x0={30} x1={210} y={146} />
      <Pessoa x={150} y={150} s={0.95} pele={4} cabelo="bone" roupa="g" largo>
        <path d="M14 -40l22 44M30 0h14" />
      </Pessoa>
      <Pessoa x={250} y={150} s={0.85} pele={3} cabelo="lenco" roupa="p" />
    </Quadro>
  )
}

/** seca-lavoura: a roça que secou, chão rachado e o céu sem nuvem. */
export function LavouraSeca() {
  return (
    <Quadro>
      <Sol x={250} y={42} r={24} />
      <Chao y={98} cls="b" />
      <path className="f" d="M30 120l16-6 10 8M90 132l12-10 14 4M170 118l8 10-10 6M230 130l14-6" />
      <Roca x0={24} x1={180} y={112} seca />
      <Roca x0={36} x1={190} y={140} seca />
      <path className="w" d="M292 98V58M292 72l-14-12M292 66l12-14M278 60l-4-8M304 52l6-4" />
      <Pessoa x={236} y={150} s={0.95} pele={1} cabelo="grisalho" roupa="p" largo>
        <path d="M-14 -38q-6 10 2 16" />
      </Pessoa>
    </Quadro>
  )
}
