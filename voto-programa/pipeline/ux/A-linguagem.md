# A. Linguagem simples: perguntas, respostas e interface

Revisão de 25/09/2026 para público de baixa escolaridade. **Nada foi alterado no projeto**: as
propostas estão em `pipeline/ux/textos-propostos.json` (125 trocas de texto, 95 reescritas
diferentes, porque várias opções se repetem em cenas-variante) e podem ser aplicadas depois de
revisadas. Nenhum `id` e nenhuma `preferencia` mudam, então as notas de aderência seguem válidas.

## Resultado em números

| | Hoje | Com as propostas |
|---|---|---|
| Violações de tamanho (`checar_legibilidade.py`) | **30** | **0** |
| Opções com mais de 12 palavras | 18 | 0 |
| Perguntas com mais de 12 palavras | 3 | 0 |
| Frases de cena com mais de 20 palavras | 9 | 0 |
| Avisos de sigla/jargão sem explicação | 18 | 6 (todos explicados no próprio texto ou de uso comum: BRT, Cedae, MEI, INSS, fracking) |
| Cenas (perguntas) com algum texto alterado | — | 45 de 48 |

As 3 opções em "Precisa reavaliação" já cabem no limite de palavras; por isso a simulação zera
mesmo sem mexer nelas.

Como reproduzir:

```
python3 pipeline/ux/checar_legibilidade.py                     # textos atuais: 30 violações, exit 1
python3 pipeline/ux/checar_legibilidade.py --propostas pipeline/ux/textos-propostos.json   # 0, exit 0
python3 pipeline/ux/checar_legibilidade.py --avisos            # lista também siglas e jargões
```

O script conta como palavra todo pedaço separado por espaço que tenha letra ou número ("R$" e
"14,25" contam como duas). Ao aplicar as propostas em memória, ele confere se o `antes` ainda é
o texto atual e se `palavras_depois` bate.

## Critérios usados

1. **Mesmo sentido da `preferencia`** (regra que não se quebra): mesma direção e mesmo
   alcance. Quando o texto atual ia além da preferência ("zerar" onde ela diz "isentar ou
   reduzir"; "morador e policial" onde ela mede mortes causadas pela polícia), a proposta
   volta para a preferência e o motivo diz isso. Detalhe que já estava fora do texto atual
   (por exemplo, "dos três Poderes") continua fora; nada foi acrescentado.
2. **Tamanho:** opção ≤ 12 palavras; pergunta ≤ 12; cena com até 2 frases de ≤ 20 palavras
   cada.
3. **Começa por verbo ou coisa concreta** ("Romper o contrato…", "Câmera que lê placa…"), não
   por pergunta retórica ("Não cumpriu? …"), que confunde quem lê devagar.
4. **Sem sigla sem explicação:** IPVA, SUS, INSS e MEI ficam (todo mundo conhece). BRT, Cedae e
   fracking ganham explicação no texto. IOF, Faetec, Inea, IR, "tabela do SUS" e "União" saem.
5. **Sem jargão:** concessão, subsídio, alíquota, superávit, royalties, voucher, pejotização,
   contraturno, drenagem, acolhimento, recomposição, incentivo fiscal, emendas parlamentares,
   regras fiscais… viram palavras de conversa.
6. **Uma ideia por opção e tamanho parecido** dentro da mesma cena. Onde só uma opção tinha
   argumento de venda ("pra valer deixar o carro", "que já leva pro emprego", "pra ter mais
   gás"), ele saiu, porque puxa a escolha.
7. **Anonimato:** nenhum bordão ou nome de programa. A revisão achou **5 detalhes que só um
   candidato usa**, conferidos nos dossiês. Eles saem porque a `preferencia` não os tem:
   - "até chegar a R$ 5" (metrô, governador);
   - "de R$ 81 mil pra R$ 140 mil" (MEI, presidente);
   - "pelo menos 10 ministérios" (presidente);
   - "pena quatro vezes maior" (celular, presidente);
   - "como na margem equatorial" (petróleo, presidente).
   "Tarifa zero" (bordão de dois candidatos a governador) virou "de graça". "Patrulha Maria
   da Penha" fica: é programa público que já existe e vários candidatos citam.
8. **Mesmo texto para a mesma opção** em todas as cenas-variante (por exemplo, as 4 cenas de
   clima e as 3 de fila do SUS).

Cenas revisadas sem mudança: `barca-leste` (governador), `escala-6x1` e `largar-escola`
(presidente). "Escola cívico-militar", "fim da escala 6x1" e "poupança mensal" continuam como
decidido na curadoria: o nome é a própria política.

## Precisa reavaliação

Nestas opções, simplificar mudaria o sentido, ou o texto atual já não diz o mesmo que a
`preferencia`. Não há proposta de texto no JSON. Quem decide é o dono do produto, e talvez seja
preciso refazer as notas.

| Eleição / cena | Opção atual | Preferência | Problema |
|---|---|---|---|
| presidente / escala-6x1 **b** | Poder combinar a minha jornada direto com a empresa. | Prevalência do negociado entre trabalhador e empresa sobre o legislado, com liberdade para escolher a própria escala. | O texto não diz que o acordo **vale mais que a lei**, que é o centro da preferência. Um texto fiel ("O que você combinar com a empresa vale mais que a lei") muda muito a forma como a opção é lida. |
| governador / operacao-policial **b** e via-expressa-fechada **b** | Prendeu quem manda, com investigação e sem guerra na rua. | Operações orientadas por inteligência com o objetivo de prender, e não de neutralizar. | "Quem manda" limita a opção aos chefes, e a preferência não faz isso. "Sem guerra na rua" é um jeito suave de dizer "não matar". Um texto fiel ("prender em vez de matar") muda o tom da opção perto das outras. |
| presidente / trabalho-app **b** | Previdência pra quem trabalha em app, sem sindicato no meio. | Proteção social e previdenciária para trabalhadores de aplicativo, sem protagonismo de dirigentes sindicais, mantendo a flexibilidade. | O texto deixa de fora "mantendo a flexibilidade", que é o que separa esta opção da (a). Não coube em 12 palavras sem usar palavra carregada ("liberdade"). Sugestão para avaliar: "Aposentadoria e auxílio pra quem é de app, sem sindicato e com horário livre" (14 palavras). |

## Tabela resumida (reescritas diferentes; a lista completa, cena a cena, está no JSON)


### Governador RJ

| Cena(s) | Campo | Antes | Depois | Pal. | Motivo |
|---|---|---|---|---|---|
| trem-parado | pergunta | O que o governo devia fazer com a empresa que opera o trem? | O que o governo devia fazer com a empresa do trem? | 11 | passava do limite de palavras |
| trem-parado | opcao:a | Não cumpriu o contrato? Rompe e troca a empresa. | Romper o contrato se a empresa não cumprir as metas. | 10 | começa com verbo; 'troca a empresa' não está na preferência (rescindir por descumprir metas) |
| trem-parado | opcao:b | Auditar o contrato e cobrar, sem rasgar o acordo. | Manter a empresa, mas conferir o contrato e cobrar o combinado. | 11 | 'auditar' é palavra difícil; 'manter a empresa' deixa claro o 'sem romper' |
| trem-parado | opcao:d | O Estado retoma o trem e passa a operar com empresa pública. | Tirar o trem da empresa privada e passar pra uma empresa pública. | 12 | 'o Estado retoma' é abstrato; diz quem sai e quem entra |
| estrada-interior | cena | Pra ir à cidade vizinha, você pega estrada estadual com buraco e sem acostamento, e o ônibus passa de hora em hora. | Pra ir à cidade vizinha, você pega estrada estadual com buraco e sem acostamento. O ônibus passa de hora em hora. | 21 | passava do limite de palavras (frase de 22); virou duas frases |
| estrada-interior | opcao:a | O estado recapeia e vigia as estradas com dinheiro próprio. | Refazer o asfalto e vigiar as estradas com dinheiro do estado. | 11 | 'recapeia' é palavra técnica; começa com verbo |
| estrada-interior | opcao:b | Passar as estradas pra concessão privada, sem pedágio novo. | Passar as estradas pra empresas privadas cuidarem, sem pedágio novo. | 10 | jargão ('concessão') |
| estrada-interior | opcao:d | Passagem de ônibus intermunicipal mais barata, com ajuda do estado. | Passagem de ônibus entre cidades mais barata, com dinheiro do estado. | 11 | 'intermunicipal' é palavra longa; 'ajuda' virou 'dinheiro do estado' (subsídio) |
| transito-carro | opcao:b | BRT ligando a Baixada à rede do Rio. | Mais BRT, ônibus com pista própria, ligando a Baixada ao Rio. | 11 | sigla sem explicação (BRT) |
| transito-carro | opcao:c | Novas ligações entre as vias expressas, pra desafogar Linha Vermelha e Av. Brasil. | Novas pistas ligando as vias expressas, como Linha Vermelha e Avenida Brasil. | 12 | passava do limite de palavras; 'ligações' virou 'pistas' |
| transito-carro | opcao:d | Passagem cada vez mais barata, até a tarifa zero, pra valer deixar o carro. | Baixar a passagem aos poucos, até ficar de graça. | 9 | passava do limite de palavras; 'tarifa zero' é bordão de campanha; tira o argumento de venda ('pra valer deixar o carro') |
| passagem-cara, vale-transporte | opcao:a | Estado banca parte da passagem intermunicipal pra todo mundo. | Estado paga parte da passagem do ônibus entre cidades, pra todos. | 11 | 'intermunicipal' é palavra longa |
| passagem-cara, vale-transporte | opcao:c | Tirar o cartão de passagem da mão das empresas de ônibus e abrir as contas. | Tirar o cartão de passagem das empresas e mostrar o custo real. | 12 | passava do limite de palavras; 'abrir as contas' virou 'mostrar o custo real' (transparência do custo da tarifa) |
| passagem-cara, vale-transporte | opcao:d | Metrô mais barato, até chegar a R$ 5. | Mais dinheiro do estado pra baixar a passagem do metrô. | 10 | tira detalhe que só um candidato usa (quebrava o anonimato) ('até R$ 5' é promessa de um candidato); igual à preferência |
| vale-transporte | cena | Quem trabalha com você, ou na sua casa, vem de Nova Iguaçu: são R$ 14,25 por trecho, e o vale-transporte pesa pra todo mundo. | Quem trabalha com você, ou na sua casa, vem de Nova Iguaçu. São R$ 14,25 por trecho, e o vale-transporte pesa pra todo mundo. | 24 | passava do limite de palavras (frase de 24); virou duas frases |
| fila-especialista, plano-voltou-sus | opcao:b | Centros públicos de especialidade em cada região do estado. | Centro público de médico especialista em cada região do estado. | 10 | 'especialidade' é abstrato |
| fila-especialista, plano-voltou-sus | opcao:c | Mutirão de cirurgia à noite e no fim de semana. | Mutirão fixo de cirurgia, à noite e no fim de semana. | 11 | fica mais perto da preferência (mutirão permanente) |
| saude-interior | cena | Pra fazer quimioterapia, sua tia sai de van às 4h da manhã rumo ao Rio e só volta depois das 20h. | Pra fazer quimioterapia, sua tia pega a van pro Rio às 4h da manhã. Só volta depois das 20h. | 19 | passava do limite de palavras (frase de 21); virou duas frases |
| escola-bagunca | opcao:a | Militar da reserva cuidando da disciplina (escola cívico-militar). | Escola cívico-militar, com militar aposentado cuidando da disciplina. | 8 | tira o parêntese; 'da reserva' virou 'aposentado' |
| escola-bagunca | opcao:b | Escola o dia inteiro, com laboratório de ciência e tecnologia. | Escola o dia inteiro, com foco em ciência, tecnologia e matemática. | 11 | fica mais perto da preferência (a preferência fala de foco, não de laboratório) |
| escola-bagunca | opcao:c | Reforço de português e matemática no contraturno. | Aula de reforço em português e matemática, no outro turno. | 10 | jargão ('contraturno') |
| falta-tecnico | pergunta | O que a rede estadual de ensino devia priorizar? | O que a escola estadual devia fazer primeiro? | 8 | 'rede estadual de ensino' e 'priorizar' são formais |
| falta-tecnico | opcao:b | Cursos da Faetec ligados às empresas de cada região. | Cursos técnicos do estado voltados às empresas de cada região. | 10 | sigla sem explicação (Faetec) |
| falta-tecnico | opcao:d | Escola em tempo integral com ciência e tecnologia. | Escola o dia inteiro, com foco em ciência, tecnologia e matemática. | 11 | mesmo texto da opção igual em escola-bagunca; 'tempo integral' virou 'o dia inteiro' |
| operacao-policial, via-expressa-fechada | opcao:a | O território foi retomado e o crime não manda mais ali. | A polícia retomou a área e o crime não manda mais ali. | 12 | 'território' é abstrato; diz quem retomou |
| operacao-policial, via-expressa-fechada | opcao:c | A polícia ficou e o Estado entrou com serviço no dia seguinte. | A polícia ficou, e o governo chegou com serviço público depois. | 11 | 'o Estado entrou com serviço' era vago |
| operacao-policial, via-expressa-fechada | opcao:d | Morreu menos gente: morador e policial. | Morreu menos gente na ação da polícia, e toda morte foi contada. | 12 | fica mais perto da preferência: a preferência mede mortes causadas pela ação policial e pede contar todas; o texto atual falava de morte de policial, que a preferência não mede |
| celular-roubado | opcao:d | Câmera inteligente e tecnologia espalhadas pela cidade. | Câmera inteligente nas ruas, ligada direto à polícia. | 8 | fica mais perto da preferência ('integradas às polícias' faltava) |
| roubo-carro | opcao:d | Câmera que lê placa e tecnologia nas vias. | Câmera que lê placa nas ruas, ligada direto à polícia. | 10 | fica mais perto da preferência ('integradas às polícias' faltava) |
| medida-protetiva | opcao:c | Casa de acolhimento, com apoio pra ela recomeçar. | Abrigo pra ela, com advogado, psicólogo e ajuda em dinheiro. | 10 | jargão ('acolhimento'); fica mais perto da preferência (apoio jurídico, psicológico e financeiro) |
| medida-protetiva | opcao:d | Patrulha Maria da Penha visitando e acompanhando ela de perto. | Mais Patrulha Maria da Penha, visitando e acompanhando ela de perto. | 11 | fica mais perto da preferência (ampliar); programa público existente, citado por vários candidatos |
| rua-alagada, encosta-serra, garagem-alagada | opcao:a | Obra grande de drenagem e contenção de encosta. | Obra grande pra escoar a água da chuva e segurar os morros. | 12 | jargão ('drenagem', 'contenção de encosta') |
| falta-agua, caminhao-pipa | pergunta | O que o governo devia fazer com a empresa de água e esgoto? | O que fazer com a empresa de água e esgoto? | 10 | passava do limite de palavras |
| falta-agua, caminhao-pipa | opcao:b | Cobrar as metas de água e esgoto e fiscalizar de perto. | Fiscalizar de perto a meta de levar água e esgoto a todos. | 12 | 'cobrar as metas' era vago; fica mais perto da preferência (meta de universalização) |
| falta-agua, caminhao-pipa | opcao:c | Não cumpriu? Perde o contrato. | Romper o contrato se a empresa não cumprir o combinado. | 10 | começa com verbo; a pergunta retórica ('Não cumpriu?') confunde quem lê devagar |
| falta-agua, caminhao-pipa | opcao:d | O Estado retoma a Cedae e volta a cuidar da água e do esgoto. | Devolver a água e o esgoto pra Cedae, a empresa do estado. | 12 | passava do limite de palavras; explica a Cedae |
| primo-desempregado | opcao:c | Gerar emprego é papel da empresa privada; o estado deve cuidar da segurança. | Deixar o emprego com as empresas; o estado investe em segurança. | 11 | passava do limite de palavras; 'investe' fica mais perto de 'concentrar o investimento' |
| primo-desempregado | opcao:d | Zerar o IPVA da moto de quem trabalha com ela. | Baixar ou zerar o IPVA da moto de quem trabalha com ela. | 12 | fica mais perto da preferência (isenção OU redução; 'zerar' sozinho ia além) |
| servidor-recomposicao | cena | Você é servidor do estado e esperou quatro anos por uma parcela de recomposição que já estava em lei. | Você é servidor do estado e esperou quatro anos por um reajuste que já estava na lei. | 17 | jargão ('parcela de recomposição') |
| servidor-recomposicao | opcao:a | Recomposição pela inflação todo ano, sem atraso. | Salário corrigido pela inflação todo ano, sem atraso. | 8 | jargão ('recomposição') |
| servidor-recomposicao | opcao:b | Bônus para quem bate meta, com acordo de resultado. | Bônus pra quem bate a meta combinada com o governo. | 10 | jargão ('acordo de resultado') |
| servidor-recomposicao | opcao:c | Recuperar na Justiça o dinheiro da previdência dos servidores aplicado no Banco Master. | Recuperar na Justiça o dinheiro das aposentadorias aplicado no Banco Master. | 11 | passava do limite de palavras |
| licenca-empresa | cena | A licença ambiental do seu galpão está parada no Inea há meses, e o investimento não sai do papel. | A licença do seu galpão está parada há meses no órgão ambiental do estado. O investimento não sai do papel. | 20 | sigla sem explicação (Inea) |
| licenca-empresa | opcao:a | Um balcão digital único pra abrir, licenciar e pedir incentivo. | Um só site pra abrir a empresa, tirar licença e pedir incentivo. | 12 | 'balcão digital único' é jargão de gestão |
| licenca-empresa | opcao:b | Licença decidida na própria região, sem ir ao Inea na capital. | Licença decidida na sua própria região, sem depender da capital. | 10 | sigla sem explicação (Inea) |
| licenca-empresa | opcao:d | Incentivo fiscal só com meta de emprego, e devolve se não cumprir. | Desconto de imposto só pra quem cria emprego; se não criar, devolve. | 12 | jargão ('incentivo fiscal', 'meta') |
| correria-praia | opcao:c | Desmontar o domínio das facções nos territórios de onde vem a violência. | Retomar da mão das facções as áreas que elas dominam. | 10 | 'desmontar o domínio' e 'territórios' são abstratos; 'de onde vem a violência' não está na preferência |
| correria-praia | opcao:d | Câmera inteligente e tecnologia integrada às polícias. | Câmera inteligente nas ruas, ligada direto à polícia. | 8 | 'tecnologia integrada às polícias' é abstrato; mesmo texto de celular-roubado d |
| dinheiro-publico | opcao:a | Teto: o governo não pode gastar mais do que arrecada. | Teto: o gasto do governo só cresce se o que entra crescer. | 12 | fica mais perto da preferência: a preferência liga o crescimento da despesa ao da receita; o texto atual ('não gastar mais do que arrecada') é outra regra |
| dinheiro-publico | opcao:b | Auditar todo contrato, com um órgão só pra vigiar desvio. | Conferir todo contrato e criar órgão pra vigiar quem ganha cargo. | 11 | fica mais perto da preferência (a secretaria fiscaliza nomeados, não 'desvio' em geral); 'auditar' é palavra difícil |
| dinheiro-publico | opcao:c | Cortar cargo e enxugar a máquina. | Cortar cargos e gastos do dia a dia do governo. | 10 | jargão ('enxugar a máquina', custeio) |
| dinheiro-publico | opcao:d | Cortar a isenção de imposto dada a grandes empresas. | Rever e cortar os descontos de imposto dados a empresas. | 10 | fica mais perto da preferência (a preferência vale para empresas em geral, não só grandes); 'isenção' virou 'desconto' |

### Presidente

| Cena(s) | Campo | Antes | Depois | Pal. | Motivo |
|---|---|---|---|---|---|
| custo-contratar | opcao:a | Reduzir o custo da folha, sem tirar direito do trabalhador. | Baixar aos poucos o custo de ter empregado, sem tirar direito. | 11 | jargão ('folha'); fica mais perto da preferência (redução gradual) |
| custo-contratar | opcao:b | Contrato mais barato pro primeiro emprego e pra quem tem mais de 50. | Contrato mais barato pro 1º emprego e pra desempregado acima de 50. | 12 | passava do limite de palavras; fica mais perto da preferência (a preferência fala de desempregado com 50 ou mais) |
| custo-contratar | opcao:c | Subir o teto do MEI de R$ 81 mil pra R$ 140 mil por ano. | Aumentar o limite de quanto o MEI pode faturar por ano. | 11 | passava do limite de palavras; tira detalhe que só um candidato usa (quebrava o anonimato) (os valores R$ 81 mil → R$ 140 mil são de um candidato) |
| custo-contratar | opcao:d | Fiscalizar pejotização e terceirização que precarizam. | Fiscalizar quem troca carteira por PJ ou terceirizado pra tirar direitos. | 11 | jargão ('pejotização', 'precarizam') |
| trabalho-app | opcao:a | Uma lei com regra de ganho mínimo e direitos pra quem trabalha em app. | Lei do trabalho por app, com ganho mínimo e direitos. | 10 | passava do limite de palavras |
| salario-minimo | opcao:b | Zerar o imposto da cesta básica e devolver imposto a quem ganha pouco. | Cesta básica sem imposto, e imposto de volta pra quem ganha pouco. | 12 | passava do limite de palavras |
| salario-minimo | opcao:c | Programa de pontos: quem paga conta em dia e faz curso ganha desconto e juro menor. | Juro menor e desconto pra quem paga em dia e faz curso. | 12 | passava do limite de palavras (16); duas ideias numa só |
| imposto-renda | cena | Na hora de declarar o imposto de renda, você faz a conta de quanto vai pro governo, no salário e no que compra. | Declarando o imposto de renda, você soma quanto vai pro governo: no salário e nas compras. | 16 | passava do limite de palavras (frase de 23) |
| imposto-renda | opcao:a | Manter a isenção até R$ 5 mil e corrigir a tabela do IR todo ano. | Continuar sem imposto até R$ 5 mil, com tabela corrigida todo ano. | 12 | passava do limite de palavras; 'isenção' e 'IR' |
| imposto-renda | opcao:b | Rever a reforma tributária e baixar a alíquota do novo imposto sobre consumo. | Rever a reforma tributária e baixar imposto sobre produção e compras. | 11 | passava do limite de palavras; jargão ('alíquota') |
| imposto-renda | opcao:c | Acabar aos poucos com o IOF no câmbio. | Acabar aos poucos com o imposto sobre dólar e outras moedas. | 11 | sigla sem explicação (IOF) e 'câmbio' |
| juros-altos | opcao:a | Manter as regras fiscais de hoje e crescer pra dívida pesar menos. | Manter as regras de gasto de hoje e fazer o país crescer. | 12 | jargão ('regras fiscais') |
| juros-altos | opcao:b | Regras novas: cortar gastos e fazer superávit pra dívida cair. | Trocar as regras: gastar menos do que entra, pra dívida cair. | 11 | jargão ('superávit') |
| juros-altos | opcao:c | Vender imóveis da União e usar royalties num fundo pra pagar dívida. | Usar imóveis do governo e dinheiro do petróleo pra pagar a dívida. | 12 | jargão ('União', 'royalties'); a preferência não fala em vender |
| fila-cirurgia, especialista-longe, plano-voltou-sus | opcao:a | Hospital particular atendendo o SUS em horário vago. | Governo paga hospital particular pra fazer exame e cirurgia do SUS. | 11 | fica mais perto da preferência (contratar serviços da rede privada); 'em horário vago' não está na preferência |
| fila-cirurgia, especialista-longe, plano-voltou-sus | opcao:c | Mutirão e posto aberto à noite pra cirurgia e exame. | Mutirão e atendimento à noite pra consulta, exame e cirurgia. | 10 | posto de saúde não faz cirurgia; fica mais perto da preferência (terceiro turno e mutirões) |
| fila-cirurgia, especialista-longe, plano-voltou-sus | opcao:d | Pagar melhor os hospitais: corrigir a tabela do SUS. | Aumentar o que o SUS paga a hospitais e clínicas. | 10 | jargão ('tabela do SUS') |
| especialista-longe | cena | Pra consultar com especialista, sua mãe viaja de barco até a capital: dois dias de ida, e a fila ainda é de meses. | Pra consultar com especialista, sua mãe viaja dois dias de barco até a capital. E a fila ainda é de meses. | 21 | passava do limite de palavras (frase de 23); virou duas frases |
| faccao-bairro | cena | Em muitos bairros, talvez no de alguém que você conhece, a facção manda na rua e cobra taxa até do gás e da internet. | Em muitos bairros, talvez no de alguém que você conhece, a facção manda na rua. Ela cobra taxa até do gás e da internet. | 24 | passava do limite de palavras (frase de 24); virou duas frases |
| faccao-bairro | opcao:b | Criar o Ministério da Segurança e mandar dinheiro pros estados combaterem o crime. | Criar o Ministério da Segurança e dar dinheiro a estados e cidades. | 12 | passava do limite de palavras; fica mais perto da preferência (estados e municípios) |
| faccao-bairro | opcao:d | Polícia presente de forma permanente no bairro, sem o Exército entrar e sair. | Polícia fixa no bairro, em vez do Exército entrar e sair. | 11 | passava do limite de palavras |
| celular-roubado, celular-sinal | opcao:a | Prisão e pena quatro vezes maior pra quem rouba ou revende celular. | Pena mais dura, sem sair antes, pra quem rouba ou revende celular. | 12 | tira detalhe que só um candidato usa (quebrava o anonimato) ('quatro vezes maior' é promessa de um candidato); 'sem benefícios' virou 'sem sair antes' |
| celular-roubado, celular-sinal | opcao:b | Câmera com reconhecimento facial ligada no país inteiro. | Câmera que reconhece rosto, ligada aos dados da polícia no país todo. | 12 | fica mais perto da preferência (integrado a bancos de dados criminais) |
| pagar-faculdade | opcao:a | Empréstimo que só se paga depois de empregado, proporcional ao salário. | Empréstimo pago com parte do salário, só depois de empregado. | 10 | 'proporcional' é palavra difícil |
| pagar-faculdade | opcao:c | Voucher pra estudar em escola particular quando faltar vaga na pública. | Governo paga escola particular quando faltar vaga na pública. | 9 | jargão ('voucher') |
| pagar-faculdade | opcao:d | Curso técnico e tecnólogo de graça, que já leva pro emprego. | Mais vagas de graça em curso técnico e tecnólogo. | 9 | tira o argumento de venda ('que já leva pro emprego'), que só esta opção tinha |
| conta-luz | opcao:a | Petrobras de volta à venda de combustível e mais refinaria. | Petrobras voltar a vender combustível aos postos e refinar mais. | 10 | 'venda de combustível' era vago (a Petrobras já vende às distribuidoras); a preferência fala de distribuição |
| conta-luz | opcao:b | Cortar subsídios embutidos na conta de luz e baixar imposto de energia. | Baixar as taxas extras da conta de luz e imposto de energia. | 12 | jargão ('subsídios embutidos'); a preferência fala em reduzir, não zerar |
| conta-luz | opcao:c | Liberar a extração de gás de xisto (fracking) pra ter mais gás. | Liberar a extração de gás de xisto, o chamado fracking. | 10 | tira o argumento de venda ('pra ter mais gás'), que só esta opção tinha |
| conta-luz | opcao:d | Mais hidrelétrica e menos carvão. | Construir mais usina hidrelétrica e gerar menos energia com carvão. | 10 | opção bem mais curta que as outras (5 palavras); fica do mesmo tamanho |
| enchente-seca | cena | Num ano, a enchente leva a casa de conhecidos; no outro, a seca deixa a luz e a comida mais caras. | Num ano, a enchente leva a casa de conhecidos. No outro, a seca deixa a luz e a comida mais caras. | 21 | passava do limite de palavras (frase de 21); virou duas frases |
| enchente-seca, enchente-sul, fumaca-queimada, seca-nordeste | opcao:a | Zerar o desmatamento e cumprir as metas de emissão. | Zerar o desmatamento e cortar a poluição que esquenta o planeta. | 11 | jargão ('metas de emissão') |
| enchente-seca, enchente-sul, fumaca-queimada | opcao:b | Obras contra enchente: diques, reservatórios e drenagem. | Obras contra enchente e seca, como barragens, diques e reservatórios. | 10 | fica mais perto da preferência (eventos extremos: cheia e seca); 'drenagem' sai da lista, que vira exemplo com 'como'; mesmo texto nas 4 cenas |
| enchente-seca, enchente-sul, fumaca-queimada, seca-nordeste | opcao:d | Continuar buscando petróleo novo, como na margem equatorial. | Continuar procurando e tirando petróleo em lugares novos. | 8 | tira detalhe que só um candidato usa (quebrava o anonimato) ('margem equatorial' é fala de um candidato); fica mais perto da preferência (pesquisa e exploração) |
| enchente-sul | cena | Desde a enchente de 2024, cada chuva forte deixa a cidade em alerta, e tem gente que ainda não recuperou a casa. | Desde a enchente de 2024, cada chuva forte deixa a cidade em alerta. Tem gente que ainda não recuperou a casa. | 21 | passava do limite de palavras (frase de 22); virou duas frases |
| fumaca-queimada | cena | Na seca, a fumaça das queimadas cobre a cidade por semanas e o rio baixa tanto que o barco não passa. | Na seca, a fumaça das queimadas cobre a cidade por semanas. E o rio baixa tanto que o barco não passa. | 21 | passava do limite de palavras (frase de 21); virou duas frases |
| seca-nordeste | opcao:b | Obras contra seca e enchente: barragens e reservatórios. | Obras contra enchente e seca, como barragens, diques e reservatórios. | 10 | fica mais perto da preferência (eventos extremos: cheia e seca); 'drenagem' sai da lista, que vira exemplo com 'como'; mesmo texto nas 4 cenas |
| video-falso | opcao:a | Regular as plataformas pra conter mentira e discurso de ódio. | Criar regras pras redes sociais conterem mentira e discurso de ódio. | 11 | 'regular as plataformas' é jargão |
| video-falso | opcao:b | Nenhuma regra nova, e fim dos órgãos do governo que decidem o que é mentira. | Nenhuma regra nova e fim dos órgãos do governo que apontam mentira. | 12 | passava do limite de palavras |
| gasto-governo | opcao:a | Cortar pelo menos 10 ministérios e acabar com supersalário. | Cortar ministérios, cargos de indicação política e supersalários. | 8 | tira detalhe que só um candidato usa (quebrava o anonimato) ('pelo menos 10 ministérios' é promessa de um candidato); fica mais perto da preferência (cargos comissionados) |
| gasto-governo | opcao:b | Enfrentar o sistema de emendas parlamentares. | Mudar as regras do dinheiro que deputados e senadores escolhem onde gastar. | 12 | jargão ('emendas parlamentares'); 'enfrentar' virou 'mudar as regras' (reformar) |
| agressor-rondando | opcao:b | Casa de acolhimento e centro de atendimento à mulher perto de casa. | Mais abrigos e centros de apoio pra mulher que sofre violência. | 11 | jargão ('acolhimento'); fica mais perto da preferência (ampliar) |
| agressor-rondando | opcao:d | Prisão pra quem descumprir a medida protetiva, sem benefício. | Pena mais dura, sem sair antes, pra quem descumprir a medida protetiva. | 12 | jargão ('sem benefício'); fica mais perto da preferência (endurecer a punição e cumprir a pena toda) |


## Microcopy da interface

Nenhum aviso legal perde o sentido. "Não é pesquisa eleitoral", "não recomendamos voto", "suas
respostas não saem do seu aparelho" e "voto anônimo, só para análise interna, sem divulgar
resultado" continuam ditos, só que em frases mais curtas.

| Arquivo | Antes | Depois |
|---|---|---|
| src/App.tsx | Escolha a eleição. Você responde situações da vida real e a gente compara com o que os candidatos propõem, com a fala de cada um e a fonte. Os nomes ficam escondidos até o fim. | Escolha a eleição. Você diz o que faria em situações do dia a dia. A gente mostra qual candidato propõe o mesmo, com a fonte. Os nomes só aparecem no fim. |
| src/App.tsx | {n} compromissos acompanhados com evidência | {n} promessas conferidas, com fonte |
| src/App.tsx | Isto não é pesquisa eleitoral nem recomendação de voto. Suas respostas não saem do seu aparelho. | Isto não é pesquisa eleitoral. Não dizemos em quem votar. Suas respostas não saem do seu celular ou computador. |
| src/components/Intro.tsx | São {n} {descricao}. Você escolhe o que faria mais sentido, e a gente compara com o que os candidatos propõem, com a fala de cada um e o link da fonte. | São {n} {descricao}. Em cada uma, escolha o que acha melhor. No fim, mostramos o que cada candidato propõe, com a fonte. |
| src/components/Intro.tsx | Respostas não saem do seu celular / Candidatos escondidos até o fim | Suas respostas ficam no seu aparelho / Nomes escondidos até o fim |
| src/components/Intro.tsx | Isto não é pesquisa eleitoral nem recomendação de voto: mostra só o seu resultado, comparando as suas escolhas com propostas públicas dos candidatos. | Isto não é pesquisa eleitoral. Não dizemos em quem votar. Só comparamos as suas escolhas com o que os candidatos propõem em público. |
| src/components/SobreVoce.tsx | {n} toques sobre a sua rotina | {n} perguntas rápidas sobre você |
| src/components/SobreVoce.tsx | Para mostrar situações parecidas com o seu dia a dia e com a sua região. Pode pular qualquer uma, e nada disso sai do seu celular. | Assim mostramos situações parecidas com a sua vida. Pode pular qualquer uma. Nada disso sai do seu celular. |
| src/components/SobreVoce.tsx | No dia a dia, você se desloca mais de… | No dia a dia, você anda mais de… |
| src/components/Prioridades.tsx | Marque até 3. Esses temas contam em dobro no seu resultado. | Marque até 3 assuntos. Eles valem o dobro no seu resultado. |
| src/components/Cena.tsx | Nenhuma dessas / pular | Nenhuma dessas. Pular |
| src/components/Cena.tsx | Spoiler: aqui os candidatos propõem coisas bem parecidas. | Aqui os candidatos propõem quase a mesma coisa. |
| src/components/Resultados.tsx | O que cada candidato atende e o que não atende nas suas escolhas. Os nomes só aparecem depois que você votar. | Veja o que cada candidato propõe das suas escolhas. Os nomes aparecem depois do voto (ou se você preferir não votar). |
| src/components/Resultados.tsx | Toque em cada item para ver a proposta do candidato, com o trecho e a fonte. | Toque em cada item pra ver o que o candidato disse e onde. |
| src/components/Resultados.tsx | Atende / Atende em parte / Não atende | Propõe isso / Propõe em parte / Vai em outra direção |
| src/components/Resultados.tsx | O que atende e o que não atende ({x} ✓ · {y} ✗) | O que ele propõe das suas escolhas ({x} ✓ · {y} ✗) |
| src/components/Resultados.tsx | Poucas situações com proposta deste candidato (mínimo de {N}). Sem dado suficiente, sem percentual. | Este candidato falou pouco sobre essas situações (precisa de pelo menos {N}). Por isso, fica sem porcentagem. |
| src/components/Resultados.tsx | Sem proposta sobre {n} das suas escolhas: não conta nem a favor nem contra. | Não falou sobre {n} das suas escolhas. Isso não conta nem a favor nem contra. |
| src/components/Resultados.tsx | Compartilhar no WhatsApp | Mandar no WhatsApp |
| src/components/Resultados.tsx | Como calculamos, 1º parágrafo: Cada opção foi comparada com as propostas públicas de cada candidato (plano de governo, sabatinas e entrevistas), sempre com o trecho e a fonte. A nota de cada combinação é uma tabela fixa, igual para todo mundo; nenhuma IA calcula nada na hora em que você responde, e suas respostas não saem do seu aparelho. | Comparamos cada opção com o que cada candidato propôs em público (plano de governo, sabatinas e entrevistas), sempre com o trecho e a fonte. As notas são fixas e iguais para todo mundo. Nenhuma inteligência artificial calcula nada na hora, e suas respostas não saem do seu aparelho. |
| src/components/Resultados.tsx | Como calculamos, 2º parágrafo: "Atende" quer dizer… O percentual conta o quanto ele prefere a sua escolha às outras da mesma situação: quem apoia todas as opções igualmente fica no meio. … Temas prioritários valem em dobro. | "Propõe isso" quer dizer que o candidato defende o que você escolheu; "vai em outra direção", que ele defende outra coisa. A porcentagem mostra o quanto ele prefere a sua escolha às outras da mesma situação: quem apoia todas igual fica no meio. Se ele não falou do assunto, não conta nem a favor nem contra. Os assuntos que você marcou como mais importantes valem o dobro. |
| src/components/Resultados.tsx | Isto não é pesquisa eleitoral e não divulgamos resultado de votação. O voto é anônimo e só para análise interna: vira um contador, sem nenhum dado de quem votou. Tabela de notas gerada em {data}. | Isto não é pesquisa eleitoral, e não divulgamos o resultado da votação. O voto é anônimo e só serve pra análise interna: vira um número num contador, sem nenhum dado de quem votou. Notas atualizadas em {data}. |
| src/components/Votacao.tsx | Agora é com você: em quem você vota? | Agora é com você: em qual deles você votaria? |
| src/components/Votacao.tsx | Votando… | Enviando… |
| src/lib/votacao.ts (aviso abaixo do voto) | Anônimo e só para uso interno: somamos +1 ao candidato escolhido, sem guardar quem você é, de onde veio ou a hora. Nenhum resultado é divulgado, e suas respostas não saem do aparelho. | Seu voto é anônimo e só pra uso interno. Somamos 1 ao candidato escolhido, sem guardar quem você é, de onde veio nem a hora. Não divulgamos resultado. Suas respostas não saem do aparelho. |
| src/lib/votacao.ts (aviso abaixo do voto) | Anônimo e só para uso interno: guardamos apenas em que lugar do seu resultado estava o candidato escolhido (1º, 2º…), sem dizer quem é, para saber se o teste ajuda. Nenhum resultado é divulgado, e suas respostas não saem do aparelho. | Seu voto é anônimo e só pra uso interno. Guardamos só em que lugar da sua lista estava o candidato escolhido (1º, 2º…), sem o nome dele, pra saber se o teste ajuda. Não divulgamos resultado. Suas respostas não saem do aparelho. |
| src/lib/votacao.ts | Neste protótipo o voto não é enviado a lugar nenhum: ele só revela os nomes. / Seu voto não é enviado nem guardado: ele só revela os nomes. | Nesta versão de teste, o voto não vai pra lugar nenhum. Ele só mostra os nomes. / Seu voto não é enviado nem guardado. Ele só mostra os nomes. |
| src/lib/votacao.ts | Registrado de forma anônima, só para análise interna. Não divulgamos resultado de votação. | Voto anotado sem o seu nome, só pra análise interna. Não divulgamos resultado. |
| src/lib/votacao.ts | Você já tinha votado nesta eleição neste aparelho, então este voto não foi registrado de novo. | Você já votou nesta eleição neste aparelho. Este voto não contou de novo. |
| src/lib/votacao.ts | Muitos votos saindo da mesma rede agora. Este não foi registrado; tente de novo em um minuto. | Muita gente votando da mesma internet agora. Este voto não entrou. Tente de novo daqui a 1 minuto. |
| src/lib/votacao.ts | Não conseguimos confirmar que é uma pessoa votando, então o voto não foi registrado. | Não deu pra confirmar que é uma pessoa votando. O voto não entrou. |
| src/components/Acompanhamento.tsx | {n} compromissos de {plano} comparados com o que aconteceu no mandato ({mandato}). | {n} promessas de {plano}, conferidas com o que foi feito no mandato ({mandato}). |
| src/components/Acompanhamento.tsx | Na contramão | Fez o contrário |
| src/components/Acompanhamento.tsx | Ver evidências ({n}) | Ver fontes ({n}) |
| src/components/Acompanhamento.tsx | … Avaliamos se fez o que prometeu, nunca o mérito da política. | … Olhamos só se fez o que prometeu, não se a ideia é boa ou ruim. |

Textos que ficam como estão: "Qual proposta combina com o seu dia a dia?", "Bora começar",
"O que mais pesa no seu dia?", "Você sabia?", "Próxima", "Ver meu resultado", "Pular tudo",
"Manda pra galera", "Refazer o teste", "Prefiro não votar, só quero ver os nomes", "Prometeu,
fez?".

### Dois problemas de interface que a linguagem não resolve

1. **Resultados mostra a opção fora da cena.** Nas listas "Atende / Não atende", aparece só o
   `texto` da opção ("Romper o contrato se a empresa não cumprir as metas."), sem dizer de qual
   situação ela é: trem? água? Vale colocar antes o nome do tema ou uma etiqueta curta da cena
   (por exemplo, "Trem:").
2. **"Nisso eles concordam" deixa tudo em minúscula** (`o.texto…toLowerCase()`). Nomes
   próprios saem errados ("patrulha maria da penha", "sus"). O certo é baixar só a primeira
   letra.
