# Contexto expandido da folha "Leia" — Governador RJ 2026

Arquivo de dados: `pipeline/ux/contexto-governador-rj.json` (formato `{"<pergunta_id>": {"paragrafos": [...], "fontes": [...]}}`).
Cobre as 26 perguntas de `src/data/quiz.json` (versão 3.4.0). Pesquisa feita em 25/09/2026.

## Decisões

**Estrutura fixa por pergunta** (3 ou 4 parágrafos, de 131 a 166 palavras no total):
1. Tamanho do problema, com números do estado (ou da região, quando a cena é regional).
2. Como funciona hoje e quem responde: estado, prefeitura, União ou empresa (concessionária, permissionária, consórcio).
3. Os caminhos: um trecho por opção da cena, na ordem das opções (a, b, c, d). Cada trecho segue o mesmo molde: "X faz tal coisa, **mas** tem tal limite". Cada opção recebe uma frase de tamanho parecido e um "mas".
4. (Opcional) O que o eleitor pode observar ou fazer no dia a dia (cadastro de alerta, registro de ocorrência, onde reclamar).

**Variantes do mesmo grupo** reaproveitam os parágrafos 2 e 3. O parágrafo 1 (e às vezes o 4) é trocado para a situação da cena:
- `trem-parado` / `estrada-interior` / `barca-leste` / `transito-carro`: o grupo tem opções diferentes em cada cena, então cada uma tem texto próprio.
- `passagem-cara` / `vale-transporte`: o §1 de vale-transporte explica a regra dos 6% (Lei 7.418/1985), e o §4 fala da empresa que declara a renda.
- `fila-especialista` / `plano-voltou-sus`: o §1 de plano-voltou-sus usa a regra da ANS (última faixa aos 59 anos, até 6x). `saude-interior` tem opções próprias (câncer e interior).
- `escola-bagunca` / `falta-tecnico`: o §2 é comum (rede estadual); os §1 e §3 são próprios.
- `operacao-policial` / `via-expressa-fechada`: o §3 é igual; a variante da via expressa usa os dados da Avenida Brasil e do batalhão de vias expressas.
- `celular-roubado` / `roubo-carro`: o §2 é comum; a opção "c" muda (receptação de celular / desmanche) e a opção "d" também (câmera inteligente / leitura de placa).
- `rua-alagada` / `encosta-serra` / `garagem-alagada`: os §3 e §4 são comuns; o §1 muda (estado / serra / capital); `encosta-serra` tem §2 próprio.
- `falta-agua` / `caminhao-pipa`: o §1 de caminhao-pipa usa as paradas das estações de Cachoeiras de Macacu.
- `primo-desempregado`, `servidor-recomposicao`, `licenca-empresa`, `correria-praia`, `dinheiro-publico`, `medida-protetiva`: texto próprio.

**O fato da cena** nunca é repetido palavra por palavra. Quando a mesma fonte do fato é útil (O Globo sobre a última viagem da SuperVia, Gazeta do Povo/CNT, IBGE, Anuário, ISP de set/2026, Firjan), o texto usa outro dado dela.

**Neutralidade**
- Nenhum nome de candidato, vice, partido, coligação ou número de urna. O validador confere a lista de `src/data/candidatos.ts` e os demais nomes com dossiê em `pipeline/dossies/governador-rj/`.
- Ficaram de fora as matérias cujo dado vinha de fala de candidato. Exemplos: a promessa de IPVA zero para motos, a coluna do Extra sobre a Linha 3 com as propostas dos candidatos e a matéria de 30/01/2025 sobre o "alerta extremo", que cita um candidato.
- Nenhum "especialistas dizem" sem fonte. Os contras de cada caminho são limites práticos (custo, prazo, dependência de fiscalização, risco jurídico), sem adjetivo de valor.

**Legibilidade**: frases de até 20 palavras e parágrafos de até 55 palavras (a contagem separa por espaço; "R$ 9,40" conta como 2 palavras). Siglas são explicadas no próprio texto ou são de uso comum (PM, SUS, TCE).

## Validação (Python)

O script fica em `scratchpad/govrj_ctx/validar.py`, fora do repositório. Ele confere:
- as 26 perguntas cobertas, sem id extra;
- de 3 a 4 parágrafos, até 55 palavras cada e até 200 no total;
- frases de até 20 palavras;
- que o fato não aparece literalmente;
- nomes (completos e partes distintivas, com maiúscula) e partidos no texto, no título e no veículo;
- nomes nos tokens da URL;
- de 2 a 4 fontes, com URL `https://` e data no formato AAAA-MM-DD.

Resultado: **OK**. São 62 fontes distintas.

## Fontes mais usadas

| Uso | Fonte |
|---|---|
| 3 | Extra, 22/06/2026: adesão do RJ ao Propag (dívida, teto de gastos, recomposição dos servidores) |
| 3 | STF, 20/02/2025: guardas municipais podem fazer policiamento urbano |
| 3 | O Globo, 27/01/2026: "Cerco digital" (câmeras, leitura de placas) |
| 3 | g1/Cemaden, 25/02/2022: 925 mil pessoas em áreas de risco no RJ |
| 3 | g1, 04/03/2026: Projeto Iguaçu (enchentes na Baixada) |
| 3 | Ministério das Comunicações, 21/07/2026: alertas da Defesa Civil no celular |
| 2 | O Globo/IBGE, 09/10/2025: Censo 2022, deslocamento casa-trabalho |
| 2 | O Globo, 19/12/2025 e g1, 06/05/2025: Bilhete Único Intermunicipal (valor, beneficiários, auditoria do TCE) |
| 2 | SBT News, 13/11/2025 e O Globo, 17/12/2024: fila da regulação estadual (SER) |
| 2 | O Globo, 16/08/2026: rede estadual de ensino (professores, tempo integral) |
| 2 | Agência Brasil/ISP, 16/01/2026: 797 mortes por intervenção policial em 2025 |

Por veículo: O Globo (24 citações), g1 (21), Extra (5) e Agência Brasil (5). Há também fontes primárias: IBGE, STF, ANS, Ministério da Saúde, Ministério das Comunicações, SEPM-RJ, Planalto e o Anuário do Todos Pela Educação (dados do Inep).

## Onde faltou dado confiável (texto escrito sem número ou com dado mais antigo)

- **Informalidade no estado em 2026**: o release do IBGE traz só as UFs extremas. Usei o dado nacional dos trabalhadores de aplicativo (72,1%) e a renda média do RJ.
- **Estradas do interior**: não achei o recorte RJ da Pesquisa CNT 2025, então usei a de 2024. Também não há dado de frequência do ônibus intermunicipal.
- **Trem de passageiros no interior**: não existe projeto estadual. Citei a EF-118 (federal, de carga, com previsão de passageiros).
- **Cívico-militar no RJ**: sem avaliação local. O contra-argumento vem de matéria sobre SP (seleção de escolas).
- **Delegacias da mulher**: a contagem de 14 Deams 24h é de 2023, e a lista atual da Polícia Civil tem mais unidades. Por isso o texto diz só que elas "não existem em todas as cidades".
- **Tornozeleira em agressores, abrigos e custo de reestatizar a Cedae**: não achei número estadual confiável. Esses trechos ficaram sem número.
- **População em área de risco**: o dado mais recente acessível é do Cemaden, de 2022, com base no Censo 2010.
- **Leitura de placas**: a nota da SEPM diz 1.105 veículos no título e 1.015 no texto. Usei "mais de mil".
- **Comissionados exonerados em 2026**: o impacto financeiro não foi divulgado de forma consolidada. Uma matéria com números da folha foi descartada por inconsistência de datas.
- **Datas**: a matéria do Tempo Real sobre o DER tem data de indexação 22/09/2026, mas o texto é de 15/04/2026, e usei a data do texto. Para a Lei 7.418 usei a data da lei.
- **Títulos**: o título da Folha (trabalhadores de apps) foi reconstruído a partir do endereço da página, porque o título não veio completo na leitura.
