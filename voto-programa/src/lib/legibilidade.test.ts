// Linguagem simples e "caber sem rolar": as mesmas regras de pipeline/ux/checar_legibilidade.py,
// aplicadas aos dois quiz JSON. Se mudar um limite aqui, mude lá também.
import { describe, expect, it } from 'vitest'
import quizGovernador from '../data/quiz.json'
import quizPresidente from '../data/quiz-presidente.json'

const MAX_PALAVRAS_OPCAO = 12
const MAX_PALAVRAS_PERGUNTA = 12
const MAX_PALAVRAS_FRASE_CENA = 20
const MAX_FRASES_CENA = 2
const MAX_CHARS_CENA_PERGUNTA = 170
const MAX_CHARS_OPCOES = 260

// Opções que mantêm o texto atual por decisão do dono do produto (seção "Precisa reavaliação"
// de pipeline/ux/A-linguagem.md): simplificar mudaria o sentido. Hoje todas cabem nos limites,
// então NÃO têm exceção nas regras abaixo; o teste só garante que o texto não foi trocado sem
// nova decisão. Se um dia alguma precisar de exceção, ela entra aqui, comentada, e não num
// limite afrouxado.
const MANTIDAS: { eleicao: string; pergunta: string; opcao: string; texto: string }[] = [
  { eleicao: 'presidente', pergunta: 'escala-6x1', opcao: 'b', texto: 'Poder combinar a minha jornada direto com a empresa.' },
  { eleicao: 'presidente', pergunta: 'trabalho-app', opcao: 'b', texto: 'Previdência pra quem trabalha em app, sem sindicato no meio.' },
  { eleicao: 'governador-rj', pergunta: 'operacao-policial', opcao: 'b', texto: 'Prendeu quem manda, com investigação e sem guerra na rua.' },
  { eleicao: 'governador-rj', pergunta: 'via-expressa-fechada', opcao: 'b', texto: 'Prendeu quem manda, com investigação e sem guerra na rua.' },
]

type Quiz = { perguntas: { id: string; cena: string; pergunta: string; opcoes: { id: string; texto: string }[] }[] }
const QUIZZES: [string, Quiz][] = [
  ['governador-rj', quizGovernador as Quiz],
  ['presidente', quizPresidente as Quiz],
]

/** Palavra = pedaço separado por espaço que tenha letra ou número ("R$" e "14,25" contam 2). */
function palavras(texto: string): number {
  return texto.split(/\s+/).filter((t) => /[0-9A-Za-zÀ-ÿ]/.test(t)).length
}

const ABREVIACOES = ['Av.', 'Dr.', 'Dra.', 'Sr.', 'Sra.', 'nº.', 'etc.']

function frases(texto: string): string[] {
  let protegido = texto
  for (const abv of ABREVIACOES) protegido = protegido.replaceAll(abv, abv.replaceAll('.', '\u0000'))
  return protegido
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter((f) => f.trim())
    .map((f) => f.replaceAll('\u0000', '.'))
}

/** Caracteres como o Python conta (pontos de código), não unidades UTF-16. */
const chars = (texto: string) => [...texto].length

describe.each(QUIZZES)('legibilidade: %s', (_eleicao, quiz) => {
  it.each(quiz.perguntas.map((q) => [q.id, q] as const))('%s', (_id, q) => {
    const problemas: string[] = []

    const fs = frases(q.cena)
    if (fs.length > MAX_FRASES_CENA) problemas.push(`cena com ${fs.length} frases`)
    for (const f of fs) {
      const n = palavras(f)
      if (n > MAX_PALAVRAS_FRASE_CENA) problemas.push(`frase de cena com ${n} palavras: ${f}`)
    }

    const nPergunta = palavras(q.pergunta)
    if (nPergunta > MAX_PALAVRAS_PERGUNTA) problemas.push(`pergunta com ${nPergunta} palavras`)

    for (const o of q.opcoes) {
      const n = palavras(o.texto)
      if (n > MAX_PALAVRAS_OPCAO) problemas.push(`opção ${o.id} com ${n} palavras: ${o.texto}`)
    }

    const cenaPergunta = chars(q.cena) + chars(q.pergunta)
    if (cenaPergunta > MAX_CHARS_CENA_PERGUNTA) problemas.push(`cena+pergunta com ${cenaPergunta} caracteres`)

    const opcoes = q.opcoes.reduce((s, o) => s + chars(o.texto), 0)
    if (opcoes > MAX_CHARS_OPCOES) problemas.push(`opções somadas com ${opcoes} caracteres`)

    expect(problemas).toEqual([])
  })
})

describe('opções mantidas por decisão do produto', () => {
  const porEleicao = Object.fromEntries(QUIZZES)
  it.each(MANTIDAS.map((m) => [`${m.eleicao}/${m.pergunta}/${m.opcao}`, m] as const))('%s', (_rotulo, m) => {
    const q = porEleicao[m.eleicao].perguntas.find((p) => p.id === m.pergunta)
    expect(q?.opcoes.find((o) => o.id === m.opcao)?.texto).toBe(m.texto)
  })
})

describe('contagem', () => {
  it('conta palavras e frases como o checador em Python', () => {
    expect(palavras('São R$ 14,25 por trecho.')).toBe(5)
    expect(palavras('Teto: o gasto — só cresce.')).toBe(5)
    expect(frases('Novas pistas, como Av. Brasil. Outra frase!')).toEqual(['Novas pistas, como Av. Brasil.', 'Outra frase!'])
  })
})
