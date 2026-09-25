/**
 * Cartão compartilhável (1080×1350, 4:5), desenhado no aparelho. Nunca leva o voto. Sem a
 * chave ligada, também não leva nomes nem números: só "Candidato A…" e o tamanho das barras.
 */

export interface LinhaCartao {
  rotulo: string
  nome: string
  afinidade: number | null
}

export interface DadosCartao {
  eleicao: string
  prioridades: string[]
  linhas: LinhaCartao[]
  comNomes: boolean
  endereco: string
}

export const LARGURA = 1080
export const ALTURA = 1350

const COR = {
  fundo: '#0F6E8C',
  forte: '#0A5268',
  texto: '#FFFFFF',
  destaque: '#F07AA0',
  sobreDestaque: '#16213A',
  lente: '#16213A',
}
const TITULO = "'Bricolage Grotesque Variable', 'Bricolage Grotesque', system-ui, sans-serif"
const TEXTO = "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"

type Ctx = Pick<
  CanvasRenderingContext2D,
  'fillStyle' | 'font' | 'textAlign' | 'globalAlpha' | 'fillRect' | 'fillText' | 'measureText' | 'beginPath' | 'arc' | 'moveTo' | 'lineTo' | 'closePath' | 'fill' | 'roundRect'
>

/** Quebra o texto em linhas que cabem na largura. */
function quebrar(g: Ctx, texto: string, largura: number) {
  const linhas: string[] = []
  let atual = ''
  for (const palavra of texto.split(' ')) {
    const teste = atual ? `${atual} ${palavra}` : palavra
    if (atual && g.measureText(teste).width > largura) {
      linhas.push(atual)
      atual = palavra
    } else atual = teste
  }
  if (atual) linhas.push(atual)
  return linhas
}

function simbolo(g: Ctx, x: number, y: number, s: number) {
  const k = s / 64
  const bola = (cx: number, cy: number, r: number, cor: string) => {
    g.fillStyle = cor
    g.beginPath()
    g.arc(x + cx * k, y + cy * k, r * k, 0, Math.PI * 2)
    g.fill()
  }
  const ponta = (pts: [number, number][], cor: string) => {
    g.fillStyle = cor
    g.beginPath()
    pts.forEach(([px, py], i) => (i ? g.lineTo(x + px * k, y + py * k) : g.moveTo(x + px * k, y + py * k)))
    g.closePath()
    g.fill()
  }
  bola(25, 30, 19, '#FFFFFF')
  ponta([[12, 42], [7, 57], [24, 48]], '#FFFFFF')
  bola(39, 30, 19, COR.destaque)
  ponta([[52, 42], [57, 57], [40, 48]], COR.destaque)
  // interseção dos dois balões
  g.fillStyle = COR.lente
  g.beginPath()
  const a = Math.acos(7 / 19)
  g.arc(x + 25 * k, y + 30 * k, 19 * k, -a, a)
  g.arc(x + 39 * k, y + 30 * k, 19 * k, Math.PI - a, Math.PI + a)
  g.closePath()
  g.fill()
}

/**
 * Desenha o cartão e devolve todos os textos escritos nele (para conferir, em teste, que o
 * voto nunca entra e que os nomes só entram com a chave ligada).
 */
export function desenharCartao(g: Ctx, d: DadosCartao): string[] {
  const escritos: string[] = []
  const escrever = (t: string, x: number, y: number) => {
    escritos.push(t)
    g.fillText(t, x, y)
  }
  const M = 80
  const L = LARGURA - 2 * M

  g.fillStyle = COR.fundo
  g.fillRect(0, 0, LARGURA, ALTURA)
  g.fillStyle = COR.destaque
  g.fillRect(0, 0, LARGURA, 16)

  simbolo(g, M, 62, 84)
  g.textAlign = 'left'
  g.fillStyle = COR.texto
  g.font = `800 58px ${TITULO}`
  escrever('Combina', M + 100, 128)
  const w = g.measureText('Combina').width
  g.fillStyle = COR.destaque
  escrever('?', M + 100 + w, 128)

  g.fillStyle = COR.texto
  g.font = `800 32px ${TEXTO}`
  escrever(d.eleicao.toUpperCase(), M, 232)

  g.font = `800 70px ${TITULO}`
  let y = 318
  for (const l of quebrar(g, 'Qual proposta combina com o meu dia a dia?', L)) {
    escrever(l, M, y)
    y += 80
  }

  y += 30
  g.font = `800 36px ${TEXTO}`
  escrever('O que mais pesa pra mim:', M, y)
  y += 24
  let x = M
  g.font = `800 36px ${TEXTO}`
  for (const t of d.prioridades.length ? d.prioridades : ['Todos os temas valem igual']) {
    const largura = g.measureText(t).width + 52
    if (x + largura > M + L) {
      x = M
      y += 84
    }
    g.fillStyle = COR.destaque
    g.beginPath()
    g.roundRect(x, y, largura, 68, 34)
    g.fill()
    g.fillStyle = COR.sobreDestaque
    escrever(t, x + 26, y + 46)
    x += largura + 14
  }
  y += 68 + 70

  g.fillStyle = COR.texto
  g.font = `800 36px ${TEXTO}`
  escrever(d.comNomes ? 'Afinidade com as minhas escolhas:' : 'Meu resultado às cegas:', M, y)
  y += 20

  const fim = 1170
  const n = Math.max(1, d.linhas.length)
  const passo = Math.min(104, (fim - y) / n)
  const fonte = Math.max(24, Math.min(36, Math.floor(passo * 0.4)))
  const barra = Math.max(10, Math.min(20, Math.floor(passo * 0.2)))
  d.linhas.forEach((linha, i) => {
    const topo = y + i * passo
    g.fillStyle = COR.texto
    g.font = `800 ${fonte}px ${TEXTO}`
    g.textAlign = 'left'
    escrever(d.comNomes ? linha.nome : linha.rotulo, M, topo + fonte + 4)
    g.textAlign = 'right'
    if (d.comNomes) escrever(linha.afinidade === null ? 'poucos dados' : `${linha.afinidade}%`, M + L, topo + fonte + 4)
    g.textAlign = 'left'
    const yb = topo + fonte + 16
    g.fillStyle = 'rgba(255,255,255,0.28)'
    g.beginPath()
    g.roundRect(M, yb, L, barra, barra / 2)
    g.fill()
    if (linha.afinidade) {
      g.fillStyle = COR.destaque
      g.beginPath()
      g.roundRect(M, yb, Math.max(barra, (L * linha.afinidade) / 100), barra, barra / 2)
      g.fill()
    }
  })

  g.fillStyle = COR.texto
  g.font = `800 36px ${TITULO}`
  escrever(`Faça o seu: ${d.endereco}`, M, 1238)
  g.font = `700 26px ${TEXTO}`
  g.globalAlpha = 0.9
  escrever('Não é pesquisa eleitoral nem recomendação de voto.', M, 1292)
  g.globalAlpha = 1
  return escritos
}

/** Descrição para o `alt` da prévia. */
export function descricaoDoCartao(d: DadosCartao) {
  const pri = d.prioridades.length ? `prioridades: ${d.prioridades.join(', ')}` : 'sem prioridades marcadas'
  return d.comNomes
    ? `Prévia do cartão: ${pri}; nomes e percentuais de afinidade. Sem o seu voto.`
    : `Prévia do cartão: ${pri}; resultado às cegas, sem nomes, sem números e sem o seu voto.`
}
