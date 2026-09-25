import { RESPONSAVEL } from '../config'
import { useFluxoCtx } from '../fluxo/contexto'
import { useResultados } from '../fluxo/useResultados'
import { Folha } from '../ui/Folha'

export function ComoCalculamos({ onFechar }: { onFechar: () => void }) {
  const { dados } = useFluxoCtx()
  const { aderencia } = useResultados()
  return (
    <Folha titulo="Como calculamos" onFechar={onFechar}>
      <div className="flex flex-col gap-3 text-[15px]">
        <p className="m-0">
          Comparamos cada opção com o que cada candidato propôs em público (plano de governo, sabatinas e entrevistas), sempre
          com o trecho e a fonte. As notas são fixas e iguais para todo mundo. Nenhuma inteligência artificial calcula nada na
          hora, e suas respostas não saem do seu aparelho.
        </p>
        <p className="m-0">
          “Propõe isso” quer dizer que o candidato defende o que você escolheu; “vai em outra direção”, que ele defende outra
          coisa. A porcentagem mostra o quanto ele prefere a sua escolha às outras da mesma situação: quem apoia todas igual
          fica no meio. Se ele não falou do assunto, não conta nem a favor nem contra. Os assuntos que você marcou como mais
          importantes valem o dobro.
        </p>
        {dados.foraDoQuiz.nomes.length > 0 && (
          <p className="m-0">
            Fora deste teste ({dados.foraDoQuiz.motivo}): {dados.foraDoQuiz.nomes.join(', ')}.
          </p>
        )}
        <p className="m-0">
          Isto não é pesquisa eleitoral, e não divulgamos o resultado da votação. O voto é anônimo e só serve pra análise
          interna: vira um número num contador, sem nenhum dado de quem votou. Notas atualizadas em {aderencia.gerado_em}.
        </p>
        <p className="m-0">Responsável pelo site: {RESPONSAVEL || '(a definir antes da publicação)'}</p>
      </div>
    </Folha>
  )
}
