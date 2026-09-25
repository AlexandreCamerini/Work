import { useState } from 'react'
import { PERFIL_VAZIO } from '../lib/perfil'
import type { Perfil, Quiz } from '../types'

type Campo = keyof Perfil

interface Pergunta {
  campo: Campo
  titulo: string
  opcoes: { valor: Perfil[Campo]; rotulo: string }[]
}

const PERGUNTAS: Pergunta[] = [
  {
    campo: 'saude',
    titulo: 'Quando alguém da casa precisa de médico, normalmente vai…',
    opcoes: [
      { valor: 'sus', rotulo: 'Posto, UPA ou hospital público' },
      { valor: 'plano_empresa', rotulo: 'Plano pago pela empresa' },
      { valor: 'plano_proprio', rotulo: 'Plano pago pela família ou particular' },
    ],
  },
  {
    campo: 'escola',
    titulo: 'As crianças ou adolescentes da casa estudam em…',
    opcoes: [
      { valor: 'publica', rotulo: 'Escola pública' },
      { valor: 'particular', rotulo: 'Escola particular' },
      { valor: 'nenhuma', rotulo: 'Não tem criança em idade escolar' },
    ],
  },
  {
    campo: 'deslocamento',
    titulo: 'No dia a dia, você se desloca mais de…',
    opcoes: [
      { valor: 'publico', rotulo: 'Ônibus, trem, metrô, BRT ou van' },
      { valor: 'carro', rotulo: 'Carro próprio' },
      { valor: 'moto', rotulo: 'Moto, bicicleta ou a pé' },
      { valor: 'app', rotulo: 'Aplicativo ou táxi' },
      { valor: 'casa', rotulo: 'Trabalho em casa' },
    ],
  },
  {
    campo: 'trabalho',
    titulo: 'Hoje seu trabalho principal é…',
    opcoes: [
      { valor: 'carteira', rotulo: 'Carteira assinada' },
      { valor: 'servidor', rotulo: 'Servidor(a) público(a)' },
      { valor: 'autonomo', rotulo: 'Por conta própria, MEI ou aplicativo' },
      { valor: 'empresario', rotulo: 'Tenho empresa com funcionários' },
      { valor: 'aposentado', rotulo: 'Aposentado(a)' },
      { valor: 'sem_trabalho', rotulo: 'Estudo, procuro trabalho ou cuido da casa' },
    ],
  },
  {
    campo: 'banheiros',
    titulo: 'Quantos banheiros tem a sua casa?',
    opcoes: [
      { valor: 1, rotulo: '1' },
      { valor: 2, rotulo: '2' },
      { valor: 3, rotulo: '3 ou mais' },
    ],
  },
]

interface SobreVoceProps {
  /** Pergunta de região da eleição; vem antes das outras. */
  regioes?: Quiz['regioes']
  onContinuar: (perfil: Perfil) => void
}

export function SobreVoce({ regioes, onContinuar }: SobreVoceProps) {
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO)
  const perguntas: Pergunta[] = regioes
    ? [{ campo: 'regiao', titulo: regioes.pergunta, opcoes: regioes.opcoes.map((o) => ({ valor: o.valor, rotulo: o.rotulo })) }, ...PERGUNTAS]
    : PERGUNTAS

  function escolher(campo: Campo, valor: Perfil[Campo]) {
    setPerfil((atual) => ({ ...atual, [campo]: atual[campo] === valor ? null : valor }))
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-12 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-extrabold text-balance">{perguntas.length} toques sobre a sua rotina</h1>
        <p className="text-tinta-suave">
          Para mostrar situações parecidas com o seu dia a dia e com a sua região. Pode pular
          qualquer uma, e nada disso sai do seu celular.
        </p>
      </header>

      {perguntas.map((q) => (
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
