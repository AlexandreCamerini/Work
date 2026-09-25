import { Chao, Papel, Pessoa, Quadro, Relogio } from './pecas'

/** escola-bagunca: quadro rabiscado, mesa do professor vazia, bolinha de papel voando. */
export function EscolaBagunca() {
  return (
    <Quadro>
      <Chao />
      <rect className="p" x="28" y="18" width="160" height="70" rx="6" />
      <path className="lb" d="M44 36q8-10 16 0t16 0 16 0M44 58l10-8 10 8 10-8 10 8M120 34c24 0 32 30 52 10M122 70h40" />
      <path d="M222 102v34M298 102v34" />
      <rect className="g" x="246" y="64" width="28" height="30" rx="5" />
      <rect className="b" x="212" y="92" width="96" height="10" rx="3" />
      <rect className="p" x="226" y="84" width="18" height="8" rx="2" />
      <path className="d" d="M96 94q24-40 56-14" />
      <circle className="b" cx="154" cy="82" r="5" />
      <Pessoa x={68} y={122} s={0.85} pose="busto" pele={4} cabelo="crespo" roupa="g" />
      <Pessoa x={156} y={122} s={0.85} pose="busto" pele={1} cabelo="longo" roupa="p" />
      <rect className="b" x="34" y="120" width="68" height="8" rx="3" />
      <rect className="b" x="122" y="120" width="68" height="8" rx="3" />
    </Quadro>
  )
}

/** escola (largar a escola): de um lado a escola, do outro o trabalho. */
export function Escola() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="b" x="14" y="58" width="96" height="74" rx="3" />
      <path className="p" d="M8 60l54-26 54 26z" />
      <Relogio x={62} y={76} r={8} />
      <path className="c" d="M24 70h18v14H24zM82 70h18v14H82z" />
      <rect className="g" x="52" y="104" width="20" height="28" rx="2" />
      <rect className="b" x="212" y="64" width="96" height="68" rx="3" />
      <path className="g" d="M206 58h108v10a9 9 0 0 1-18 0a9 9 0 0 1-18 0a9 9 0 0 1-18 0a9 9 0 0 1-18 0a9 9 0 0 1-18 0a9 9 0 0 1-18 0z" />
      <rect className="c" x="222" y="88" width="40" height="24" rx="2" />
      <rect className="p" x="274" y="96" width="22" height="36" rx="2" />
      <rect className="p" x="140" y="70" width="22" height="28" rx="5" />
      <Pessoa x={160} y={132} pele={4} cabelo="crespo" roupa="g" />
      <path className="lp d" d="M144 146q-36 6-60-6" />
      <path className="lg d" d="M176 146q36 6 60-6" />
    </Quadro>
  )
}

/** pagar-faculdade: o capelo e a fila de boletos do financiamento. */
export function PagarFaculdade() {
  return (
    <Quadro>
      <Chao />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`rotate(${-10 + i * 6} ${168 + i * 34} 70)`}>
          <Papel x={140 + i * 34} y={26 + i * 4} w={54} h={74} barras />
        </g>
      ))}
      <Pessoa x={84} pele={4} cabelo="tranca" roupa="p" />
      <path className="t" d="M60 62l24-10 24 10-24 10z" />
      <path className="lg" d="M104 62v14" />
    </Quadro>
  )
}
