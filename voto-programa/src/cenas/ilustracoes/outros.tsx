import { Balao, Chao, Pessoa, Quadro } from './pecas'

/** internet (vídeo falso): o vídeo duvidoso que corre no grupo da família. */
export function Internet() {
  return (
    <Quadro>
      <rect className="t" x="30" y="14" width="80" height="140" rx="12" />
      <rect className="b n" x="37" y="24" width="66" height="116" rx="4" />
      <rect className="p" x="44" y="36" width="52" height="38" rx="4" />
      <path className="b" d="M64 46l14 9-14 9z" />
      <rect className="lg d" x="40" y="31" width="60" height="48" rx="6" />
      <path className="g f" d="M88 84l9 15h-18z" />
      <path className="f" d="M88 89v5M46 106h40M46 116h30M46 126h44" />
      <path className="lp d" d="M118 70q12-24 30-30M200 66q10 14 0 30" />
      <Balao x={150} y={18} w={60} />
      <rect className="b" x="146" y="102" width="72" height="40" rx="8" />
      <rect className="p" x="154" y="110" width="40" height="24" rx="3" />
      <path className="b" d="M168 116l10 6-10 6z" />
      <Pessoa x={272} y={76} s={0.9} pose="busto" pele={2} cabelo="grisalho" roupa="g" />
      <Pessoa x={272} y={150} s={0.9} pose="busto" pele={3} cabelo="curto" roupa="p" largo />
    </Quadro>
  )
}

/** Genérica: ponto de ônibus e dois balões de conversa (a marca). */
export function Generica() {
  return (
    <Quadro>
      <Chao y={132} />
      <path className="p" d="M60 30h58a14 14 0 0 1 14 14v18a14 14 0 0 1-14 14H82l-12 10V76h-10a14 14 0 0 1-14-14V44a14 14 0 0 1 14-14z" />
      <path className="g" d="M118 52h52a14 14 0 0 1 14 14v18a14 14 0 0 1-14 14h-6v10l-12-10h-34a14 14 0 0 1-14-14V66a14 14 0 0 1 14-14z" />
      <path d="M262 132V52" />
      <circle className="g" cx="262" cy="46" r="12" />
      <rect className="b" x="256" y="40" width="12" height="10" rx="2" />
      <Pessoa x={222} y={132} pose="celular" pele={2} cabelo="coque" roupa="g" />
    </Quadro>
  )
}
