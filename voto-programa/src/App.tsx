import { useMemo, useState } from 'react'
import { Intro } from './components/Intro'
import { Questionario } from './components/Questionario'
import { Resultados } from './components/Resultados'
import { candidatos } from './data/candidatos'
import { calcularRanking } from './lib/matching'
import type { RespostaUsuario } from './types'

type Etapa = 'intro' | 'questionario' | 'resultado'

function App() {
  const [etapa, setEtapa] = useState<Etapa>('intro')
  const [respostas, setRespostas] = useState<RespostaUsuario[]>([])

  const ranking = useMemo(() => calcularRanking(candidatos, respostas), [respostas])

  if (etapa === 'questionario') {
    return (
      <Questionario
        onConcluir={(respostasFinais) => {
          setRespostas(respostasFinais)
          setEtapa('resultado')
        }}
      />
    )
  }

  if (etapa === 'resultado') {
    return (
      <Resultados
        ranking={ranking}
        respostas={respostas}
        onRefazer={() => {
          setRespostas([])
          setEtapa('questionario')
        }}
      />
    )
  }

  return <Intro onIniciar={() => setEtapa('questionario')} />
}

export default App
