import { useEffect, useRef } from 'react'
import { useFluxoCtx } from '../fluxo/contexto'
import type { CampoPerfil } from '../fluxo/maquina'
import { Check, SetaEsquerda } from '../ui/icones'
import { Segmentos, Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

type Opcao = { valor: string | number; rotulo: string }

const PERGUNTAS: Record<Exclude<CampoPerfil, 'regiao'>, { titulo: string; opcoes: Opcao[] }> = {
  saude: {
    titulo: 'Quando alguém da casa precisa de médico, normalmente vai…',
    opcoes: [
      { valor: 'sus', rotulo: 'Posto, UPA ou hospital público' },
      { valor: 'plano_empresa', rotulo: 'Plano pago pela empresa' },
      { valor: 'plano_proprio', rotulo: 'Plano pago pela família ou particular' },
    ],
  },
  escola: {
    titulo: 'As crianças ou adolescentes da casa estudam em…',
    opcoes: [
      { valor: 'publica', rotulo: 'Escola pública' },
      { valor: 'particular', rotulo: 'Escola particular' },
      { valor: 'nenhuma', rotulo: 'Não tem criança em idade escolar' },
    ],
  },
  deslocamento: {
    titulo: 'No dia a dia, você anda mais de…',
    opcoes: [
      { valor: 'publico', rotulo: 'Ônibus, trem, metrô, BRT ou van' },
      { valor: 'carro', rotulo: 'Carro próprio' },
      { valor: 'moto', rotulo: 'Moto, bicicleta ou a pé' },
      { valor: 'app', rotulo: 'Aplicativo ou táxi' },
      { valor: 'casa', rotulo: 'Trabalho em casa' },
    ],
  },
  trabalho: {
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
  banheiros: {
    titulo: 'Quantos banheiros tem a sua casa?',
    opcoes: [
      { valor: 1, rotulo: '1' },
      { valor: 2, rotulo: '2' },
      { valor: 3, rotulo: '3 ou mais' },
    ],
  },
}

/** Pausa para a pessoa ver o que marcou antes de avançar (mantida com movimento reduzido). */
const PAUSA = 260

export function PerfilPasso({ passo }: { passo: number }) {
  const { dados, estado, enviar, voltar, anunciar } = useFluxoCtx()
  const campo = estado.passosPerfil[passo]
  const n = estado.passosPerfil.length
  const q =
    campo === 'regiao'
      ? { titulo: dados.quiz.regioes?.pergunta ?? 'Onde você mora?', opcoes: dados.quiz.regioes?.opcoes ?? [] }
      : PERGUNTAS[campo]
  const atual = estado.perfil[campo]
  const timer = useRef<number | undefined>(undefined)
  useFocoAoEntrar()

  useEffect(() => {
    anunciar(`Sobre você: pergunta ${passo + 1} de ${n}.`)
    return () => window.clearTimeout(timer.current)
  }, [anunciar, passo, n])

  function escolher(valor: string | number) {
    enviar({ tipo: 'escolher', valor })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => enviar({ tipo: 'avancar' }), PAUSA)
  }

  return (
    <Tela
      etapa="perfil"
      animar={estado.direcao}
      topo={
        <>
          <span className="tema">Sobre você</span>
          <Segmentos total={n} atual={passo} rotulo="Sobre você" texto={`Pergunta ${passo + 1} de ${n}`} />
          <span className="contador" aria-hidden="true">
            {passo + 1}/{n}
          </span>
        </>
      }
      rodape={
        <div className="acoes">
          <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
            <SetaEsquerda />
          </button>
          <button type="button" className="btn btn-sec" onClick={() => enviar({ tipo: 'pular' })}>
            Pular
          </button>
        </div>
      }
    >
      <h1 className="titulo" id="q-perfil" tabIndex={-1} data-foco>
        {q.titulo}
      </h1>
      <p className="sub">Toque na resposta para seguir. Nada disso sai do seu celular.</p>
      <div className="lista" role="group" aria-labelledby="q-perfil">
        {q.opcoes.map((o) => (
          <button
            key={String(o.valor)}
            type="button"
            className="escolha"
            aria-pressed={atual === o.valor}
            onClick={() => escolher(o.valor)}
          >
            <span>{o.rotulo}</span>
            <span className="marca" aria-hidden="true">
              <Check />
            </span>
          </button>
        ))}
      </div>
      {passo === 0 && (
        <button type="button" className="link mt-1" onClick={() => enviar({ tipo: 'pular', tudo: true })}>
          Pular tudo
        </button>
      )}
    </Tela>
  )
}
