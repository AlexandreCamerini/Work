# Contexto expandido da folha "Leia": quiz de presidente

Arquivo de dados: `src/data/contexto-presidente.json` (22 perguntas, todas as de `src/data/quiz-presidente.json` v1.3.0).
Formato: `{"<pergunta_id>": {"paragrafos": [...], "fontes": [{veiculo, titulo, data, url}]}}`.
Pesquisa feita em 25/09/2026. Cada URL foi aberta (busca com conteúdo ou leitura direta) antes de entrar como fonte.

## Estrutura dos textos

1. **Tamanho do problema**: números nacionais. Nas variantes regionais, números da região da cena.
2. **Como funciona hoje e de quem é a responsabilidade**: União, Congresso, estados, BC, agências e STF quando for o caso.
3. **Caminhos em debate**: uma frase por opção da cena, na ordem das opções (a, b, c, d). Cada frase traz um ganho e um custo ("…, mas …"), com o mesmo peso para todas.
4. **(Opcional) O que observar**: um dado concreto ou algo que o eleitor pode conferir sozinho (Meu INSS, Ligue 180, Portal da Transparência, regulação do SUS).

Limites checados por script: 3 a 4 parágrafos, até 55 palavras por parágrafo, até 200 no total, frases de até 20 palavras e 2 a 4 fontes. O maior texto tem 173 palavras.

## Decisões editoriais

- **Sem nomes de pessoas.** O texto não traz candidato, vice, partido, número de urna, ministro nem relator. Ações de governo aparecem como fato institucional ("o governo federal", "um programa federal", "o Congresso aprovou"), sem avaliar a gestão.
- **URLs sem nomes de candidatos.** Algumas páginas úteis ficaram de fora porque o endereço tinha o nome de um candidato. Foi o caso de notícias da Agência Senado e do Estadão sobre a desoneração e sobre a AGU, e de uma matéria da Folha sobre o IOF. Em cada caso usei outra página com o mesmo dado: Agência Câmara, Planalto ou Receita.
- **O fato não se repete.** O script procura trechos de 7 palavras iguais aos do `fato` da cena, e não achou nenhum. Onde o fato já dá o número principal, o texto traz outro dado. Exemplos: no IR, o imposto mínimo da alta renda em vez dos 10 milhões de isentos; no celular, furto contra roubo e horários em vez do total de 830 mil.
- **Variantes do mesmo grupo.**
  - `fila-sus` (fila-cirurgia, especialista-longe, plano-voltou-sus): o parágrafo de caminhos é igual nas três. Os parágrafos 1, 2 e 4 mudam: dados nacionais do SUS; Norte (médicos por mil habitantes, residência, carretas em AM e RO); planos de saúde (ANS, teto de 5,11% só para planos individuais, faixa etária de 59 anos).
  - `clima` (enchente-seca, enchente-sul, fumaca-queimada, seca-nordeste): o parágrafo de caminhos é igual nos quatro. Os parágrafos 1, 2 e 4 são regionais: RS (Guaíba, diques, ANA); Norte e Centro-Oeste (fogo por bioma, rio Negro, desmatamento em MT); Nordeste (Carro-Pipa, transposição, emergências em PE).
  - `celular` (roubado, sinal): os parágrafos 2 e 3 são iguais nos dois. O parágrafo 1 muda: furto no transporte e no ponto de ônibus, ou roubo em via pública com pico às 20h.
  - `jornada`, `renda`, `escola`: cada cena tem opções diferentes, por isso cada uma tem texto próprio.
- **Equilíbrio.** Nenhum caminho é chamado de melhor. Os contras vêm de fatos das fontes (custo fiscal, decisões do STF, falta de verba nos estados, erros do reconhecimento facial com pessoas negras), sem "especialistas dizem".
- **Linguagem.** As siglas foram explicadas ou evitadas. "CCJ" virou "uma comissão do Senado" e "PEC" virou "proposta de mudança na Constituição". Ficaram PIB, STF, INSS, ANS, PF, PRF e BC.
- **Contas próprias.** Três números saem de contas simples sobre dados das fontes: hidrelétricas com 51,7% e carvão com cerca de 1,4% da geração (tabela da EPE); mais de 360 descumprimentos de medida protetiva por dia (132.025 ÷ 365); 62 cidades do Amazonas em emergência (Manaus mais 61, segundo O Globo).

## Fontes mais usadas

| Fonte | Usos | Onde |
|---|---|---|
| Nova NDC (gov.br, Ministério dos Povos Indígenas, 13/11/2024) | 4 | as 4 cenas de clima (meta de 59% a 67% até 2035) |
| Ministério da Saúde: hospitais privados (29/08/2026) e carretas (19/09/2026) | 2 cada | fila-sus |
| Portal Drauzio Varella: um ano do Agora Tem Especialistas (01/06/2026) | 2 | fila-cirurgia, plano-voltou-sus |
| g1: Anuário de Segurança 2026, celulares (23/07/2026) | 2 | celular-roubado, celular-sinal |
| g1: Anuário 2026, feminicídios e mortes violentas (23/07/2026) | 2 | faccao-bairro, agressor-rondando |
| Agência Brasil: reconhecimento facial (07/05/2025) e efetivo da PF (18/11/2025) | 2 cada | celular |
| Ponte: câmeras corporais nas PMs (08/07/2025) | 2 | celular |
| MapBiomas: Monitor do Fogo 2024 (22/01/2025) | 2 | enchente-seca, fumaca-queimada |
| ANA: enchentes do RS (30/04/2025) | 2 | enchente-seca, enchente-sul |
| Agência Câmara: desoneração da folha (17/09/2024) | 2 | escala-6x1, custo-contratar |
| g1: Censo Escolar 2025, técnico e integral (26/02/2026) | 2 | largar-escola, pagar-faculdade |

Por veículo: g1 (13 citações), Agência Brasil (6), Folha (5), e Planalto, Agência Câmara, Agência Senado, Ministério da Saúde e gov.br/NDC (4 cada). Há 70 URLs distintas. Fontes primárias usadas: IBGE, Banco Central, Tesouro, Receita, Inpe, MapBiomas, ANA, EPE, ANS, Ministério da Saúde, Ministério da Integração, STF, STJ, TST, FBSP, Dieese, DataSenado e NIC.br.

## Onde faltou dado confiável (escrito sem número)

- **Fila do SUS:** não há fila nacional pública. O texto diz isso e não dá um total atualizado. O número de 5,7 milhões já está no `fato`.
- **Contrato mais barato para jovens e para quem tem mais de 50 anos (custo-contratar b):** não achei estimativa de impacto nem histórico verificável. O texto só descreve o ganho e o custo.
- **Inadimplência atual do Fies:** não achei taxa oficial de 2025–2026. O texto cita a renegociação de 2026 (descontos de até 99% e estimativa de mais de 1 milhão de beneficiados).
- **Evasão escolar depois de 2022:** o MEC não tinha publicado o dado até julho de 2026, e o texto diz isso.
- **Estruturas federais contra desinformação (video-falso b):** a página da AGU sobre a procuradoria não tem data. Por isso não foi usada como fonte, e o texto não descreve o órgão.
- **Alíquotas do Imposto Seletivo e alíquota de referência do IVA:** ainda não estavam definidas em setembro de 2026. O texto não dá percentuais.
- **Efeito da escola cívico-militar no aprendizado:** não há avaliação independente. O texto cita só o número de escolas e as ações no STF.
- **Programa voluntário que premia quem paga em dia (salario-minimo c):** não existe programa federal para medir. O texto só descreve o ganho e o custo.

## Validação

Script em `scratchpad/validar_contexto.py`, fora do repositório. Ele verifica:

- as 22 perguntas estão cobertas;
- os limites de palavras por parágrafo, por texto e por frase;
- nomes e sobrenomes de todos os candidatos e vices de `src/data/candidatos-presidente.ts`, incluindo os que estão fora do quiz, no texto, nos títulos e nas URLs;
- siglas de partidos como palavra isolada no texto;
- que toda URL começa com https e toda data está no formato AAAA-MM-DD;
- que nenhum trecho de 7 palavras repete o `fato` da cena.

Resultado: nenhuma pendência.
