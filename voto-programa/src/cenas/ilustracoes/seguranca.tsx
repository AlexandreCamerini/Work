import { Balao, Carro, Celular, Chao, Cone, Onibus, Pessoa, Quadro, Sobe, Sol } from './pecas'

/** operacao-policial: escola fechada, ônibus parado, gente checando o grupo do bairro. */
export function OperacaoPolicial() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="b" x="14" y="50" width="112" height="82" rx="3" />
      <path className="p" d="M8 52l62-26 62 26z" />
      <path className="c" d="M26 62h18v14H26zM61 62h18v14H61zM96 62h18v14H96z" />
      <path d="M20 94h100M28 132V94M42 132V94M56 132V94M70 132V94M84 132V94M98 132V94M112 132V94" />
      <rect className="g" x="64" y="106" width="14" height="11" rx="2" />
      <Onibus x={180} y={132} w={150} />
      <Cone x={166} />
      <Pessoa x={142} y={132} pose="celular" pele={4} cabelo="coque" roupa="g" />
      <Balao x={120} y={14} w={46} />
    </Quadro>
  )
}

/** via-expressa-fechada: pista bloqueada, carros parados, motorista olhando o celular. */
export function ViaExpressaFechada() {
  return (
    <Quadro>
      <Sol x={40} y={30} r={10} />
      <Chao y={104} />
      <path className="d" d="M-4 136H324" />
      <path d="M236 100v18M302 100v18" />
      <rect className="b" x="226" y="86" width="86" height="16" rx="3" />
      <path className="lg w" d="M240 90l-5 8M256 90l-5 8M272 90l-5 8M288 90l-5 8M304 90l-5 8" />
      <Cone x={214} y={124} />
      <Carro x={6} y={126} cls="p" />
      <Carro x={96} y={126} cls="g" />
      <Carro x={40} y={160} cls="b" />
      <Pessoa x={192} y={130} pose="celular" pele={2} cabelo="curto" roupa="p" />
    </Quadro>
  )
}

/** celular-roubado: no ponto de ônibus, a mão vazia onde estava o celular. */
export function CelularRoubado() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="p" x="176" y="36" width="136" height="10" rx="4" />
      <path d="M186 46v86M302 46v86" />
      <rect className="b" x="196" y="100" width="94" height="6" rx="3" />
      <path d="M144 132V56" />
      <circle className="g" cx="144" cy="50" r="11" />
      <rect className="b" x="139" y="45" width="10" height="9" rx="2" />
      <Pessoa x={96} y={132} pose="segura" pele={2} cabelo="longo" roupa="p">
        <Celular x={2} y={-49} cls="d" />
        <path className="lg" d="M14 -60l5-5M17 -50h7M-8 -62l-4-5" />
      </Pessoa>
      <Pessoa x={226} y={132} pose="sentada" pele={4} cabelo="grisalho" roupa="g" largo />
      <Pessoa x={272} y={132} s={0.95} pele={1} cabelo="bone" roupa="g" />
    </Quadro>
  )
}

/** celular-sinal: parado no sinal, a mão pela janela e o celular que sumiu. */
export function CelularSinal() {
  return (
    <Quadro>
      <path d="M284 140V72" />
      <rect className="t" x="270" y="18" width="28" height="56" rx="8" />
      <circle className="g" cx="284" cy="33" r="7" />
      <circle className="b" cx="284" cy="59" r="7" />
      <Chao y={140} />
      <path className="p" d="M-4 160V106a12 12 0 0 1 12-12h72l30-44h98l34 44h8a10 10 0 0 1 10 10v56z" />
      <path className="b" d="M114 96l20-38h66l24 38z" />
      <Pessoa x={170} y={96} s={0.95} pose="busto" pele={4} cabelo="curto" roupa="g" />
      <rect className="k4" x="176" y="82" width="44" height="7" rx="3.5" />
      <Celular x={228} y={78} cls="d" />
      <path className="lg" d="M238 64l5-5M242 76h7M224 60l-2-6" />
      <circle className="t" cx="52" cy="160" r="18" />
      <circle className="t" cx="230" cy="160" r="18" />
    </Quadro>
  )
}

/** roubo-carro: à noite, no portão de casa, de olho no retrovisor. */
export function RouboCarro() {
  return (
    <Quadro>
      <path className="b" d="M44 14a14 14 0 1 0 12 22a10 10 0 1 1-12-22z" />
      <path className="lb w" d="M90 22h0M120 40h0M300 14h0M152 14h0" />
      <path d="M154 132V44h16" />
      <path className="g" d="M162 44h16l-4 8h-8z" />
      <rect className="b" x="186" y="56" width="128" height="76" rx="3" />
      <path className="p" d="M180 58l70-30 70 30z" />
      <rect className="c" x="204" y="80" width="88" height="52" rx="2" />
      <path className="f" d="M204 90h88M204 100h88M204 110h88M204 120h88" />
      <Chao y={132} />
      <Carro x={20} y={136} s={1.3} cls="p" />
      <circle className="h" cx="87" cy="91" r="6" />
      <circle className="k2" cx="88" cy="93" r="5" />
      <ellipse className="g" cx="110" cy="98" rx="4" ry="3" />
      <circle className="lg d f" cx="110" cy="98" r="9" />
    </Quadro>
  )
}

/** correria-praia (orla): fim de tarde na praia, gente correndo sem saber por quê. */
export function CorreriaPraia() {
  return (
    <Quadro>
      <Sol x={246} y={84} r={24} />
      <path className="p" d="M-4 84H324V112H-4z" />
      <path className="lb" d="M24 96q6-4 12 0t12 0M150 102q6-4 12 0t12 0M270 98q6-4 12 0" />
      <Chao y={108} />
      <path d="M60 140V58" />
      <path className="g" d="M22 66a38 24 0 0 1 76 0z" />
      <path className="lb" d="M48 64l6-20M72 64l-6-20" />
      <ellipse className="g" cx="112" cy="142" rx="8" ry="3.5" />
      <path className="f" d="M138 104h-14M142 116h-18M198 100h-14M202 112h-18M258 106h-14M262 118h-18" />
      <Pessoa x={166} y={144} s={0.85} pose="corre" pele={4} cabelo="crespo" roupa="g" />
      <Pessoa x={226} y={140} s={0.8} pose="corre" pele={1} cabelo="longo" roupa="p" />
      <Pessoa x={286} y={146} s={0.85} pose="corre" pele={3} cabelo="curto" roupa="b" />
    </Quadro>
  )
}

/** medida-protetiva / mulheres: vizinhas no portão, a medida na mão. */
export function MedidaProtetiva() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="b" x="198" y="66" width="110" height="66" rx="3" />
      <path className="p" d="M190 68l63-30 63 30z" />
      <rect className="g" x="244" y="100" width="18" height="32" rx="2" />
      <path className="c" d="M212 80h20v16h-20zM276 80h20v16h-20z" />
      <path d="M8 108h170M8 120h170M14 132v-30M42 132v-30M150 132v-30M178 132v-30" />
      <Pessoa x={78} y={132} pose="segura" pele={3} cabelo="tranca" roupa="g">
        <rect className="b" x="-6" y="-62" width="15" height="20" rx="2" />
        <circle className="p" cx="1.5" cy="-48" r="3" />
      </Pessoa>
      <Pessoa x={122} y={132} pele={1} cabelo="coque" roupa="p" largo />
      <Balao x={78} y={14} w={42} />
    </Quadro>
  )
}

/** faccao: taxa cobrada no gás e na internet do bairro. */
export function Faccao() {
  return (
    <Quadro>
      <path className="b" d="M-4 110Q60 30 150 48T324 30V170H-4z" />
      <path className="p" d="M20 82h22V64H20zM58 60h22V42H58zM98 52h20V34H98zM180 56h22V38h-22zM226 58h20V40h-20zM272 50h24V30h-24z" />
      <path className="g" d="M134 50h20V34h-20zM250 56h16V42h-16z" />
      <path className="c n" d="M26 70h6v6h-6zM64 48h6v6h-6zM186 44h6v6h-6zM278 36h6v6h-6z" />
      <Chao y={136} />
      <rect className="p" x="52" y="100" width="40" height="36" rx="12" />
      <rect className="p" x="64" y="92" width="16" height="10" rx="3" />
      <path d="M60 92a12 8 0 0 1 24 0" />
      <circle className="g" cx="112" cy="82" r="9" />
      <Sobe x={124} y={70} t={12} />
      <path d="M206 116v-18M246 116v-18" />
      <rect className="t" x="198" y="116" width="56" height="20" rx="5" />
      <path className="lp" d="M214 100a16 16 0 0 1 24 0M220 106a8 8 0 0 1 12 0" />
      <path className="lg w" d="M210 126h0M220 126h0" />
      <circle className="g" cx="274" cy="100" r="9" />
      <Sobe x={286} y={88} t={12} />
    </Quadro>
  )
}
