import { Arvore, Carro, Chao, Moedas, Papel, Pessoa, Predio, Quadro, Relogio, Sobe } from './pecas'

/** primo-desempregado: bico de entrega de bicicleta. */
export function PrimoDesempregado() {
  return (
    <Quadro>
      <Predio x={236} y={130} w={40} h={80} />
      <Predio x={280} y={130} w={40} h={56} cls="p" jan="b" />
      <Predio x={16} y={130} w={36} h={60} cls="p" jan="b" />
      <Chao y={130} />
      <circle className="b" cx="70" cy="112" r="17" />
      <circle className="b" cx="142" cy="112" r="17" />
      <path className="lg" d="M70 112L90 82H126L142 112M90 82L104 112H70M126 82L122 70h10M84 78h12" />
      <rect className="g" x="170" y="58" width="32" height="34" rx="4" />
      <Pessoa x={198} y={130} pele={3} cabelo="bone" roupa="p" largo />
    </Quadro>
  )
}

/** servidor-recomposicao: quatro anos de calendário à espera do reajuste. */
export function ServidorRecomposicao() {
  return (
    <Quadro>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`rotate(${-9 + i * 5} ${60 + i * 12} 70)`}>
          <rect className="b" x={28 + i * 12} y={30 + i * 6} width="60" height="68" rx="6" />
          <path className="p" d={`M${28 + i * 12} ${46 + i * 6}v-10a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v10z`} />
        </g>
      ))}
      <path className="f" d="M72 70h28M72 80h28M72 90h20" />
      <Relogio x={150} y={30} r={12} />
      <Pessoa x={226} y={104} s={1.15} pose="busto" pele={2} cabelo="curto" roupa="p" largo>
        <rect className="g" x="3" y="-9" width="7" height="9" rx="1.5" />
      </Pessoa>
      <rect className="b" x="130" y="100" width="180" height="10" rx="3" />
      <rect className="p" x="140" y="110" width="160" height="40" />
      <rect className="b" x="150" y="86" width="40" height="14" rx="2" />
      <Chao y={150} />
    </Quadro>
  )
}

/** licenca-empresa: galpão fechado, pilha de processo, ampulheta. */
export function LicencaEmpresa() {
  return (
    <Quadro>
      <Chao />
      <path className="b" d="M160 136V64l75-26 75 26v72z" />
      <rect className="c" x="194" y="84" width="82" height="52" />
      <path className="f" d="M194 94h82M194 104h82M194 114h82M194 124h82" />
      <Arvore x={136} s={0.8} />
      <path className="b" d="M34 124h70v12H34zM40 112h66v12H40zM30 100h70v12H30zM38 88h68v12H38zM34 76h70v12H34z" />
      <path className="b" d="M58 36h24l-12 16 12 16H58l12-16z" />
      <path className="g f" d="M63 65h14l-7-8z" />
    </Quadro>
  )
}

/** jornada (escala 6x1): seis dias de trabalho, um de folga. */
export function Jornada() {
  let dias = ''
  for (let i = 0; i < 6; i++) dias += `M${34 + i * 23} 62h18v52h-18z`
  return (
    <Quadro>
      <path className="b" d="M296 16a14 14 0 1 0 12 22a10 10 0 1 1-12-22z" />
      <rect className="b" x="22" y="26" width="176" height="98" rx="10" />
      <path className="p" d="M22 50V36a10 10 0 0 1 10-10h156a10 10 0 0 1 10 10v14z" />
      <path className="w" d="M56 20v12M164 20v12" />
      <path className="p" d={dias} />
      <rect className="g" x="172" y="62" width="18" height="52" rx="3" />
      <Chao />
      <Pessoa x={252} pele={2} cabelo="curto" roupa="g" largo pose="segura">
        <rect className="p" x="-10" y="-44" width="22" height="16" rx="4" />
      </Pessoa>
    </Quadro>
  )
}

/** custo-contratar: a conta da contratação e a vaga que fica vazia. */
export function CustoContratar() {
  return (
    <Quadro>
      <Chao y={132} />
      <Pessoa x={80} y={116} pele={3} cabelo="grisalho" roupa="g" largo pose="segura">
        <rect className="t" x="-7" y="-54" width="16" height="20" rx="3" />
        <rect className="b n" x="-4" y="-51" width="10" height="5" />
      </Pessoa>
      <rect className="p" x="20" y="96" width="120" height="36" rx="4" />
      <rect className="b" x="14" y="90" width="132" height="8" rx="3" />
      <Moedas x={172} y={132} n={4} />
      <Sobe x={188} y={104} />
      <path d="M240 110v22M272 110v22" />
      <rect className="p" x="270" y="70" width="6" height="40" rx="3" />
      <rect className="p" x="234" y="104" width="44" height="6" rx="3" />
      <Pessoa x={262} y={132} pose="sentada" fantasma espelha />
    </Quadro>
  )
}

/** trabalho-app: dez horas no volante do aplicativo; se adoecer, não tem de onde tirar. */
export function TrabalhoApp() {
  return (
    <Quadro>
      <Relogio x={34} y={34} r={12} />
      <path className="lp d" d="M60 50q40-30 80 0t80 0q20-14 40-20" />
      <path className="g" d="M262 20a10 10 0 0 1 20 0c0 10-10 18-10 18s-10-8-10-18z" />
      <circle className="b" cx="272" cy="20" r="3" />
      <Chao y={132} />
      <Carro x={64} y={136} s={1.6} cls="p" />
      <circle className="h" cx="150" cy="85" r="6.5" />
      <circle className="k4" cx="151" cy="87" r="5" />
      <rect className="t" x="160" y="82" width="6" height="9" rx="2" />
      <rect className="b" x="248" y="62" width="12" height="46" rx="6" />
      <circle className="g" cx="254" cy="110" r="9" />
      <path className="lg w" d="M254 104V78" />
    </Quadro>
  )
}

/** falta-tecnico: a vaga de técnico no mural, a bancada sem ninguém. */
export function FaltaTecnico() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="p" x="26" y="20" width="102" height="74" rx="6" />
      <rect className="b" x="42" y="32" width="48" height="54" rx="4" />
      <Pessoa x={66} y={80} s={0.8} pose="busto" fantasma />
      <circle className="g" cx="66" cy="32" r="4" />
      <g transform="rotate(8 110 52)">
        <Papel x={98} y={38} w={24} h={30} />
      </g>
      <Pessoa x={150} y={132} pele={4} cabelo="coque" roupa="g" />
      <path d="M196 102v30M298 102v30" />
      <rect className="p" x="186" y="92" width="122" height="10" rx="3" />
      <circle className="d w" cx="214" cy="76" r="13" />
      <circle className="b" cx="214" cy="76" r="10" />
      <circle className="c" cx="214" cy="76" r="3.5" />
      <path className="w" d="M244 86l30-18" />
      <circle className="b" cx="276" cy="67" r="6" />
      <path d="M232 132v-22M262 132v-22M226 110h42" />
    </Quadro>
  )
}
