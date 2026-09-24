import { useMemo, useState } from 'react'
import { calcularResultados } from '../lib/matching'
import { misturarTemas } from '../lib/ordem'
import { PERFIL_VAZIO, selecionarCenas } from '../lib/perfil'
import type { Eleicao, Pergunta, Resposta } from '../types'
import { Cena } from './Cena'
import { Intro } from './Intro'
import { Prioridades } from './Prioridades'
import { Resultados } from './Resultados'
import { SobreVoce } from './SobreVoce'

type Etapa = 'intro' | 'perfil' | 'prioridades' | 'cenas' | 'resultado'

export function Quiz({ eleicao }: { eleicao: Eleicao }) {
  const { quiz, aderencia, candidatos } = eleicao
  const [etapa, setEtapa] = useState<Etapa>('intro')
  /** Sorteada uma vez por pessoa, sem tema repetido em sequência. */
  const [cenas, setCenas] = useState<Pergunta[]>([])
  const [prioridades, setPrioridades] = useState<string[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [indice, setIndice] = useState(0)

  const resultados = useMemo(
    () => calcularResultados(candidatos, cenas, aderencia, respostas, prioridades),
    [candidatos, cenas, aderencia, respostas, prioridades],
  )

  function irPara(proxima: Etapa) {
    setEtapa(proxima)
    window.scrollTo({ top: 0 })
  }

  if (etapa === 'perfil') {
    return (
      <SobreVoce
        onContinuar={(p) => {
          setCenas(misturarTemas(selecionarCenas(quiz.perguntas, p)))
          irPara('prioridades')
        }}
      />
    )
  }

  if (etapa === 'prioridades') {
    return (
      <Prioridades
        temas={quiz.temas}
        onContinuar={(escolhidas) => {
          setPrioridades(escolhidas)
          irPara('cenas')
        }}
      />
    )
  }

  if (etapa === 'cenas') {
    const pergunta = cenas[indice]
    return (
      <Cena
        key={pergunta.id}
        pergunta={pergunta}
        tema={quiz.temas.find((t) => t.id === pergunta.tema)}
        indice={indice}
        total={cenas.length}
        onResponder={(opcaoId) => {
          if (opcaoId) setRespostas((r) => [...r, { perguntaId: pergunta.id, opcaoId }])
          if (indice + 1 < cenas.length) {
            setIndice(indice + 1)
            window.scrollTo({ top: 0 })
          } else {
            irPara('resultado')
          }
        }}
      />
    )
  }

  if (etapa === 'resultado') {
    return (
      <Resultados
        eleicao={eleicao}
        resultados={resultados}
        respostas={respostas}
        perguntas={cenas}
        onRefazer={() => {
          setRespostas([])
          setPrioridades([])
          setCenas([])
          setIndice(0)
          irPara('intro')
        }}
      />
    )
  }

  return (
    <Intro quiz={quiz} totalCenas={selecionarCenas(quiz.perguntas, PERFIL_VAZIO).length} onComecar={() => irPara('perfil')} />
  )
}
