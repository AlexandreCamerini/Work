import { useMemo } from 'react'
import { manifesto } from '../data'
import { useFluxoCtx } from '../fluxo/contexto'
import { PERFIL_VAZIO, selecionarCenas } from '../lib/perfil'
import { Marca } from '../ui/icones'
import { Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

export function Abertura() {
  const { dados, estado, enviar, reiniciar } = useFluxoCtx()
  const { quiz } = dados
  // o número exato depende do perfil (variantes por região e rotina): por isso "cerca de"
  const n = useMemo(() => selecionarCenas(quiz.perguntas, PERFIL_VAZIO).length, [quiz])
  const turno = manifesto.find((m) => m.id === dados.id)?.primeiroTurno
  const temProgresso = Object.keys(estado.respostas).length > 0
  useFocoAoEntrar()

  return (
    <Tela
      etapa="abertura"
      animar={estado.direcao === 'tras' ? 'tras' : null}
      topo={
        <a href="#" className="link -ml-2 no-underline" aria-label="Combina?, voltar ao início">
          <Marca />
        </a>
      }
      rodape={
        <div className="acoes">
          <button type="button" className="btn btn-pri" onClick={() => enviar({ tipo: 'avancar' })}>
            {temProgresso ? 'Continuar' : 'Bora começar'}
          </button>
        </div>
      }
    >
      <p className="rotulo mt-3 text-destaque-texto">
        {quiz.eleicao}
        {turno ? ` · 1º turno em ${turno}` : ''}
      </p>
      <h1 className="titulo" style={{ fontSize: 30 }} tabIndex={-1} data-foco>
        {quiz.titulo}
      </h1>
      <p className="sub" style={{ fontSize: 16 }}>
        São cerca de {n} {quiz.descricao}. Em cada uma, escolha o que acha melhor. No fim, mostramos o que cada candidato
        propõe, com a fonte.
      </p>
      <ul className="pilulas claras">
        <li>Uns 5 minutos</li>
        <li>Dá pra voltar e trocar</li>
        <li>Suas respostas ficam no seu aparelho</li>
        <li>Nomes escondidos até o fim</li>
      </ul>
      <p className="nota">
        Isto não é pesquisa eleitoral. Não dizemos em quem votar. Só comparamos as suas escolhas com o que os candidatos
        propõem em público.
      </p>
      {temProgresso && (
        <button type="button" className="link mt-1" onClick={reiniciar}>
          Começar do zero
        </button>
      )}
    </Tela>
  )
}
