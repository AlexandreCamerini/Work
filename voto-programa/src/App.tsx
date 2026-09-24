import { useMemo, useState } from 'react'
import { Cena } from './components/Cena'
import { Intro } from './components/Intro'
import { Prioridades } from './components/Prioridades'
import { Resultados } from './components/Resultados'
import { SobreVoce } from './components/SobreVoce'
import { aderencia, evidencias, quiz } from './data'
import { candidatos } from './data/candidatos'
import { calcularResultados } from './lib/matching'
import { PERFIL_VAZIO, selecionarCenas } from './lib/perfil'
import type { Perfil, Resposta } from './types'

type Etapa = 'intro' | 'perfil' | 'prioridades' | 'cenas' | 'resultado'

function App() {
  const [etapa, setEtapa] = useState<Etapa>('intro')
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO)
  const [prioridades, setPrioridades] = useState<string[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [indice, setIndice] = useState(0)

  const cenas = useMemo(() => selecionarCenas(quiz.perguntas, perfil), [perfil])
  const resultados = useMemo(
    () => calcularResultados(candidatos, cenas, aderencia, respostas, prioridades),
    [cenas, respostas, prioridades],
  )

  function irPara(proxima: Etapa) {
    setEtapa(proxima)
    window.scrollTo({ top: 0 })
  }

  if (etapa === 'perfil') {
    return (
      <SobreVoce
        onContinuar={(p) => {
          setPerfil(p)
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
        resultados={resultados}
        respostas={respostas}
        perguntas={cenas}
        aderencia={aderencia}
        evidencias={evidencias}
        onRefazer={() => {
          setRespostas([])
          setPrioridades([])
          setPerfil(PERFIL_VAZIO)
          setIndice(0)
          irPara('intro')
        }}
      />
    )
  }

  return <Intro totalCenas={selecionarCenas(quiz.perguntas, PERFIL_VAZIO).length} onComecar={() => irPara('perfil')} />
}

export default App
