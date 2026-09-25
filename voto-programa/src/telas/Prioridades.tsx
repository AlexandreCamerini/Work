import { useState } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import { excedePrioridades, MAX_PRIORIDADES } from '../fluxo/maquina'
import { Check, SetaEsquerda } from '../ui/icones'
import { Segmentos, Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

export function Prioridades() {
  const { dados, estado, enviar, voltar } = useFluxoCtx()
  const [erro, setErro] = useState(false)
  const n = estado.prioridades.length
  useFocoAoEntrar()

  function alternar(tema: string) {
    if (excedePrioridades(estado, tema)) {
      setErro(true)
      return
    }
    setErro(false)
    enviar({ tipo: 'escolher', valor: tema })
  }

  const aviso = erro
    ? `Máximo de ${MAX_PRIORIDADES}. Desmarque um para trocar.`
    : n
      ? `${n} de ${MAX_PRIORIDADES} escolhidos`
      : 'Nenhum marcado: todos os temas valem igual.'

  return (
    <Tela
      etapa="prioridades"
      animar={estado.direcao}
      topo={
        <>
          <span className="tema">Prioridades</span>
          <Segmentos total={1} atual={0} rotulo="Prioridades" texto="Prioridades" />
        </>
      }
      rodape={
        <>
          <div className={`faixa ${erro ? 'faixa-erro' : 'faixa-dica'}`} aria-live="polite" role={erro ? 'alert' : undefined}>
            {aviso}
          </div>
          <div className="acoes">
            <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
              <SetaEsquerda />
            </button>
            {n ? (
              <button type="button" className="btn btn-pri" onClick={() => enviar({ tipo: 'avancar' })}>
                Continuar
              </button>
            ) : (
              <button type="button" className="btn btn-sec" onClick={() => enviar({ tipo: 'pular' })}>
                Pular
              </button>
            )}
          </div>
        </>
      }
    >
      <h1 className="titulo" id="q-pri" tabIndex={-1} data-foco>
        O que mais pesa no seu dia?
      </h1>
      <p className="sub">Marque até {MAX_PRIORIDADES} assuntos. Eles valem o dobro no seu resultado.</p>
      <div className="grade" role="group" aria-labelledby="q-pri">
        {dados.quiz.temas.map((t) => {
          const ativo = estado.prioridades.includes(t.id)
          return (
            <button key={t.id} type="button" className="escolha" aria-pressed={ativo} onClick={() => alternar(t.id)}>
              {ativo && (
                <span className="marca" aria-hidden="true">
                  <Check />
                </span>
              )}
              <span>{t.nome}</span>
            </button>
          )
        })}
      </div>
    </Tela>
  )
}
