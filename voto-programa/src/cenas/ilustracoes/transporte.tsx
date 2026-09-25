import { Arvore, Carro, Chao, Moedas, Nuvem, Onibus, Pessoa, Predio, Quadro, Relogio, Sobe, Sol } from './pecas'

/** trem-parado: vagão lotado, porta que não fecha. */
export function TremParado() {
  return (
    <Quadro>
      <Sol x={298} y={20} r={10} />
      <Chao y={132} />
      <rect className="p" x="14" y="36" width="292" height="88" rx="14" />
      <path className="b" d="M26 50h76v34h-76zM218 50h76v34h-76z" />
      <Pessoa x={44} y={83} s={0.75} pose="busto" pele={2} cabelo="coque" roupa="g" />
      <Pessoa x={66} y={83} s={0.75} pose="busto" pele={4} cabelo="careca" roupa="b" />
      <Pessoa x={88} y={83} s={0.75} pose="busto" pele={1} cabelo="longo" roupa="g" />
      <Pessoa x={236} y={83} s={0.75} pose="busto" pele={3} cabelo="bone" roupa="g" />
      <Pessoa x={258} y={83} s={0.75} pose="busto" pele={1} cabelo="grisalho" roupa="b" largo />
      <Pessoa x={280} y={83} s={0.75} pose="busto" pele={4} cabelo="tranca" roupa="g" />
      <rect className="b" x="118" y="46" width="84" height="78" rx="3" />
      <Pessoa x={138} y={124} s={0.82} pele={3} cabelo="crespo" roupa="g" />
      <Pessoa x={181} y={124} s={0.82} pele={4} cabelo="coque" roupa="g" />
      <Pessoa x={160} y={124} s={0.82} pele={1} cabelo="curto" roupa="p" largo />
      <path className="g" d="M110 46h10v78h-10zM200 46h10v78h-10z" />
      <path className="lg w" d="M22 106h82M216 106h82" />
      <circle className="t" cx="46" cy="126" r="6" />
      <circle className="t" cx="84" cy="126" r="6" />
      <circle className="t" cx="236" cy="126" r="6" />
      <circle className="t" cx="274" cy="126" r="6" />
    </Quadro>
  )
}

/** estrada-interior: estrada com buraco, sem acostamento; ponto com relógio. */
export function EstradaInterior() {
  return (
    <Quadro>
      <Nuvem x={74} y={40} s={0.8} />
      <path className="b" d="M-4 92Q50 50 120 84T240 78T330 70V170H-4z" />
      <Arvore x={52} y={80} s={0.6} />
      <Arvore x={226} y={80} s={0.6} />
      <path className="p" d="M150 86h20l90 80H60z" />
      <path className="lb d" d="M160 92V160" />
      <ellipse className="c" cx="128" cy="130" rx="11" ry="4" />
      <ellipse className="c" cx="196" cy="146" rx="13" ry="4" />
      <ellipse className="c" cx="170" cy="108" rx="6" ry="2.5" />
      <Pessoa x={250} y={150} s={0.8} pele={4} cabelo="grisalho" roupa="g" largo />
      <path d="M288 150V88" />
      <circle className="g" cx="288" cy="84" r="12" />
      <path d="M288 78v6h5" />
    </Quadro>
  )
}

/** barca-leste: barca na água, fila que dobra a estação, ponte parada ao fundo. */
export function BarcaLeste() {
  return (
    <Quadro>
      <path className="b" d="M-4 40h328v8H-4z" />
      <path d="M40 48v46M120 48v46M200 48v46M280 48v46" />
      <path className="g f" d="M12 33h12v7H12zM44 33h12v7H44zM76 33h12v7H76zM108 33h12v7h-12zM140 33h12v7h-12z" />
      <path className="p f" d="M28 33h12v7H28zM60 33h12v7H60zM92 33h12v7H92zM124 33h12v7h-12zM156 33h12v7h-12z" />
      <path className="p" d="M-4 94q6-5 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0V170H-4z" />
      <rect className="p" x="50" y="70" width="98" height="8" rx="3" />
      <rect className="b" x="44" y="78" width="110" height="26" rx="4" />
      <path className="c" d="M54 85h14v10H54zM78 85h14v10H78zM102 85h14v10h-14zM126 85h14v10h-14z" />
      <path className="g" d="M24 104h150l-14 20H38z" />
      <path d="M204 120v40M240 120v40M276 120v40M312 120v40" />
      <path className="b" d="M192 112h132v8H192z" />
      <rect className="p" x="200" y="50" width="124" height="10" rx="4" />
      <path d="M206 60v52" />
      <Relogio x={258} y={38} r={10} />
      <Pessoa x={218} y={112} s={0.7} pele={1} cabelo="coque" roupa="g" />
      <Pessoa x={240} y={112} s={0.7} pele={4} cabelo="curto" roupa="p" largo />
      <Pessoa x={262} y={112} s={0.7} pele={2} cabelo="longo" roupa="g" />
      <Pessoa x={284} y={112} s={0.7} pele={3} cabelo="bone" roupa="b" />
      <Pessoa x={306} y={112} s={0.7} pele={1} cabelo="grisalho" roupa="g" />
    </Quadro>
  )
}

/** transito-carro: via expressa parada no fim de tarde. */
export function TransitoCarro() {
  return (
    <Quadro>
      <Sol x={250} y={58} r={20} />
      <Predio x={16} y={100} w={44} h={56} cls="p" jan="b" />
      <Predio x={64} y={100} w={34} h={40} cls="p" jan="b" />
      <Predio x={282} y={100} w={36} h={62} cls="p" jan="b" />
      <Chao y={100} />
      <path className="d" d="M-4 124H324" />
      <Carro x={4} y={120} s={0.75} cls="p" />
      <Carro x={70} y={120} s={0.75} cls="g" />
      <Carro x={136} y={120} s={0.75} cls="b" />
      <Carro x={202} y={120} s={0.75} cls="p" />
      <Carro x={268} y={120} s={0.75} cls="g" />
      <Carro x={-34} y={152} s={0.9} cls="g" />
      <Carro x={42} y={152} s={0.9} cls="b" />
      <Carro x={118} y={152} s={0.9} cls="p" />
      <Carro x={194} y={152} s={0.9} cls="g" />
      <Carro x={270} y={152} s={0.9} cls="b" />
    </Quadro>
  )
}

/** passagem-cara: moedas que sobem no ponto de ônibus. */
export function PassagemCara() {
  return (
    <Quadro>
      <Chao y={132} />
      <path d="M34 132V50" />
      <circle className="g" cx="34" cy="44" r="12" />
      <rect className="b" x="28" y="38" width="12" height="10" rx="2" />
      <Pessoa x={78} y={132} pele={3} cabelo="crespo" roupa="g" pose="segura">
        <ellipse className="g" cx="2" cy="-43" rx="7" ry="3" />
        <ellipse className="g" cx="2" cy="-48" rx="7" ry="3" />
      </Pessoa>
      <Moedas x={120} y={132} n={4} r={12} />
      <Sobe x={136} y={100} />
      <Onibus x={162} y={132} w={150} />
    </Quadro>
  )
}

/** vale-transporte: cartão de transporte que pesa na folha. */
export function ValeTransporte() {
  return (
    <Quadro>
      <Chao y={132} />
      <g transform="rotate(-8 78 70)">
        <rect className="p" x="26" y="36" width="104" height="66" rx="10" />
        <rect className="g" x="40" y="52" width="18" height="14" rx="3" />
        <rect className="b" x="78" y="56" width="38" height="22" rx="5" />
        <path className="f" d="M84 62h26" />
        <circle className="t" cx="86" cy="80" r="3" />
        <circle className="t" cx="108" cy="80" r="3" />
      </g>
      <Moedas x={58} y={132} n={2} />
      <Moedas x={96} y={132} n={4} />
      <Sobe x={116} y={112} />
      <Pessoa x={204} y={132} pele={4} cabelo="curto" roupa="p" largo />
      <Pessoa x={262} y={132} pele={1} cabelo="coque" roupa="g" pose="segura">
        <rect className="p" x="-7" y="-50" width="16" height="11" rx="2" />
      </Pessoa>
    </Quadro>
  )
}
