import { Chao, Moedas, Papel, Quadro, Sobe } from './pecas'

/** Prédio público genérico (sem brasão, sem bandeira), base em y 132. */
function Governo({ x, w }: { x: number; w: number }) {
  let col = ''
  for (let c = x + 12; c + 10 <= x + w - 6; c += 26) col += `M${c} ${132 - 72}h10v66h-10z`
  return (
    <g>
      <rect className="b" x={x} y="54" width={w} height="78" />
      <path className="p" d={`M${x - 6} 56l${w / 2 + 6} -26 ${w / 2 + 6} 26z`} />
      <path className="p" d={col} />
      <rect className="p" x={x - 6} y="126" width={w + 12} height="8" rx="2" />
    </g>
  )
}

/** dinheiro-publico / contas: a máquina pública cheia e a prateleira do posto vazia. */
export function DinheiroPublico() {
  return (
    <Quadro>
      <Chao y={132} />
      <Governo x={22} w={112} />
      <Moedas x={158} y={132} n={5} r={12} />
      <circle className="g" cx="180" cy="126" r="6" />
      <rect className="b" x="194" y="30" width="112" height="102" rx="4" />
      <path d="M194 64h112M194 98h112" />
      <rect className="p" x="202" y="40" width="18" height="6" rx="2" />
      <rect className="g" x="204" y="46" width="14" height="18" rx="3" />
      <path className="d f" d="M232 44h22v20h-22zM266 44h22v20h-22zM206 76h22v22h-22zM240 76h22v22h-22zM274 76h22v22h-22zM206 110h22v22h-22zM240 110h22v22h-22z" />
    </Quadro>
  )
}

/** renda (salário mínimo): carteira quase vazia, nota comprida, sacola. */
export function Renda() {
  return (
    <Quadro>
      <Chao y={132} />
      <circle className="g" cx="62" cy="62" r="9" />
      <rect className="p" x="30" y="64" width="96" height="62" rx="12" />
      <path className="p" d="M96 80h36v30H96a8 8 0 0 1-8-8V88a8 8 0 0 1 8-8z" />
      <circle className="b" cx="104" cy="95" r="4" />
      <path className="b" d="M150 18h54v104l-6-5-6 5-6-5-6 5-6-5-6 5-6-5-6 5-6-5z" />
      <path className="f" d="M158 32h26M158 44h38M158 56h32M158 68h38M158 80h30" />
      <path className="lg w" d="M158 98h38" />
      <circle className="g" cx="244" cy="66" r="9" />
      <rect className="p" x="258" y="46" width="16" height="26" rx="3" />
      <path d="M238 72q0-18 19-18t19 18" />
      <path className="b" d="M222 72h70l-6 60h-58z" />
    </Quadro>
  )
}

/** juros: cartão e parcelas que só crescem. */
export function Juros() {
  const alt = [18, 30, 44, 60, 80]
  return (
    <Quadro>
      <Chao y={132} />
      <g transform="rotate(-10 84 84)">
        <rect className="p" x="26" y="52" width="110" height="68" rx="10" />
        <rect className="g" x="40" y="68" width="20" height="16" rx="3" />
        <path className="lb w" d="M40 102h40" />
      </g>
      {alt.map((h, i) => (
        <rect key={i} className={i === 4 ? 'g' : 'b'} x={166 + i * 26} y={132 - h} width="20" height={h} rx="3" />
      ))}
      <path className="lg w" d="M156 92q80 0 130-72m-12 0h12v12" />
    </Quadro>
  )
}

/** imposto-renda: declaração no computador; do salário e das compras, moeda pro governo. */
export function ImpostoRenda() {
  return (
    <Quadro>
      <Chao y={132} />
      <rect className="t" x="24" y="28" width="124" height="84" rx="6" />
      <rect className="b n" x="31" y="35" width="110" height="70" rx="2" />
      <path className="f" d="M40 48h50M40 60h80M40 72h64M40 84h80M40 96h56" />
      <path className="lp" d="M108 44h9v9h-9zM108 66h9v9h-9z" />
      <path className="p" d="M12 112h148l-8 12H20z" />
      <path className="lp d" d="M150 54q44-38 90 6M206 100q20-24 36-14" />
      <circle className="g" cx="176" cy="34" r="7" />
      <circle className="g" cx="204" cy="30" r="7" />
      <path d="M160 94h8l8 22h28l6-16h-38" />
      <circle className="t" cx="180" cy="124" r="4" />
      <circle className="t" cx="200" cy="124" r="4" />
      <rect className="b" x="244" y="70" width="64" height="62" />
      <path className="p" d="M238 72l38-18 38 18zM252 78h8v48h-8zM272 78h8v48h-8zM292 78h8v48h-8z" />
    </Quadro>
  )
}

/** energia (conta de luz): lâmpada, conta que sobe, bomba de combustível e botijão. */
export function Energia() {
  return (
    <Quadro>
      <Chao y={132} />
      <path className="lg" d="M58 20v-8M28 30l-6-6M88 30l6-6M24 56h-8M92 56h8" />
      <circle className="g" cx="58" cy="54" r="24" />
      <path d="M50 56l8 8 8-8M58 64v12" />
      <rect className="b" x="48" y="76" width="20" height="16" rx="3" />
      <Papel x={112} y={26} w={64} h={86} />
      <Sobe x={172} y={42} />
      <path d="M250 72h10v44q0 8-8 8h-4" />
      <rect className="p" x="206" y="52" width="44" height="80" rx="6" />
      <rect className="b" x="214" y="62" width="28" height="18" rx="3" />
      <rect className="g" x="276" y="88" width="16" height="12" rx="3" />
      <rect className="g" x="266" y="98" width="36" height="34" rx="12" />
    </Quadro>
  )
}
