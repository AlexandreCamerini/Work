import { Agua, Chao, Pessoa, Predio, Quadro, Relogio, Sobe, Sol } from './pecas'

/** fila-especialista: sala de espera, relógio e painel de senha. */
export function FilaEspecialista() {
  return (
    <Quadro>
      <Chao y={132} />
      <Relogio x={150} y={34} r={14} />
      <rect className="t" x="234" y="20" width="60" height="26" rx="6" />
      <path className="lb w" d="M252 33h0M264 33h0M276 33h0" />
      <path d="M44 110v22M160 110v22M276 110v22" />
      <rect className="p" x="30" y="102" width="260" height="8" rx="4" />
      <Pessoa x={62} y={132} pose="sentada" pele={2} cabelo="grisalho" roupa="g" largo>
        <path d="M26 0l-4-36" />
      </Pessoa>
      <Pessoa x={158} y={132} pose="sentada" pele={4} cabelo="careca" roupa="b" largo />
      <Pessoa x={208} y={132} pose="sentada" pele={1} cabelo="longo" roupa="p" />
      <Pessoa x={256} y={132} pose="sentada" pele={3} cabelo="coque" roupa="g" />
    </Quadro>
  )
}

/** fila-sus (cirurgia): corredor de hospital, maca vazia e ampulheta. */
export function FilaSus() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="b" x="190" y="34" width="44" height="98" rx="3" />
      <rect className="c" x="202" y="46" width="20" height="16" rx="2" />
      <circle className="p" cx="212" cy="20" r="9" />
      <path className="lb" d="M212 15v10M207 20h10" />
      <path d="M252 106v22M312 106v22" />
      <circle className="t" cx="252" cy="130" r="3" />
      <circle className="t" cx="312" cy="130" r="3" />
      <rect className="b" x="244" y="96" width="80" height="10" rx="4" />
      <rect className="c" x="252" y="88" width="24" height="9" rx="4" />
      <path d="M56 108v24M84 108v24" />
      <rect className="p" x="44" y="68" width="7" height="40" rx="3" />
      <rect className="p" x="46" y="102" width="42" height="7" rx="3" />
      <Pessoa x={62} y={132} pose="sentada" pele={4} cabelo="grisalho" roupa="g" />
      <Pessoa x={134} y={132} pose="segura" pele={2} cabelo="curto" roupa="p" largo>
        <rect className="b" x="-5" y="-60" width="15" height="19" rx="2" />
      </Pessoa>
      <path className="b" d="M152 16h22l-11 15 11 15h-22l11-15z" />
      <path className="g f" d="M157 43h12l-6-7z" />
    </Quadro>
  )
}

/** saude-interior: van de madrugada a caminho da capital. */
export function SaudeInterior() {
  return (
    <Quadro>
      <path className="lb w" d="M40 26h0M92 16h0M150 30h0M206 14h0M300 44h0M236 36h0" />
      <path className="b" d="M268 12a16 16 0 1 0 14 26a12 12 0 1 1-14-26z" />
      <Predio x={232} y={112} w={26} h={40} cls="p" jan="g" />
      <Predio x={260} y={112} w={30} h={58} cls="p" jan="g" />
      <Predio x={292} y={112} w={28} h={46} cls="p" jan="g" />
      <Chao y={112} />
      <path className="d" d="M-4 146H324" />
      <path className="b" d="M26 140V88a8 8 0 0 1 8-8h104l30 28a6 6 0 0 1 2 5v27z" />
      <path className="c" d="M38 88h32v24H38zM78 88h32v24H78zM118 88h20l20 24h-40z" />
      <Pessoa x={55} y={112} s={0.62} pose="busto" pele={3} cabelo="lenco" roupa="g" />
      <Pessoa x={94} y={112} s={0.62} pose="busto" pele={1} cabelo="grisalho" roupa="p" />
      <path className="lg w" d="M32 124h132" />
      <circle className="t" cx="60" cy="140" r="9" />
      <circle className="t" cx="142" cy="140" r="9" />
    </Quadro>
  )
}

/** plano-voltou-sus: plano que encarece, a caminho do posto. */
export function PlanoVoltouSus() {
  return (
    <Quadro>
      <Chao y={132} />
      <g transform="rotate(-10 64 64)">
        <rect className="g" x="22" y="40" width="84" height="54" rx="8" />
        <path className="lb w" d="M38 67h18M47 58v18" />
        <path className="f" d="M68 58h26M68 68h22M68 78h24" />
      </g>
      <Sobe x={98} y={40} />
      <Pessoa x={150} y={132} pele={2} cabelo="grisalho" roupa="p">
        <path d="M24 0l-3-38" />
      </Pessoa>
      <rect className="b" x="206" y="60" width="100" height="72" rx="3" />
      <rect className="p" x="200" y="50" width="112" height="16" rx="5" />
      <circle className="b" cx="256" cy="58" r="11" />
      <path className="lp w" d="M256 52v12M250 58h12" />
      <rect className="g" x="244" y="102" width="24" height="30" rx="2" />
      <path className="c" d="M216 78h18v14h-18zM278 78h18v14h-18z" />
    </Quadro>
  )
}

/** especialista-longe: dias de barco até a capital. */
export function EspecialistaLonge() {
  return (
    <Quadro>
      <Sol x={276} y={30} r={12} />
      <path
        className="p"
        d="M-4 98V76q12-16 26-4q12-18 28-4q14-14 28 0q12-16 28-2q14-14 28 0q14-16 28-2q14-14 28 0q14-16 28-2q14-12 28 0q12-14 26-2q14-12 26 2V98z"
      />
      <Agua y={98} cls="b" />
      <path className="lp f" d="M20 112q6-4 12 0t12 0M230 108q6-4 12 0t12 0M250 128q6-4 12 0t12 0M10 140q6-4 12 0" />
      <path d="M-4 98H324" />
      <path className="b" d="M40 118h176l-16 20H56z" />
      <rect className="g" x="60" y="94" width="132" height="24" rx="3" />
      <path className="c" d="M68 100h24v12H68zM100 100h24v12h-24zM132 100h24v12h-24zM164 100h20v12h-20z" />
      <path className="f" d="M70 104q10 7 20 0M102 104q10 7 20 0M134 104q10 7 20 0" />
      <path d="M76 66v28M176 66v28" />
      <Pessoa x={124} y={94} s={0.7} pose="busto" pele={3} cabelo="grisalho" roupa="b" />
      <rect className="p" x="68" y="60" width="116" height="7" rx="3" />
    </Quadro>
  )
}
