import type { Pergunta } from '../types'

/**
 * Perguntas situacionais: cada uma descreve uma situação concreta do dia a dia
 * (não uma afirmação ideológica) e oferece 4 reações possíveis. Cada opção é
 * mapeada para uma posição no eixo (-2..+2) por decisão de produto, não pelo
 * eleitor — ele só reconhece a situação e escolhe a reação mais próxima da sua.
 *
 * Calibrado para o contexto fluminense (piloto RJ). Precisa de uma rodada de
 * validação com 5-10 pessoas fora da bolha política antes de ir para produção
 * — ver README, seção "Questionário situacional".
 */
export const perguntas: Pergunta[] = [
  {
    id: 'econ-1',
    eixoId: 'economia',
    cenario:
      'Seu primo entrega por aplicativo porque não conseguiu emprego formal. Ele paga tudo do próprio bolso — combustível, manutenção, sem INSS, sem 13º — mas ganha todo santo dia. O que ajudaria mais gente na situação dele?',
    opcoes: [
      { id: 'a', label: 'Reduzir impostos e burocracia pra empresa contratar com carteira assinada', posicao: 2 },
      { id: 'b', label: 'Deixar como está, o mercado se ajusta sozinho', posicao: 1 },
      { id: 'c', label: 'Obrigar os aplicativos a dar direitos trabalhistas, mesmo que a corrida fique mais cara', posicao: -1 },
      { id: 'd', label: 'Programa estadual de emprego direto, bancado com imposto sobre grandes empresas', posicao: -2 },
    ],
  },
  {
    id: 'econ-2',
    eixoId: 'economia',
    cenario:
      'No fim do mês, o que mais pesa no seu orçamento é a conta de luz, o gás e o ônibus ou gasolina pra ir trabalhar. Se o governo tivesse que escolher uma coisa pra aliviar isso agora, o que seria melhor?',
    opcoes: [
      { id: 'a', label: 'Reduzir impostos sobre energia e combustível pra todo mundo', posicao: 2 },
      { id: 'b', label: 'Nada — subsídio gera rombo nas contas públicas, o problema se resolve com crescimento', posicao: 1 },
      { id: 'c', label: 'Passe livre ou tarifa social de transporte pra quem ganha menos', posicao: -1 },
      { id: 'd', label: 'Ampliar programa de transferência de renda direto pro bolso de quem mais precisa', posicao: -2 },
    ],
  },
  {
    id: 'econ-3',
    eixoId: 'economia',
    cenario:
      'Uma fábrica ou loja fechou no seu bairro e várias pessoas conhecidas ficaram sem emprego. O que ajudaria mais rápido?',
    opcoes: [
      { id: 'a', label: 'Crédito e desburocratização pra pequeno empresário local reabrir ou expandir', posicao: 2 },
      { id: 'b', label: 'Nada — empresa que não se sustenta deve fechar mesmo', posicao: 1 },
      { id: 'c', label: 'Seguro-desemprego estadual complementar por mais tempo', posicao: -1 },
      { id: 'd', label: 'Estado criar posto de trabalho público na região', posicao: -2 },
    ],
  },

  {
    id: 'saude-1',
    eixoId: 'saude',
    cenario:
      'Você precisa de uma consulta com especialista e a fila do SUS no Rio está em meses. Um plano de saúde particular está fora do seu orçamento. Qual mudança faria mais diferença?',
    opcoes: [
      { id: 'a', label: 'O SUS receber muito mais investimento, mesmo que isso signifique aumentar impostos', posicao: 2 },
      { id: 'b', label: 'O SUS ser mais bem gerido com o dinheiro que já tem, sem aumentar imposto', posicao: 1 },
      { id: 'c', label: 'O governo pagar hospital ou clínica privada pra atender gente da fila do SUS', posicao: -1 },
      { id: 'd', label: 'Reduzir a regulação sobre plano de saúde pra ficar mais barato e acessível', posicao: -2 },
    ],
  },
  {
    id: 'saude-2',
    eixoId: 'saude',
    cenario:
      'Sua mãe idosa toma remédio de pressão e diabetes todo mês, e às vezes falta remédio dela na farmácia popular. O que resolveria isso?',
    opcoes: [
      { id: 'a', label: 'Estado comprar e distribuir remédio direto nos postos, ampliando o orçamento', posicao: 2 },
      { id: 'b', label: 'Melhorar a logística de compra do programa que já existe, sem gastar mais', posicao: 1 },
      { id: 'c', label: 'Vale-remédio pra comprar em farmácia privada com desconto', posicao: -1 },
      { id: 'd', label: 'Reduzir imposto sobre remédio pra baixar o preço em geral', posicao: -2 },
    ],
  },
  {
    id: 'saude-3',
    eixoId: 'saude',
    cenario:
      'Você foi a uma UPA com um caso urgente e ficou 6 horas no corredor esperando, sem leito disponível. O que mudaria isso mais rápido?',
    opcoes: [
      { id: 'a', label: 'Abrir mais leitos e contratar mais equipe com dinheiro público', posicao: 2 },
      { id: 'b', label: 'Melhorar a triagem e a gestão de fluxo, sem gastar mais', posicao: 1 },
      { id: 'c', label: 'Contrato emergencial com hospital privado pra dar vazão à demanda', posicao: -1 },
      { id: 'd', label: 'Isso é problema de gestão municipal, não prioridade do estado', posicao: -2 },
    ],
  },

  {
    id: 'edu-1',
    eixoId: 'educacao',
    cenario:
      'A escola pública do seu bairro perdeu metade dos professores de matemática e física este ano — ninguém quer o cargo pelo salário oferecido.',
    opcoes: [
      { id: 'a', label: 'Aumentar salário e plano de carreira do professor, com mais imposto se precisar', posicao: 2 },
      { id: 'b', label: 'Manter o orçamento, mas cobrar meta e avaliação de resultado do professor', posicao: 1 },
      { id: 'c', label: 'Terceirizar a gestão da escola pra uma rede privada administrar', posicao: -1 },
      { id: 'd', label: 'Direcionar a verba pra ensino técnico, não pra escola regular', posicao: -2 },
    ],
  },
  {
    id: 'edu-2',
    eixoId: 'educacao',
    cenario:
      'Seu filho terminou o ensino médio numa escola pública e não sabe se tenta faculdade ou procura emprego direto — não tem dinheiro pra cursinho nem pra bancar uma faculdade particular.',
    opcoes: [
      { id: 'a', label: 'Ampliar bolsa, financiamento estudantil e cota em universidade pública', posicao: 2 },
      { id: 'b', label: 'Investir mais em curso técnico gratuito, com empregabilidade mais rápida', posicao: 1 },
      { id: 'c', label: 'Voucher pra faculdade particular a distância, mais barata', posicao: -1 },
      { id: 'd', label: 'Isso se resolve com o mercado de trabalho, não com política de educação', posicao: -2 },
    ],
  },
  {
    id: 'edu-3',
    eixoId: 'educacao',
    cenario:
      'A creche pública mais perto de casa tem fila de espera de mais de um ano, e sem vaga você não consegue voltar a trabalhar.',
    opcoes: [
      { id: 'a', label: 'Construir mais creches públicas com dinheiro do estado', posicao: 2 },
      { id: 'b', label: 'Convênio com creche privada ou comunitária, pago pelo estado', posicao: 1 },
      { id: 'c', label: 'Auxílio-creche em dinheiro pra família escolher onde matricular', posicao: -1 },
      { id: 'd', label: 'Não é prioridade do governo estadual, é responsabilidade do município', posicao: -2 },
    ],
  },

  {
    id: 'seg-1',
    eixoId: 'seguranca',
    cenario:
      'Um ponto de moto foi assaltado na sua rua duas vezes este mês. O policiamento da região é esporádico.',
    opcoes: [
      { id: 'a', label: 'Mais policiamento ostensivo permanente no bairro, mesmo cortando de outra área', posicao: 2 },
      { id: 'b', label: 'Câmeras e viatura de ronda, sem aumentar efetivo', posicao: 1 },
      { id: 'c', label: 'Programa social pra jovem em vulnerabilidade, como prevenção de longo prazo', posicao: -1 },
      { id: 'd', label: 'Descriminalizar posse pra uso pessoal, tirando isso da prioridade da polícia', posicao: -2 },
    ],
  },
  {
    id: 'seg-2',
    eixoId: 'seguranca',
    cenario:
      'Tem tiroteio frequente perto da escola do seu filho, e às vezes a aula é suspensa por causa de operação policial.',
    opcoes: [
      { id: 'a', label: 'Operação policial mais dura e recorrente até a área ficar sob controle', posicao: 2 },
      { id: 'b', label: 'Inteligência mirada em quem comanda o tráfico, menos confronto em área residencial', posicao: 1 },
      { id: 'c', label: 'Programa social e de emprego na comunidade como prevenção, mais que polícia', posicao: -1 },
      { id: 'd', label: 'Descriminalizar drogas pra tirar o incentivo econômico do tráfico armado', posicao: -2 },
    ],
  },
  {
    id: 'seg-3',
    eixoId: 'seguranca',
    cenario:
      'Você foi vítima de furto de celular no transporte público e a delegacia disse que não tem viatura suficiente pra investigar casos assim.',
    opcoes: [
      { id: 'a', label: 'Mais efetivo e viatura pra delegacia comum, não só pra unidade de elite', posicao: 2 },
      { id: 'b', label: 'Investir em câmera de monitoramento e reconhecimento facial no transporte', posicao: 1 },
      { id: 'c', label: 'Aplicativo de denúncia e política de prevenção comunitária', posicao: -1 },
      { id: 'd', label: 'Isso é crime de baixo impacto — prioridade deveria ser crime violento', posicao: -2 },
    ],
  },

  {
    id: 'amb-1',
    eixoId: 'meio-ambiente',
    cenario: 'Depois de uma chuva forte, sua rua alaga e o rio perto de casa está com lixo e esgoto visível.',
    opcoes: [
      { id: 'a', label: 'Licenciamento ambiental mais rígido e fiscalização de despejo, mesmo afastando investimento', posicao: 2 },
      { id: 'b', label: 'Obra de drenagem pontual, sem mexer em regra ambiental', posicao: 1 },
      { id: 'c', label: 'Simplificar licenciamento pra atrair obra de infraestrutura mais rápido', posicao: -1 },
      { id: 'd', label: 'Prioridade é gerar emprego e receita, mesmo liberando mais licença ambiental', posicao: -2 },
    ],
  },
  {
    id: 'amb-2',
    eixoId: 'meio-ambiente',
    cenario:
      'Uma mineradora quer se instalar perto do seu bairro e promete emprego, mas moradores temem poeira, barulho e contaminação da água.',
    opcoes: [
      { id: 'a', label: 'Exigir estudo de impacto ambiental rigoroso antes de liberar, mesmo perdendo o investimento', posicao: 2 },
      { id: 'b', label: 'Liberar com condicionantes e fiscalização contínua', posicao: 1 },
      { id: 'c', label: 'Liberar rápido e fiscalizar depois se der problema', posicao: -1 },
      { id: 'd', label: 'Prioridade é o emprego — fiscalização ambiental atrapalha o desenvolvimento', posicao: -2 },
    ],
  },
  {
    id: 'amb-3',
    eixoId: 'meio-ambiente',
    cenario: 'Nos últimos anos as praias do Rio têm mais dias de mar impróprio pra banho por causa de esgoto não tratado.',
    opcoes: [
      { id: 'a', label: 'Investimento pesado em saneamento básico, mesmo com aumento de tarifa ou imposto', posicao: 2 },
      { id: 'b', label: 'Cobrar da concessionária de saneamento o cumprimento da meta contratual já existente', posicao: 1 },
      { id: 'c', label: 'Parceria público-privada pra acelerar a obra de saneamento', posicao: -1 },
      { id: 'd', label: 'Não é prioridade orçamentária frente a outras urgências', posicao: -2 },
    ],
  },

  {
    id: 'dir-1',
    eixoId: 'direitos',
    cenario:
      'Um vizinho seu, negro e de família de baixa renda, é o primeiro da família a tentar faculdade.',
    opcoes: [
      { id: 'a', label: 'Manter e ampliar cota racial e social em universidade e concurso público', posicao: 2 },
      { id: 'b', label: 'Cota só por critério de renda, sem considerar raça', posicao: 1 },
      { id: 'c', label: 'Cota é temporária e deveria estar sendo reduzida agora', posicao: -1 },
      { id: 'd', label: 'Sem cota — só a nota do vestibular ou concurso deveria contar', posicao: -2 },
    ],
  },
  {
    id: 'dir-2',
    eixoId: 'direitos',
    cenario: 'Você soube que uma pessoa trans da sua região foi mal atendida num posto de saúde por preconceito da equipe.',
    opcoes: [
      { id: 'a', label: 'Estado investir em treinamento das equipes e ter linha de cuidado específica no SUS estadual', posicao: 2 },
      { id: 'b', label: 'Já existe protocolo — só falta fiscalizar o cumprimento', posicao: 1 },
      { id: 'c', label: 'Isso é questão de comportamento individual, não cabe ao governo interferir', posicao: -1 },
      { id: 'd', label: 'Recurso deveria ir pra outras prioridades de saúde, não pra esse tema', posicao: -2 },
    ],
  },
  {
    id: 'dir-3',
    eixoId: 'direitos',
    cenario: 'Uma associação de moradores da sua comunidade quer participar da decisão de como gastar o orçamento de obras do bairro.',
    opcoes: [
      { id: 'a', label: 'Criar conselho popular vinculante, com poder real sobre parte do orçamento', posicao: 2 },
      { id: 'b', label: 'Consulta pública, mas a decisão final fica com o governo eleito', posicao: 1 },
      { id: 'c', label: 'Reunião informativa, sem abrir a decisão pra população', posicao: -1 },
      { id: 'd', label: 'Esse tipo de participação atrasa a execução da obra e não deveria existir', posicao: -2 },
    ],
  },
]
