/**
 * Dados sob demanda. No JS inicial só entra este manifesto; quiz, aderência e evidências de
 * cada eleição chegam por import() dinâmico, cada um no seu arquivo:
 *   1. abrir a eleição → quiz + candidatos (basta para jogar);
 *   2. durante as cenas → aderência (só o resultado usa);
 *   3. depois do voto → evidências (trechos e fontes só aparecem com os nomes);
 *   a qualquer hora → contexto do "Leia", só quando a pessoa abre a folha do fato.
 * O manifesto é conferido contra os JSON em src/data/manifesto.test.ts.
 */
import type { Acompanhamento, Aderencia, Candidato, Contextos, Evidencias, Quiz } from '../types'

export type IdEleicao = 'governador-rj' | 'presidente'

export interface ResumoEleicao {
  id: IdEleicao
  /** Igual a `quiz.eleicao`. */
  nome: string
  nCandidatos: number
  primeiroTurno: string
}

export const manifesto: ResumoEleicao[] = [
  { id: 'governador-rj', nome: 'Governador do Rio de Janeiro 2026', nCandidatos: 8, primeiroTurno: '4 de outubro' },
  { id: 'presidente', nome: 'Presidente da República 2026', nCandidatos: 2, primeiroTurno: '4 de outubro' },
]

export interface DadosQuiz {
  id: IdEleicao
  quiz: Quiz
  candidatos: Candidato[]
  /** Candidatos oficializados que não estão no quiz e por quê, listados por transparência. */
  foraDoQuiz: { motivo: string; nomes: string[] }
}

interface Fontes {
  quiz: () => Promise<DadosQuiz>
  aderencia: () => Promise<Aderencia>
  evidencias: () => Promise<Evidencias>
  contextos: () => Promise<Contextos>
}

const fontes: Record<IdEleicao, Fontes> = {
  'governador-rj': {
    quiz: () =>
      Promise.all([import('./quiz.json'), import('./candidatos')]).then(
        ([q, c]): DadosQuiz => ({ id: 'governador-rj', quiz: q.default as unknown as Quiz, candidatos: c.candidatos, foraDoQuiz: c.foraDoQuiz }),
      ),
    aderencia: () => import('./aderencia.json').then((m) => m.default as unknown as Aderencia),
    evidencias: () => import('./evidencias.json').then((m) => m.default as unknown as Evidencias),
    contextos: () => import('./contexto.json').then((m) => m.default as Contextos),
  },
  presidente: {
    quiz: () =>
      Promise.all([import('./quiz-presidente.json'), import('./candidatos-presidente')]).then(
        ([q, c]): DadosQuiz => ({
          id: 'presidente',
          quiz: q.default as unknown as Quiz,
          candidatos: c.candidatosPresidente,
          foraDoQuiz: c.foraDoQuizPresidente,
        }),
      ),
    aderencia: () => import('./aderencia-presidente.json').then((m) => m.default as unknown as Aderencia),
    evidencias: () => import('./evidencias-presidente.json').then((m) => m.default as unknown as Evidencias),
    contextos: () => import('./contexto-presidente.json').then((m) => m.default as Contextos),
  },
}

const cache = new Map<string, Promise<unknown>>()

/** Promessa única por recurso (serve para `use()`); se falhar, sai do cache para tentar de novo. */
function lembrar<T>(chave: string, carregar: () => Promise<T>): Promise<T> {
  let p = cache.get(chave) as Promise<T> | undefined
  if (!p) {
    p = carregar()
    p.catch(() => cache.delete(chave))
    cache.set(chave, p)
  }
  return p
}

export function ehEleicao(id: string): id is IdEleicao {
  return manifesto.some((e) => e.id === id)
}

export const carregarQuiz = (id: IdEleicao) => lembrar<DadosQuiz>(`${id}:quiz`, fontes[id].quiz)
export const carregarAderencia = (id: IdEleicao) => lembrar<Aderencia>(`${id}:aderencia`, fontes[id].aderencia)
export const carregarEvidencias = (id: IdEleicao) => lembrar<Evidencias>(`${id}:evidencias`, fontes[id].evidencias)
export const carregarContextos = (id: IdEleicao) => lembrar<Contextos>(`${id}:contextos`, fontes[id].contextos)

/** Esquece recursos que falharam ou todos, para o botão "Tentar de novo". */
export function esquecerCarregamentos() {
  cache.clear()
}

export interface ResumoAcompanhamento {
  id: string
  titulo: string
  carregar: () => Promise<Acompanhamento>
}

/**
 * Mandatos comparados com o plano de governo. Por decisão editorial, a área só vai ao ar depois
 * do 2º turno: o build de produção só inclui estes dados com VITE_PUBLICAR_ACOMPANHAMENTO=true
 * (com a flag desligada, o import() some do bundle). Vencedores de 2026 entram a partir da posse.
 */
export const acompanhamentos: ResumoAcompanhamento[] =
  import.meta.env.VITE_PUBLICAR_ACOMPANHAMENTO === 'true'
    ? [
        {
          id: 'prometeu-lula-2022',
          titulo: 'Lula: o que foi prometido em 2022',
          carregar: () =>
            lembrar('acomp:lula-2022', () =>
              import('../../pipeline/acompanhamento/lula-2022.json').then((m) => m.default as unknown as Acompanhamento),
            ),
        },
      ]
    : []
