import { useMemo, useState } from 'react'
import { Cena } from './components/Cena'
import { Intro } from './components/Intro'
import { Prioridades } from './components/Prioridades'
import { Resultados } from './components/Resultados'
import { aderencia, evidencias, quiz } from './data'
import { candidatos } from './data/candidatos'
import { calcularResultados } from './lib/matching'
import type { Resposta } from './types'

type Etapa = 'intro' | 'prioridades' | 'cenas' | 'resultado'

function App() {
  const [etapa, setEtapa] = useState<Etapa>('intro')
  const [prioridades, setPrioridades] = useState<string[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [indice, setIndice] = useState(0)

  const resultados = useMemo(
    () => calcularResultados(candidatos, quiz.perguntas, aderencia, respostas, prioridades),
    [respostas, prioridades],
  )

  function irPara(proxima: Etapa) {
    setEtapa(proxima)
    window.scrollTo({ top: 0 })
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
    const pergunta = quiz.perguntas[indice]
    return (
      <Cena
        key={pergunta.id}
        pergunta={pergunta}
        tema={quiz.temas.find((t) => t.id === pergunta.tema)}
        indice={indice}
        total={quiz.perguntas.length}
        onResponder={(opcaoId) => {
          if (opcaoId) setRespostas((r) => [...r, { perguntaId: pergunta.id, opcaoId }])
          if (indice + 1 < quiz.perguntas.length) {
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
        resultados={resultados}
        respostas={respostas}
        perguntas={quiz.perguntas}
        aderencia={aderencia}
        evidencias={evidencias}
        onRefazer={() => {
          setRespostas([])
          setPrioridades([])
          setIndice(0)
          irPara('intro')
        }}
      />
    )
  }

  return <Intro totalCenas={quiz.perguntas.length} onComecar={() => irPara('prioridades')} />
}

export default App
