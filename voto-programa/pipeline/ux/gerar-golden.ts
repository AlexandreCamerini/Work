/**
 * Linha de base ("golden") do comportamento travado, gerada ANTES da refatoração de UX.
 *
 *   npx tsx pipeline/ux/gerar-golden.ts            # grava pipeline/ux/golden-baseline.json
 *   npx tsx pipeline/ux/gerar-golden.ts --conferir # recalcula e compara com o arquivo gravado
 *
 * Cobre o que não pode mudar (ver D-tecnica.md §6):
 *  - impressão digital dos dados: ids de cena/opção/tema/grupo, `preferencia`, `publico`,
 *    `consenso`, ids de candidato e a tabela de aderência inteira (hash);
 *  - selecionarCenas (src/lib/perfil.ts) para TODAS as combinações de perfil (hash) e para
 *    perfis nomeados (lista legível, para diff);
 *  - calcularResultados / encaixesDoCandidato (src/lib/matching.ts) para respostas fixas:
 *    primeira opção, última opção e 40 sorteios determinísticos (com pulos), × 3 conjuntos de
 *    prioridades.
 *
 * Não importa src/data/index.ts (usa import.meta.env, que o tsx não define): monta as eleições
 * direto dos JSON. Depois da refatoração, troque só a função `carregar` pelo novo carregador
 * (ex.: `await carregarEleicao(id)`) e rode com --conferir.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import aderenciaGov from '../../src/data/aderencia.json'
import aderenciaPres from '../../src/data/aderencia-presidente.json'
import quizGov from '../../src/data/quiz.json'
import quizPres from '../../src/data/quiz-presidente.json'
import { candidatos } from '../../src/data/candidatos'
import { candidatosPresidente } from '../../src/data/candidatos-presidente'
import { calcularResultados, encaixesDoCandidato } from '../../src/lib/matching'
import { PERFIL_VAZIO, estimarFaixa, selecionarCenas } from '../../src/lib/perfil'
import type { Aderencia, Candidato, Perfil, Pergunta, Quiz, Resposta } from '../../src/types'

interface Base {
  id: string
  quiz: Quiz
  aderencia: Aderencia
  candidatos: Candidato[]
}

async function carregar(): Promise<Base[]> {
  return [
    { id: 'governador-rj', quiz: quizGov as unknown as Quiz, aderencia: aderenciaGov as unknown as Aderencia, candidatos },
    { id: 'presidente', quiz: quizPres as unknown as Quiz, aderencia: aderenciaPres as unknown as Aderencia, candidatos: candidatosPresidente },
  ]
}

const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16)

/** Mesmo LCG de src/lib/ordem.test.ts: determinístico e independente de Math.random. */
function sorteioFixo(semente: number) {
  let s = semente
  return () => {
    s = (s * 1103515245 + 12345) % 2 ** 31
    return s / 2 ** 31
  }
}

const VALORES = {
  saude: [null, 'sus', 'plano_empresa', 'plano_proprio'],
  escola: [null, 'publica', 'particular', 'nenhuma'],
  deslocamento: [null, 'publico', 'carro', 'moto', 'app', 'casa'],
  trabalho: [null, 'carteira', 'servidor', 'autonomo', 'empresario', 'aposentado', 'sem_trabalho'],
  banheiros: [null, 1, 2, 3],
} as const

function todosOsPerfis(regioes: (string | null)[]): Perfil[] {
  const saida: Perfil[] = []
  for (const saude of VALORES.saude)
    for (const escola of VALORES.escola)
      for (const deslocamento of VALORES.deslocamento)
        for (const trabalho of VALORES.trabalho)
          for (const banheiros of VALORES.banheiros)
            for (const regiao of regioes) saida.push({ saude, escola, deslocamento, trabalho, banheiros, regiao } as Perfil)
  return saida
}

const PERFIS_NOMEADOS: Record<string, Partial<Perfil>> = {
  vazio: {},
  sus_publico_onibus: { saude: 'sus', escola: 'publica', deslocamento: 'publico', trabalho: 'carteira', banheiros: 1 },
  motoboy: { saude: 'sus', escola: 'nenhuma', deslocamento: 'moto', trabalho: 'autonomo', banheiros: 1 },
  servidor_carro: { saude: 'plano_empresa', escola: 'publica', deslocamento: 'carro', trabalho: 'servidor', banheiros: 2 },
  empresario_privado: { saude: 'plano_proprio', escola: 'particular', deslocamento: 'carro', trabalho: 'empresario', banheiros: 3 },
  aposentado_app: { saude: 'plano_proprio', escola: 'nenhuma', deslocamento: 'app', trabalho: 'aposentado', banheiros: 2 },
  home_office: { saude: 'plano_empresa', escola: 'particular', deslocamento: 'casa', trabalho: 'carteira', banheiros: 2 },
}

type Estrategia = { nome: string; escolher: (p: Pergunta, i: number) => string | null }

function estrategias(): Estrategia[] {
  const lista: Estrategia[] = [
    { nome: 'primeira', escolher: (p) => p.opcoes[0].id },
    { nome: 'ultima', escolher: (p) => p.opcoes[p.opcoes.length - 1].id },
  ]
  for (let s = 1; s <= 40; s++) {
    const r = sorteioFixo(s)
    // ~10% de pulos, para exercitar cobertura e COBERTURA_MINIMA
    lista.push({ nome: `sorteio-${s}`, escolher: (p) => (r() < 0.1 ? null : p.opcoes[Math.floor(r() * p.opcoes.length)].id) })
  }
  return lista
}

function impressaoDosDados(b: Base) {
  const estrutura = {
    versao: b.quiz.versao,
    temas: b.quiz.temas.map((t) => t.id),
    regioes: b.quiz.regioes?.opcoes.map((o) => o.valor) ?? null,
    perguntas: b.quiz.perguntas.map((p) => ({
      id: p.id,
      grupo: p.grupo,
      tema: p.tema,
      publico: p.publico ?? null,
      consenso: p.consenso ?? false,
      opcoes: p.opcoes.map((o) => [o.id, o.preferencia]),
    })),
    candidatos: b.candidatos.map((c) => c.id),
  }
  return { estrutura: hash(estrutura), aderencia: hash(b.aderencia.itens), versao_quiz: b.aderencia.versao_quiz, nPerguntas: b.quiz.perguntas.length }
}

function gerar(bases: Base[]) {
  const saida: Record<string, unknown> = {}
  for (const b of bases) {
    const regioes = [null, ...(b.quiz.regioes?.opcoes.map((o) => o.valor) ?? [])]
    const todos = todosOsPerfis(regioes)
    const selecoes = todos.map((p) => selecionarCenas(b.quiz.perguntas, p).map((q) => q.id).join(','))
    const distintas = [...new Set(selecoes)].sort()

    const nomeados: Record<string, unknown> = {}
    const temas = b.quiz.temas.map((t) => t.id)
    const conjuntosPrioridade = [[], [temas[0]], temas.slice(0, 3)]
    for (const [nome, parcial] of Object.entries(PERFIS_NOMEADOS)) {
      for (const regiao of regioes) {
        const perfil = { ...PERFIL_VAZIO, ...parcial, regiao }
        const cenas = selecionarCenas(b.quiz.perguntas, perfil)
        const resultados: Record<string, unknown> = {}
        for (const e of estrategias()) {
          const respostas: Resposta[] = []
          cenas.forEach((p, i) => {
            const o = e.escolher(p, i)
            if (o) respostas.push({ perguntaId: p.id, opcaoId: o })
          })
          for (const prio of conjuntosPrioridade) {
            const r = calcularResultados(b.candidatos, cenas, b.aderencia, respostas, prio)
            resultados[`${e.nome}|${prio.join('+') || '-'}`] = r.map((x) => {
              const enc = encaixesDoCandidato(x.candidato.id, cenas, b.aderencia, respostas)
              return `${x.candidato.id}:${x.afinidade ?? 'null'}:${x.cobertura}:${enc.atende.length}/${enc.em_parte.length}/${enc.nao_atende.length}/${enc.sem_proposta.length}`
            })
          }
        }
        // tudo entra no hash; uma amostra fica legível para o diff apontar o que mudou
        const amostra = Object.fromEntries(
          ['primeira|-', `ultima|${temas.slice(0, 3).join('+')}`, 'sorteio-1|-'].map((k) => [k, resultados[k]]),
        )
        nomeados[`${nome}@${regiao ?? '-'}`] = {
          faixa: estimarFaixa(perfil),
          cenas: cenas.map((c) => c.id),
          resultadosHash: hash(resultados),
          casos: Object.keys(resultados).length,
          amostra,
        }
      }
    }
    saida[b.id] = {
      dados: impressaoDosDados(b),
      selecaoDeCenas: { perfisTestados: todos.length, hash: hash(selecoes), combinacoesDistintas: distintas.length },
      perfisNomeados: nomeados,
    }
  }
  return saida
}

const arquivo = join(dirname(fileURLToPath(import.meta.url)), 'golden-baseline.json')
const atual = gerar(await carregar())
if (process.argv.includes('--conferir')) {
  const gravado = JSON.parse(readFileSync(arquivo, 'utf8'))
  const a = JSON.stringify(gravado)
  const b = JSON.stringify(atual)
  if (a !== b) {
    for (const id of Object.keys(gravado)) {
      for (const k of Object.keys(gravado[id])) {
        if (JSON.stringify(gravado[id][k]) !== JSON.stringify((atual as any)[id]?.[k])) console.error(`DIFERENTE: ${id}.${k}`)
      }
    }
    process.exit(1)
  }
  console.log('golden OK: comportamento idêntico à linha de base')
} else {
  writeFileSync(arquivo, JSON.stringify(atual, null, 1) + '\n')
  console.log(`gravado ${arquivo}`)
}
