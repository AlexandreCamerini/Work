import { useState } from 'react'
import { PERFIL_VAZIO } from '../lib/perfil'
import type { Perfil } from '../types'

type Campo = keyof Perfil

interface Pergunta {
  campo: Campo
  titulo: string
  opcoes: { valor: Perfil[Campo]; rotulo: string }[]
}

const PERGUNTAS: Pergunta[] = [
  {
    campo: 'saude',
    titulo: 'Quando precisa de médico, você usa…',
    opcoes: [
      { valor: 'sus', rotulo: 'SUS / posto' },
      { valor: 'plano', rotulo: 'Plano de saúde' },
    ],
  },
  {
    campo: 'deslocamento',
    titulo: 'No dia a dia, você se desloca mais de…',
    opcoes: [
      { valor: 'publico', rotulo: 'Ônibus, trem, metrô, barca' },
      { valor: 'carro', rotulo: 'Carro' },
      { valor: 'moto', rotulo: 'Moto ou app' },
      { valor: 'casa', rotulo: 'Quase não saio / trabalho em casa' },
    ],
  },
  {
    campo: 'escola',
    titulo: 'Tem filho ou alguém da casa na escola?',
    opcoes: [
      { valor: 'publica', rotulo: 'Sim, escola pública' },
      { valor: 'particular', rotulo: 'Sim, escola particular' },
      { valor: 'nenhuma', rotulo: 'Não' },
    ],
  },
  {
    campo: 'trabalho',
    titulo: 'Você trabalha como…',
    opcoes: [
      { valor: 'carteira', rotulo: 'Carteira assinada' },
      { valor: 'servidor', rotulo: 'Servidor público' },
      { valor: 'autonomo', rotulo: 'Autônomo / MEI / bico' },
      { valor: 'empresario', rotulo: 'Tenho empresa' },
      { valor: 'aposentado', rotulo: 'Aposentado(a)' },
      { valor: 'sem_trabalho', rotulo: 'Estudo ou estou sem trabalho' },
    ],
  },
  {
    campo: 'renda',
    titulo: 'Somando todo mundo da casa, a renda por mês fica em…',
    opcoes: [
      { valor: 'ate2', rotulo: 'Até 2 salários mínimos' },
      { valor: '2a4', rotulo: '2 a 4 salários' },
      { valor: '4a10', rotulo: '4 a 10 salários' },
      { valor: '10a20', rotulo: '10 a 20 salários' },
      { valor: 'mais20', rotulo: 'Mais de 20 salários' },
    ],
  },
  {
    campo: 'pessoas',
    titulo: 'Quantas pessoas vivem com essa renda?',
    opcoes: [
      { valor: 1, rotulo: '1' },
      { valor: 2, rotulo: '2' },
      { valor: 3, rotulo: '3' },
      { valor: 4, rotulo: '4' },
      { valor: 5, rotulo: '5 ou mais' },
    ],
  },
]

interface SobreVoceProps {
  onContinuar: (perfil: Perfil) => void
}

export function SobreVoce({ onContinuar }: SobreVoceProps) {
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO)

  function escolher(campo: Campo, valor: Perfil[Campo]) {
    setPerfil((atual) => ({ ...atual, [campo]: atual[campo] === valor ? null : valor }))
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-12 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-extrabold text-balance">Rapidinho, sobre você</h1>
        <p className="text-tinta-suave">
          Serve só para escolher situações que têm a ver com a sua vida. Nada disso sai do seu
          celular, e dá para pular qualquer uma.
        </p>
      </header>

      {PERGUNTAS.map((q) => (
        <fieldset key={q.campo} className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">{q.titulo}</legend>
          <div className="flex flex-wrap gap-2">
            {q.opcoes.map((o) => {
              const ativo = perfil[q.campo] === o.valor
              return (
                <button
                  key={String(o.valor)}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => escolher(q.campo, o.valor)}
                  className={`rounded-2xl border-2 px-3 py-2 text-sm font-semibold transition ${
                    ativo ? 'border-mar bg-mar text-white' : 'border-linha bg-white text-tinta hover:border-mar'
                  }`}
                >
                  {o.rotulo}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => onContinuar(PERFIL_VAZIO)} className="text-sm font-semibold text-tinta-suave underline">
          Pular tudo
        </button>
        <button
          type="button"
          onClick={() => onContinuar(perfil)}
          className="rounded-2xl bg-mar px-6 py-3 font-display text-lg font-extrabold text-white shadow-[0_4px_0_var(--color-mar-escuro)] transition active:translate-y-1 active:shadow-none"
        >
          Continuar
        </button>
      </div>
    </section>
  )
}
