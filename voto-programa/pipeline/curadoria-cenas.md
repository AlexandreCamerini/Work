# Curadoria metodológica das cenas (25/09/2026)

Revisão das 34 cenas (18 de governador, 16 de presidente) com critérios de desenho de
questionário de opinião. Aplicada por `pipeline/curadoria_2026_09.py`, que confere o texto
antigo antes de cada troca.

**Regra de ouro desta rodada:** mudar só a forma, nunca o sentido. A `preferencia` de cada
opção ficou igual, então as notas de aderência (e as evidências) continuam válidas sem
reavaliação. Onde a reescrita aproximou o texto da preferência, isso está indicado.

## Critérios

| # | Critério | Por que importa |
|---|---|---|
| 1 | **Cegamento:** opção não pode repetir bordão ou marca de programa de candidato | quem reconhece o bordão reconhece o candidato e o teste deixa de ser às cegas |
| 2 | **Sem palavra carregada** em uma opção só ("água não é pra dar lucro", "liberdade acima de tudo") | termo emotivo puxa escolha; as opções concorrentes ficam em desvantagem |
| 3 | **Cena neutra:** o problema descrito não pode apontar para uma das saídas | cena que só fala de "cargo fantasma" empurra para cortar gasto |
| 4 | **Cena da vida real de quem responde:** situação concreta, com hora, lugar e custo | cena abstrata ("o tempo ficou mais extremo") não gera identificação |
| 5 | **Inclusão:** cena padrão não pode excluir quem não vive aquilo | "você ganha um salário mínimo" exclui quem não ganha, mas convive com isso em casa |
| 6 | **Variante por perfil onde a realidade muda** | a mesma política chega por caminhos diferentes para quem usa SUS ou plano, ônibus ou carro |
| 7 | **Filtro de perfil coerente com a cena** | cena "na empresa onde você trabalha" não pode ir para motoboy |
| 8 | **Linguagem de conversa, uma ideia por opção, tamanho parecido** | opção longa e detalhada parece "mais certa"; jargão afasta |

## Mudanças de texto

### Governador (versão 3.3.0)

| Cena | Antes | Depois | Critério |
|---|---|---|---|
| trem-parado c | Botar o trem no padrão do BRT, com segurança própria a bordo. | Trem novo, no horário e com segurança própria a bordo. | 1 |
| transito-carro (cena) | …Linha Vermelha travada. Pra rodar 10 km você gasta quase meia hora. | …Linha Vermelha parada. Dez quilômetros levam quase meia hora, e amanhã tem de novo. | 4 |
| transito-carro c | Novas ligações de via: Via Light com Linha Vermelha, Av. Brasil e Dutra. | Novas ligações entre as vias expressas, pra desafogar Linha Vermelha e Av. Brasil. | 1, 8 |
| passagem-cara b | …sem estourar as contas. | …sem estourar as contas do estado. | 8 (ambíguo: contas de quem?) |
| passagem-cara c | Tirar o cartão do ônibus da mão das empresas… | Tirar o cartão de passagem da mão das empresas de ônibus… | 8 |
| celular-roubado b, roubo-carro b | Muito mais PM… | Mais PM na rua, chamando quem passou no concurso. | 2 (intensificador); mais fiel à preferência |
| falta-agua d | O Estado retoma a Cedae: água não é pra dar lucro. | O Estado retoma a Cedae e volta a cuidar da água e do esgoto. | 2 |
| primo-desempregado c | Emprego é com a empresa privada. O estado cuida da segurança. | Gerar emprego é papel da empresa privada; o estado deve cuidar da segurança. | 8 |
| primo-desempregado d | Zerar o imposto da moto… | Zerar o IPVA da moto… | 8 (fiel à preferência) |
| servidor-recomposicao c | Ir à Justiça recuperar o dinheiro do Rioprevidência… | Recuperar na Justiça o dinheiro da previdência dos servidores… | 8 (nome de autarquia) |
| dinheiro-publico (cena) | No posto falta remédio, mas no jornal tem notícia de cargo fantasma e gasto com festa. | O estado diz que falta dinheiro, e no posto falta remédio. No jornal, tem notícia de cargo sobrando e de imposto perdoado pra empresa grande. | 3 (a cena antiga só apontava para cortar gasto; a opção d, cortar isenção, ficava órfã) |
| dinheiro-publico b | Auditoria em todo contrato e um órgão só pra vigiar a integridade. | Auditar todo contrato, com um órgão só pra vigiar desvio. | 8 |

### Presidente (versão 1.2.0)

| Cena | Antes | Depois | Critério |
|---|---|---|---|
| escala-6x1 (cena) | Você trabalha seis dias… | Você, ou alguém da sua casa, trabalha seis dias… | 5 |
| escala-6x1 c | Rever as regras que deixaram o trabalho mais precário. | Rever pontos da reforma trabalhista e da terceirização. | 2 |
| trabalho-app d | Deixar como está: app é liberdade, sem lei nova mexendo nisso. | Deixar como está, sem lei nova sobre trabalho por app. | 2 |
| salario-minimo (cena) | Você ganha um salário mínimo… | Você, ou alguém da sua casa, vive com um salário mínimo… | 5 |
| imposto-renda (cena) | …você sente que paga imposto em tudo… | …você faz a conta de quanto vai pro governo, no salário e no que compra. | 3 (a antiga puxava para "baixar imposto") |
| juros-altos (cena) | Você adiou trocar de carro ou financiar a casa… | Os juros do cartão, do crediário e do financiamento continuam altos, e qualquer compra parcelada pesa. | 5 (a antiga só falava com quem financia carro ou casa; cartão e crediário são a dívida de todas as faixas) |
| faccao-bairro (cena) | Em muitos bairros, uma facção manda… | Em muitos bairros, talvez no de alguém que você conhece, a facção manda… cobra taxa até do gás e da internet. | 4 |
| faccao-bairro a | Tratar facção como terrorismo e se juntar aos EUA contra elas. | Tratar facção como grupo terrorista, com apoio de outros países. | 1 (a coalizão com os EUA é bordão de campanha) |
| conta-luz (cena) | …e encher o tanque assusta. | …e encher o tanque ou comprar o botijão assusta. | 5 |
| enchente-seca (cena) | Enchente num ano, seca no outro: parece que o tempo ficou mais extremo. | Num ano, a enchente leva a casa de conhecidos; no outro, a seca deixa a luz e a comida mais caras. | 4 |
| video-falso b | Nenhuma regra nova: liberdade de expressão acima de tudo. | Nenhuma regra nova, e fim dos órgãos do governo que decidem o que é mentira. | 2; mais fiel à preferência |
| gasto-governo (cena e pergunta) | Você vê notícia de ministério demais e de emenda parlamentar bilionária. / O que você cobraria…? | O governo diz que falta dinheiro pra saúde e escola, e a conta da própria máquina não para de crescer. / Por onde o próximo presidente devia começar? | 3 (a antiga favorecia cortar ministérios e emendas; manter estatais ficava deslocado) |

## Cenas-variante por perfil (novas)

Mesma pergunta e mesmas opções (e notas) da cena de origem, com a situação contada do jeito
que ela acontece para aquele perfil.

| Nova cena | Origem | Para quem | Situação |
|---|---|---|---|
| plano-voltou-sus (gov. e pres.) | fila-especialista / fila-cirurgia | tem plano de saúde | o plano da mãe ficou caro depois dos 60 e ela voltou pro SUS |
| garagem-alagada | rua-alagada | faixa de serviço privado | garagem do prédio alagada, carro do vizinho submerso |
| caminhao-pipa | falta-agua | faixa de serviço privado | prédio sem água, caminhão-pipa na cota do condomínio |
| celular-sinal (pres.) | celular-roubado | usa carro ou aplicativo | celular levado no sinal, com o vidro aberto |
| vale-transporte | passagem-cara | anda de carro | quem trabalha com você ou na sua casa vem de Nova Iguaçu; o vale-transporte pesa |

Filtro corrigido: **falta-tecnico** ("na empresa onde você trabalha") ia para qualquer um
sem filho na escola pública, inclusive motoboy e desempregado. Agora exige também carteira
assinada ou empresa.

### O que cada perfil típico vê agora

| Perfil | Governador: cenas próprias do perfil | Presidente: cenas próprias do perfil |
|---|---|---|
| Diarista (SUS, ônibus, autônoma) | nenhuma: as cenas padrão já são a realidade de quem usa serviço público | trabalho-app |
| Motoboy (SUS, moto, sem filhos) | nenhuma | trabalho-app, pagar-faculdade |
| Servidora (plano da empresa, ônibus) | plano-voltou-sus, servidor-recomposicao, correria-praia | imposto-renda, plano-voltou-sus |
| Analista (plano, carro, escola particular) | transito-carro, vale-transporte, plano-voltou-sus, falta-tecnico, via-expressa-fechada, roubo-carro, garagem-alagada, caminhao-pipa, correria-praia | imposto-renda, plano-voltou-sus, celular-sinal, pagar-faculdade |
| Empresário (faixa privada) | as do analista + licenca-empresa | custo-contratar, imposto-renda, plano-voltou-sus, celular-sinal, pagar-faculdade |

## O que não foi feito, e por quê

- **Cenas sobre IPVA do carro e reajuste de plano de saúde.** São dores reais das faixas
  média e alta, mas nenhum dos 10 candidatos tem proposta documentada sobre elas (só Paes,
  sobre IPVA de moto). Cena sem proposta vira nota nula para todo mundo e não diferencia
  ninguém.
- **Bordões que são a própria política** ficaram: "escola cívico-militar", "fim da escala
  6x1", "poupança mensal pro aluno". Trocar por paráfrase mudaria o sentido.
- **Notas não foram refeitas:** nenhuma preferência mudou.

## Riscos e próximos passos

1. **Pré-teste cognitivo antes de publicar** (o que falta de mais importante): 5 a 8 pessoas
   por faixa, lendo em voz alta e dizendo o que entenderam de cada opção. Revela jargão e
   opção lida ao contrário, coisas que revisão de gabinete não pega.
2. **Região ainda não entra no perfil.** No estado do Rio, morar na capital, na Baixada, em
   Niterói/São Gonçalo ou no interior muda transporte, água e segurança mais do que a faixa
   de renda. As cenas de trem e ônibus falam com a região metropolitana. Uma sexta pergunta
   ("onde você mora") resolveria; fica como recomendação.
3. **Cenas contadas por terceiros** (a mãe, o primo, a vizinha) foram mantidas de propósito
   em temas sensíveis (violência doméstica, desemprego): falar de outra pessoa reduz a
   resposta de fachada. Nos demais temas, a cena é em "você".
4. **Leiturabilidade:** textos curtos e em registro oral; falta medir com um índice de
   legibilidade e testar com leitor de tela.

## Região (25/09/2026, mesmo dia)

Decisão: sem pré-teste; região entra no perfil. Aplicada por `pipeline/curadoria_regional.py`.

- **Pergunta de região, própria de cada eleição**, a primeira do perfil (que passa a ter 6
  toques). Governo do Rio: cidade do Rio, Baixada, Leste Fluminense (Niterói, São Gonçalo,
  Maricá, Itaboraí), interior, ou não mora no estado. Presidente: as cinco regiões do Brasil.
  Região não entra no cálculo da faixa.
- **Região tem prioridade sobre faixa:** a cena regional vem logo depois da padrão no
  grupo; quem mora em Niterói e anda de carro vê a barca e a Ponte, não a Linha Vermelha.
- **Capital e Baixada** ficam com as cenas padrão, que já foram escritas a partir delas
  (ramal de Japeri, Nova Iguaçu, São João de Meriti).

| Cena | Eleição | Região | Técnica | Fato (fonte) |
|---|---|---|---|---|
| barca-leste | governador | Leste Fluminense | opções novas: Linha 3, novas linhas de barca, cobrar a operadora, estatizar | atrasos e superlotação um ano após a troca de gestão (O Globo, 15/03/2026) |
| estrada-interior | governador | interior | opções novas: recapear com dinheiro do estado, conceder sem pedágio novo, trem de passageiros, subsidiar o ônibus | 19,1% das rodovias ruins ou péssimas; as 5 piores são públicas (CNT, via Gazeta do Povo) |
| saude-interior | governador | interior | opções novas: hospital regional, polo de câncer e diagnóstico, custeio com metas, teleconsulta | Nova Friburgo ampliou de 12 para 15 as vans de pacientes (A Voz da Serra, 31/08/2026) |
| encosta-serra | governador | interior | reaproveita rua-alagada (contenção de encosta, limpeza de canais, alerta, reassentamento) | o mesmo da cena de origem |
| seca-nordeste | presidente | Nordeste | reaproveita enchente-seca; opção b reescrita como "contra seca e enchente: barragens e reservatórios", mesma preferência | 578 cidades em emergência por seca (MIDR, 07/2025) |
| fumaca-queimada | presidente | Norte e Centro-Oeste | reaproveita enchente-seca | 30,8 milhões de hectares queimados em 2024 (MapBiomas) |
| enchente-sul | presidente | Sul | reaproveita enchente-seca | enchentes de 2024 no RS (ANA), o da cena de origem |
| especialista-longe | presidente | Norte | reaproveita fila-cirurgia | 442 km em média até a radioterapia no Norte (g1, 08/04/2026) |

**Opção trocada depois da avaliação:** em saude-interior, "consulta por vídeo" ficou sem
proposta para os 8 candidatos (nota nula para todos, não diferencia ninguém). Virou
"contratar mais médico e especialista pra rede do estado", a mesma preferência da opção d de
fila-especialista, com as mesmas notas.

**Viés com as cenas regionais** (`auditar_vies.py --regiao`): o 1º lugar com respostas ao
acaso vai de 1% a 21% no Leste e de 1% a 20% no interior; na simulação da pessoa que escolhe
sempre a opção preferida de um candidato, 6 dos 8 ficam em 1º (Siri e Luan em 2º ou 3º,
como nas cenas padrão).

**Pontos para revisão apontados pelos avaliadores:** resumo do dossiê diz mais do que o
trecho literal em Marinho p41 (teleconsulta), Busnello p30 (concessão ou PPP das barcas) e
Ruas p47 (terminais aquaviários): as notas seguiram o trecho, e os resumos devem ser
corrigidos. Notas limítrofes: Paes 55 em barca-leste c (auditoria genérica de concessões),
Luan 25 e 50 em barca-leste c e d (reestatização genérica que talvez não inclua barcas),
Siri 45 e 40 e Juliete 40 e 35 em saude-interior a/b/c (propostas próximas, não iguais).

As três cenas com opções novas foram avaliadas para os 8 candidatos pelos mesmos critérios
(rascunhos em `pipeline/rascunhos/regional-governador-*.json`, mescla com
`mesclar_rascunhos.py --padrao "regional-governador-*.json"`).

Limite conhecido: no interior, a cena da passagem ainda usa o exemplo de Nova Iguaçu. A
variante precisaria de uma quarta opção nova (a opção "metrô a R$ 5" não faz sentido fora
da região metropolitana).

## Correção de cegamento no fato (25/09/2026)

O QA automático (e2e/fluxo.spec.ts, critério 7) achou o nome de um candidato na fonte do
fato de `escola-bagunca` ("O Dia, 11/09/2026 (dado citado por Eduardo Paes)", com o nome
também no endereço da notícia). Além de quebrar o anonimato durante o quiz, o dado vinha de
fala de campanha sobre tempo integral, que é a proposta de uma das opções. Trocado por dado
de fonte primária: 13,9% do ensino médio do RJ em tempo integral, contra 22,8% no Brasil
(Anuário da Educação Básica 2026, Todos Pela Educação, com dados do Censo Escolar).
Varredura por nome e sobrenome em textos e links achou mais um caso só no endereço: o fato de `dinheiro-publico` apontava para "…atlasintel-eduardo-paes-lidera…"; trocado pelo link da mesma pesquisa na Gazeta do Povo. `src/lib/cegamento.test.ts` passa a barrar nome de candidato em cena, pergunta, opção, fato, fonte e link.
