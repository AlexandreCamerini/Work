import { useEffect, useMemo, useRef, useState } from 'react'
import { ALTURA, LARGURA, descricaoDoCartao, desenharCartao, type DadosCartao } from '../fluxo/cartao'
import { useFluxoCtx } from '../fluxo/contexto'
import { rotuloAsCegas, textoCompartilhar } from '../fluxo/resultado'
import { useResultados } from '../fluxo/useResultados'
import { SetaEsquerda } from '../ui/icones'
import { Tela } from '../ui/Tela'
import { useFocoAoEntrar } from '../ui/useFoco'

async function fontesProntas() {
  try {
    await Promise.all([
      document.fonts?.load("800 70px 'Bricolage Grotesque Variable'"),
      document.fonts?.load("800 36px 'Nunito Sans Variable'"),
    ])
  } catch {
    // sem as fontes, o canvas usa a do sistema
  }
}

export function Cartao() {
  const { dados, estado, voltar, reiniciar } = useFluxoCtx()
  const { resultados } = useResultados()
  const [comNomes, setComNomes] = useState(false)
  const [previa, setPrevia] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null)
  useFocoAoEntrar()

  const endereco = `${window.location.origin}${window.location.pathname}#${dados.id}`
  const d: DadosCartao = useMemo(
    () => ({
      eleicao: dados.quiz.eleicao,
      prioridades: estado.prioridades.map((p) => dados.quiz.temas.find((t) => t.id === p)?.nome ?? p),
      // o voto nunca entra: só a ordem do resultado
      linhas: resultados.map((r, i) => ({ rotulo: rotuloAsCegas(i), nome: r.candidato.nome, afinidade: r.afinidade })),
      comNomes,
      endereco: window.location.host || 'combina',
    }),
    [dados, estado.prioridades, resultados, comNomes],
  )

  useEffect(() => {
    let ativo = true
    fontesProntas().then(() => {
      if (!ativo) return
      const cv = canvas.current ?? document.createElement('canvas')
      canvas.current = cv
      cv.width = LARGURA
      cv.height = ALTURA
      const g = cv.getContext('2d')
      if (!g) return
      desenharCartao(g, d)
      setPrevia(cv.toDataURL('image/png'))
    })
    return () => {
      ativo = false
    }
  }, [d])

  const texto = textoCompartilhar(dados.quiz.titulo, dados.quiz.eleicao, endereco, resultados, comNomes)

  function baixar(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'combina-resultado.png'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setAviso('Imagem baixada. Agora é só mandar.')
  }

  function compartilhar() {
    canvas.current?.toBlob(async (blob) => {
      if (!blob) return
      const arquivo = new File([blob], 'combina-resultado.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [arquivo] })) {
        try {
          await navigator.share({ files: [arquivo], text: texto })
          return
        } catch (e) {
          if ((e as DOMException)?.name === 'AbortError') return // a pessoa desistiu
        }
      }
      baixar(blob)
    }, 'image/png')
  }

  return (
    <Tela
      etapa="cartao"
      animar={estado.direcao}
      topo={<span className="tema">Compartilhar</span>}
      rodape={
        <>
          <div className="acoes">
            <button type="button" className="btn btn-voltar" aria-label="Voltar" data-testid="voltar" onClick={voltar}>
              <SetaEsquerda />
            </button>
            <button type="button" className="btn btn-destaque" data-testid="cartao-compartilhar" onClick={compartilhar} disabled={!previa}>
              Compartilhar imagem
            </button>
          </div>
          <button type="button" className="link self-center" onClick={reiniciar}>
            Refazer o teste
          </button>
        </>
      }
    >
      <h1 className="titulo" style={{ fontSize: 22 }} tabIndex={-1} data-foco>
        Manda pra galera
      </h1>
      {previa ? (
        <img className="previa" src={previa} alt={descricaoDoCartao(d)} width={LARGURA} height={ALTURA} data-testid="cartao-previa" />
      ) : (
        <div className="previa" role="img" aria-label="Montando o cartão…" />
      )}
      <button type="button" className="alterna" role="switch" aria-checked={comNomes} onClick={() => setComNomes((v) => !v)}>
        <span>Incluir nomes e percentuais</span>
        <span className="trilho" aria-hidden="true" />
      </button>
      <p className="nota">Seu voto nunca entra no cartão nem na mensagem.</p>
      <p className="mt-2 mb-0 flex flex-wrap items-center gap-x-2">
        <a className="link link-forte -ml-2" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer">
          Mandar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
        </a>
      </p>
      <p className="sr-only" aria-live="polite">
        {aviso}
      </p>
    </Tela>
  )
}
