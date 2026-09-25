import { Agua, Carro, Casa, Chao, Chuva, Nuvem, Papel, Pessoa, Predio, Quadro, Sobe, Sol } from './pecas'

/** rua-alagada: a rua cheia de novo, geladeira boiando. */
export function RuaAlagada() {
  return (
    <Quadro>
      <Nuvem x={232} y={44} s={1.1} />
      <Chuva x={206} y={54} w={80} />
      <Chao />
      <Casa x={20} w={100} h={70} />
      <rect className="b" x="74" y="80" width="30" height="24" rx="2" />
      <Pessoa x={89} y={104} s={0.6} pose="busto" pele={1} cabelo="grisalho" roupa="g" />
      <Carro x={146} cls="g" />
      <g transform="rotate(-18 262 112)">
        <rect className="b" x="248" y="86" width="28" height="44" rx="4" />
        <path d="M248 102h28M270 92v6M270 108v10" />
      </g>
      <Agua y={116} cls="p o" />
    </Quadro>
  )
}

/** encosta-serra: três dias de chuva, rachadura na encosta atrás da rua. */
export function EncostaSerra() {
  return (
    <Quadro>
      <Nuvem x={96} y={40} />
      <Nuvem x={258} y={36} s={0.9} />
      <path className="b" d="M-4 140V96Q40 50 110 40T240 30Q290 30 324 50V140z" />
      <path className="p" d="M32 72h18V58l-9-8-9 8zM68 56h18V42l-9-8-9 8zM124 46h18V32l-9-8-9 8zM196 42h18V28l-9-8-9 8zM246 40h18V26l-9-8-9 8z" />
      <path className="g" d="M160 42h16V30l-8-7-8 7z" />
      <path className="w" d="M150 52l-8 14 10 8-10 14 8 10-6 14" />
      <Chuva x={64} y={50} w={70} n={5} />
      <Chuva x={228} y={46} w={64} n={5} />
      <Chao />
      <Casa x={196} w={50} h={30} />
      <Casa x={256} w={50} h={34} cls="b" teto="g" porta="p" />
    </Quadro>
  )
}

/** garagem-alagada: a garagem do prédio encheu, carro debaixo d'água. */
export function GaragemAlagada() {
  return (
    <Quadro>
      <Nuvem x={70} y={44} s={1.2} />
      <Chuva x={40} y={56} w={80} />
      <Predio x={150} y={130} w={152} h={120} />
      <rect className="t" x="178" y="94" width="96" height="36" rx="3" />
      <Chao y={130} />
      <Carro x={186} y={132} cls="g" />
      <Pessoa x={96} y={136} pose="segura" pele={4} cabelo="coque" roupa="g">
        <path d="M2 -40v-40" />
        <path className="p" d="M-24 -80a26 16 0 0 1 52 0z" />
      </Pessoa>
      <Agua y={108} cls="p o" />
    </Quadro>
  )
}

/** falta-agua: torneira seca, balde vazio, conta mais cara. */
export function FaltaAgua() {
  return (
    <Quadro>
      <Chao y={124} />
      <path d="M66 36v4" />
      <rect className="g" x="56" y="28" width="20" height="8" rx="4" />
      <path className="p" d="M30 40h66a10 10 0 0 1 10 10v16H94V52H30z" />
      <path className="lp d f" d="M100 76q-6 9 0 13t0-13z" />
      <path className="b" d="M76 100h48l-6 26h-36z" />
      <path d="M80 100q20-26 40 0" />
      <g transform="rotate(6 222 76)">
        <Papel x={186} y={26} w={72} h={94} />
        <path className="lg w" d="M196 104h30" />
      </g>
      <circle className="g" cx="270" cy="118" r="12" />
      <Sobe x={270} y={62} />
    </Quadro>
  )
}

/** caminhao-pipa: caminhão-pipa no prédio e a cota extra no boleto. */
export function CaminhaoPipa() {
  return (
    <Quadro>
      <Predio x={14} w={100} h={120} />
      <Chao />
      <Papel x={126} y={14} w={54} h={62} barras />
      <circle className="g" cx="184" cy="20" r="9" />
      <Sobe x={196} y={36} t={12} />
      <path className="lp w" d="M196 118q-40 22-86 8" />
      <rect className="b" x="184" y="80" width="126" height="40" rx="20" />
      <path className="p" d="M247 88q-8 12 0 17t0-17z" />
      <path className="p" d="M150 128V98a6 6 0 0 1 6-6h26v36z" />
      <path className="b" d="M158 98h18v14h-22z" />
      <rect className="t" x="146" y="120" width="166" height="8" rx="3" />
      <circle className="t" cx="170" cy="130" r="9" />
      <circle className="t" cx="284" cy="130" r="9" />
    </Quadro>
  )
}

/** clima (enchente-seca): de um lado a enchente, do outro a seca. */
export function Clima() {
  return (
    <Quadro>
      <Nuvem x={70} y={44} s={1.1} />
      <Chuva x={40} y={54} w={80} />
      <Chao y={124} />
      <Casa x={36} y={124} w={66} h={42} />
      <Agua y={104} x0={-4} x1={164} cls="p o" />
      <Sol x={262} y={46} r={22} />
      <path className="f" d="M184 132l10 6-4 10M220 128l6 10 12 2M262 136l-8 10M288 128l10 8" />
      <path d="M232 124v-18M232 112l-8-7M232 116l7-5" />
      <path className="d" d="M164 14V150" />
    </Quadro>
  )
}

/** enchente-sul: marca d'água na parede, casa sendo refeita, alerta no celular. */
export function EnchenteSul() {
  return (
    <Quadro>
      <Nuvem x={262} y={40} />
      <Chao />
      <Casa x={16} w={90} h={60} />
      <Casa x={126} w={76} h={52} teto="g" porta="p" />
      <path className="lp d" d="M16 106h90M126 106h76" />
      <Pessoa x={234} pose="segura" pele={1} cabelo="longo" roupa="g" espelha>
        <path d="M-2 -40l12-16" />
        <rect className="p" x="4" y="-66" width="18" height="8" rx="3" />
      </Pessoa>
      <rect className="t" x="264" y="60" width="30" height="48" rx="6" />
      <rect className="b n" x="268" y="66" width="22" height="32" rx="2" />
      <path className="g f" d="M279 72l8 14h-16z" />
      <path className="f" d="M279 77v4" />
    </Quadro>
  )
}

/** fumaca-queimada: fumaça sobre a cidade, rio tão baixo que o barco encalha. */
export function FumacaQueimada() {
  return (
    <Quadro>
      <Sol x={236} y={48} r={16} />
      <Predio x={12} y={126} w={40} h={70} cls="p" jan="b" />
      <Predio x={56} y={126} w={30} h={50} cls="p" jan="b" />
      <Predio x={90} y={126} w={44} h={86} cls="p" jan="b" />
      <Predio x={160} y={126} w={36} h={60} cls="p" jan="b" />
      <Predio x={200} y={126} w={48} h={76} cls="p" jan="b" />
      <Predio x={252} y={126} w={30} h={52} cls="p" jan="b" />
      <Predio x={286} y={126} w={34} h={66} cls="p" jan="b" />
      <path className="b n o" d="M-4 36q40-12 80 0t80 0 80 0 88 0V58q-40 12-80 0t-80 0-80 0-88 0z" />
      <path className="b n o" d="M-4 78q40-12 80 0t80 0 80 0 88 0V98q-40 12-80 0t-80 0-80 0-88 0z" />
      <Chao y={126} />
      <path className="p" d="M-4 148q80-8 160 0t168 0V170H-4z" />
      <g transform="rotate(-8 120 132)">
        <path d="M106 128v-10h24v10" />
        <path className="g" d="M90 128h60l-8 10h-44z" />
      </g>
    </Quadro>
  )
}

/** seca-nordeste: açude seco, carro-pipa uma vez por semana. */
export function SecaNordeste() {
  return (
    <Quadro>
      <Sol x={56} y={40} r={22} />
      <Chao y={104} />
      <ellipse className="c" cx="110" cy="128" rx="80" ry="14" />
      <path className="f" d="M60 128l14-4 10 6M100 120l6 8-8 6M140 124l14 4M160 132l-10 4" />
      <path className="p" d="M20 104V66a6 6 0 0 1 12 0v38zM20 90h-6a4 4 0 0 1-4-4V74a4 4 0 0 1 8 0v8h2zM32 84h4v-10a4 4 0 0 1 8 0v12a4 4 0 0 1-4 4h-8z" />
      <rect className="b" x="220" y="66" width="76" height="26" rx="13" />
      <path className="p" d="M258 71q-5 8 0 11t0-11z" />
      <path className="p" d="M296 92V72h14a4 4 0 0 1 4 4v16z" />
      <rect className="t" x="218" y="92" width="98" height="6" rx="3" />
      <circle className="t" cx="236" cy="100" r="6" />
      <circle className="t" cx="298" cy="100" r="6" />
      <Pessoa x={196} y={146} s={0.9} pele={3} cabelo="coque" roupa="g">
        <path d="M13 -24q7-9 14 0" />
        <path className="b" d="M12 -24h16l-3 16h-10z" />
      </Pessoa>
    </Quadro>
  )
}
