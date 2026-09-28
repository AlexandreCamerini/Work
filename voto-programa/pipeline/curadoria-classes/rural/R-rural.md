# Zona rural: o que o morador do campo vê hoje e o que muda (27/09/2026)

Pergunta desta rodada: **com o campo `zona` no perfil ("Onde fica a sua casa?"), o morador da zona rural passa a ver situações que existem na vida dele?** Quizzes de governador RJ 3.5.0 e de presidente 1.4.0, rodados na função real `selecionarCenas` de `src/lib/perfil.ts`, que já compara `publico.zona` com `perfil.zona`.

| Arquivo | O que tem |
|---|---|
| `R-rural.md` | este relatório |
| `variantes-novas.json` | 6 variantes novas (3 presidente, 3 governador), no mesmo formato de `../variantes-novas.json`, prontas para o script de mescla |

Nada em `src/` foi alterado. Nenhuma opção protegida foi tocada (a única origem com opção protegida é `escala-6x1`, e a b de `jornada-roca` está literal).

## Tamanho do público

- Brasil: 25,6 milhões de pessoas moram em área rural (12,6%) no Censo 2022. São 47,8% no Nordeste, 18,4% no Sudeste, 14,6% no Sul, 13,7% no Norte e 5,5% no Centro-Oeste ([IBGE Educa](https://educa.ibge.gov.br/jovens/materias-especiais/22550-87-da-populacao-brasileira-vivia-em-areas-urbanas.html); [Nexo, dados do IBGE](https://www.nexojornal.com.br/grafico/2024/11/20/populacao-rural-urbana-censo-ibge)).
- Estado do Rio: 97,9% urbano, a maior taxa do país. A zona rural soma cerca de 2,1% dos moradores (uns 340 mil). **O ganho está sobretudo no quiz de presidente.** No de governador, as variantes são baratas e corrigem cenas que não fazem sentido, mas chegam a pouca gente.

## Método

1. **14 personas rurais e 8 controles** (`personas.ts` no scratchpad `rural/`), rodadas com `selecionarCenas` antes e depois das variantes (`simular.ts`). As personas do RJ votam nas duas eleições.
2. **Nota de plausibilidade de 1 a 5**, a mesma escala de `../B-adaptacao.md` (5 = vive isso hoje; 2 = é cena de outra classe ou lugar; 1 = contradiz a situação dela). É julgamento de pesquisador, sem pré-teste.
3. **Checagem exaustiva de alcance** (`checar_alcance.ts`). O script roda todas as 64.512 combinações de perfil por eleição (cada campo com `null`) e confere três coisas: (a) cada variante nova só chega a quem tem `zona = rural`; (b) nenhum perfil urbano ou sem zona muda de cena; (c) nenhuma variante, nova ou antiga, fica sem ninguém que a receba. **Resultado: OK.**
4. **Validação de texto e fontes** (`validar.py`, com as mesmas contagens de `legibilidade.test.ts` e `cegamento.test.ts`, mais a lista de vices). O script confere: preferências idênticas às da origem (id e texto literal), limites de opção, pergunta, cena e contexto, frase de contexto com até 20 palavras, https, datas no formato AAAA-MM-DD, ids que não existem em nenhum dos dois quizzes, `publico.zona = ["rural"]` e nenhum nome de candidato, vice ou partido. **Resultado: OK.**
5. **Fontes.** Abri todas as fontes novas. As reaproveitadas da origem também foram reabertas. O WebFetch desta sessão bloqueia vários domínios (IBGE Agência, CNA, PMPR, Fundação Perseu Abramo), por isso a leitura foi feita pelo leitor do Exa.

## Personas

| Id | Persona | zona | saude | escola | desloc. | trabalho | banh. | RJ / Brasil | Faixa |
|---|---|---|---|---|---|---|---|---|---|
| R01 | Agricultor familiar (olericultura, Nova Friburgo) | rural | sus | publica | moto | autonomo | 1 | interior / sudeste | publico |
| R02 | Assentada da reforma agrária (Campos; ou Nordeste) | rural | sus | publica | a_pe | autonomo | 1 | interior / nordeste | publico |
| R03 | Pescador artesanal em comunidade rural de Magé | rural | sus | publica | publico | autonomo | 1 | baixada / sudeste | publico |
| R04 | Trabalhador rural com carteira (cana, café) | rural | sus | publica | publico | carteira | 1 | interior / sudeste | publico |
| R05 | Diarista rural sem carteira | rural | sus | publica | moto | autonomo | 1 | — / centro-oeste | publico |
| R06 | Ribeirinho (barco de linha) | rural | sus | publica | publico | autonomo | 1 | — / norte | publico |
| R07 | Agricultor no semiárido | rural | sus | publica | moto | autonomo | 1 | — / nordeste | publico |
| R08 | Sitiante aposentado, carro velho | rural | sus | nenhuma | carro | aposentado | 1 | interior / sudeste | publico |
| R09 | Agricultor familiar do Sul (leite, fumo) | rural | sus | publica | carro | autonomo | 2 | — / sul | publico |
| R10 | Médio produtor com empregados e plano | rural | plano_proprio | particular | carro | empresario | 3 | interior / centro-oeste | privado |
| R11 | Sitiante aposentado em Maricá/Itaboraí | rural | sus | nenhuma | carro | aposentado | 2 | leste / sudeste | misto |
| R12 | Jovem rural sem trabalho fixo | rural | sus | nenhuma | moto | sem_trabalho | 1 | baixada / nordeste | publico |
| R13 | Professora concursada de escola do campo | rural | sus | publica | moto | servidor | 1 | interior / nordeste | publico |
| R14 | Rural que só respondeu a zona | rural | — | — | — | — | — | — / — | — |
| U01–U07, V00 | Controles urbanos, quem pulou só a zona e quem pulou tudo | urbana ou — | | | | | | | |

## O que o rural via antes (o que era implausível)

**Presidente.** Todo rural via `celular-roubado` ("Levaram seu celular no ponto de ônibus", nota 2: não tem ponto de ônibus) ou, se tem carro, `celular-sinal` ("Parado no semáforo, com o vidro aberto", nota 1 a 2). O autônomo rural (agricultor familiar, diarista, pescador) caía em `conta-propria` ("a vaga com carteira que aparece é 6x1", nota 3). No Sul e no Sudeste, o clima vinha da cidade ("cada chuva forte deixa a cidade em alerta"; "a seca deixa a luz e a comida mais caras", nota 3). As demais cenas já serviam. No Nordeste, `seca-nordeste` é cena do campo (nota 5), e no Norte e no Centro-Oeste, `fumaca-queimada` também serve (nota 4 a 5). Saúde, salário mínimo, juros, escola, conta de luz, vídeo falso, gasto do governo e medida protetiva ficaram entre 3 e 5.

**Governador.** O rural do interior já via `estrada-interior` (5), `passagem-interior` ou `passagem-moto` (4), `saude-interior` (5) e `chuva-interior` (4 a 5). Ficavam fora:

- todo rural: `celular-roubado` no ponto de ônibus (2), `operacao-policial` ("escola fechada, ônibus parado", 2) e a falta d'água com conta da empresa (2 a 3);
- rural de fora do interior (Magé, Guapimirim, Itaboraí, Maricá, Nova Iguaçu rural): o trem de Japeri, a barca ou a Linha Vermelha (2);
- rural com carro: o portão da garagem (`roubo-carro`, 2) e, se mora na Baixada, no Leste ou na capital, a Avenida Brasil fechada (2);
- rural de faixa privada: o caminhão-pipa do prédio (1), e rural de faixa privada ou mista, a praia (`correria-praia`, 1 a 2).

## Propostas (6 variantes)

A ordem conta: vence a **primeira** variante específica que combina. A coluna "Posição" diz onde entra em `perguntas[]`.

| Eleição | Id novo | Grupo | Origem das opções | Público | Posição | Para quem, na prática |
|---|---|---|---|---|---|---|
| Pres | `celular-estrada` | celular | celular-roubado | zona rural | antes de `celular-sinal` | todo rural, com ou sem carro |
| Pres | `jornada-roca` | jornada | escala-6x1 | zona rural **e** trabalho autonomo ou sem_trabalho | antes de `conta-propria` | agricultor familiar, diarista, pescador, jovem sem trabalho fixo. O rural com carteira, servidor ou aposentado continua na 6x1 padrão (nota 4); o empresário, em `custo-contratar` |
| Pres | `seca-lavoura` | clima | enchente-seca | zona rural **e** região sul ou sudeste | antes de `enchente-sul` | rural do Sul e do Sudeste. Nordeste, Norte e Centro-Oeste seguem com as cenas regionais, que já são do campo |
| Gov | `estrada-roca` | trem-parado | estrada-interior | zona rural | logo depois de `estrada-interior` | rural fora do interior, com ou sem carro. O rural do interior continua em `estrada-interior` |
| Gov | `assalto-estrada` | celular-roubado | celular-roubado | zona rural | antes de `roubo-carro` | todo rural, com ou sem carro |
| Gov | `primo-roca` | primo-desempregado | primo-desempregado | zona rural | depois de `licenca-empresa` (fim do grupo) | rural não servidor e não empresário. O servidor segue em `servidor-recomposicao`; o produtor com empregados, em `licenca-empresa` |

### Texto

| Id | Cena | Pergunta | Fato (fonte) |
|---|---|---|---|
| `celular-estrada` | Na estrada de terra, voltando pra casa, dois homens de moto levaram seu celular. Na vizinhança, já é o terceiro caso este ano. | O que funcionaria melhor? | o da origem: 830.890 celulares roubados ou furtados em 2025 (Anuário, via g1) |
| `jornada-roca` | Na roça, a maior parte do trabalho é por diária, sem carteira. Na colheita, não tem folga nem no domingo. | O que você mudaria nas regras do trabalho? | 64% de quem mora no campo e trabalha na roça era informal em 2022, contra 31% na cidade fora da roça (Rev. de Economia e Sociologia Rural, 2025, com dados da PNAD Contínua) |
| `seca-lavoura` | Um ano, a seca queima a lavoura e o pasto. No outro, a chuva forte leva a plantação e a estrada. | O que devia vir primeiro? | 206.604 propriedades rurais atingidas pela enchente de maio de 2024 no RS, depois de anos de estiagem (Governo do RS / Emater) |
| `estrada-roca` | Da roça até a cidade, a estrada estadual tem buraco e não tem acostamento. O ônibus passa poucas vezes por dia. | O que devia vir primeiro? | o da origem (CNT 2024: 19,1% das rodovias do estado ruins ou péssimas) |
| `assalto-estrada` | Na estrada de terra, dois homens de moto assaltaram vizinhos seus. Levaram celulares e dinheiro. | O que funcionaria melhor? | série de assaltos de moto na zona rural de São Francisco de Itabapoana, set/2025 (Jornal do Estado RJ) |
| `primo-roca` | Seu primo mora na roça e não acha trabalho fixo. Vive de diária na lavoura, quando aparece. | O que ajudaria gente como ele? | 160.571 pessoas ocupadas em sítios e fazendas do RJ, quase 7 em cada 10 da família do produtor (IBGE, Censo Agro 2017) |

**Opções.** As quatro vêm da origem com o mesmo id, a mesma `preferencia` e o mesmo texto. A única exceção é `assalto-estrada/d`: "Câmera inteligente nas ruas **e estradas**, ligada direto à polícia". A preferência ("Videomonitoramento, câmeras inteligentes e tecnologia de vigilância integradas às polícias") não fala de lugar, e já havia precedente em `roubo-carro/d`. O C deve confirmar.

**Contexto do "Leia".** Cada variante tem 4 parágrafos, com 165 a 182 palavras. O 1º parágrafo é novo e mostra o tamanho do problema no campo. Os de competência e de trade-off (2º e 3º) vêm literais da origem, com as fontes dela. O 4º é da origem ou novo, conforme o caso. Em `primo-roca`, o 3º parágrafo troca "alivia o entregador" por "alivia quem trabalha com ela" e corta "o incentivo" para caber em 55 palavras. Nenhuma opção ganhou ou perdeu peso.

### Antes e depois (só os grupos que mudam)

| Persona | Eleição | Grupo | Antes (nota) | Depois (nota) |
|---|---|---|---|---|
| R01, R02 | Pres | jornada | conta-propria (3) | jornada-roca (4) |
| R03 pescador | Pres | jornada | conta-propria (3) | jornada-roca (3 a 4: pesca não é "roça", mas a diária e a informalidade são dele) |
| R05, R07, R09 | Pres | jornada | conta-propria (3) | jornada-roca (4 a 5) |
| R06 ribeirinho | Pres | jornada | conta-propria (3) | jornada-roca (3 a 4) |
| R12 jovem | Pres | jornada | escala-6x1 (3) | jornada-roca (4) |
| R01–R07, R12–R14 | Pres | celular | celular-roubado (2) | celular-estrada (4; ribeirinho 3) |
| R08–R11 (com carro) | Pres | celular | celular-sinal (1 a 2) | celular-estrada (4) |
| R01, R03, R04, R08, R11 | Pres | clima | enchente-seca (3) | seca-lavoura (4 a 5) |
| R09 Sul | Pres | clima | enchente-sul (3) | seca-lavoura (5) |
| R03, R12, R14 | Gov | trem-parado | trem-parado, Japeri (2) | estrada-roca (4) |
| R11 Leste | Gov | trem-parado | barca-leste (2) | estrada-roca (4) |
| todo rural sem carro | Gov | celular-roubado | celular-roubado (2) | assalto-estrada (4) |
| R08, R10, R11 (carro) | Gov | celular-roubado | roubo-carro (2 a 3) | assalto-estrada (4) |
| R01–R04, R08, R11, R12, R14 | Gov | primo-desempregado | primo-desempregado, "bico de entrega" (3) | primo-roca (4 a 5) |

Contagem de cenas com nota ≤ 2 por persona:

- **Presidente:** caiu de 1 para 0 em todas as 14 personas rurais.
- **Governador:**
  - R01, R02, R04, R08 e R13: de 2 para 1 (fica `operacao-policial`).
  - R03 e R12: de 3 para 1.
  - R11: de 4 para 2 (ficam `via-expressa-fechada` e `correria-praia`).
  - R14: de 4 para 2 (ficam `operacao-policial` e `falta-agua`).
  - R10: fica em 3 (`operacao-policial`, `caminhao-pipa`, `correria-praia`; veja as lacunas).

### Consideradas e não propostas (a cena atual já serve ao rural)

| Grupo | Por quê |
|---|---|
| Pres `fila-sus` / Gov `fila-especialista` | "Sua mãe, ou alguém da família, espera…" já vale no campo (nota 4). No Norte, `especialista-longe` (barco) e, no interior do RJ, `saude-interior` (van às 4h) já são rurais. Uma variante "posto longe, carreta" só subiria de 4 para 5 |
| Pres `escola` / Gov `escola-bagunca` | "Largar a escola pra trabalhar" é nota 5 no campo. A escola estadual com briga e sem professor fica na cidade, e o sobrinho da roça vai até ela (nota 3 a 4). O transporte escolar é o problema real, mas nenhuma opção fala dele (lacuna R7) |
| Pres `juros` | Crediário e financiamento existem no campo (nota 4). O crédito da safra (Pronaf, Plano Safra) tem juro tabelado e não conversa com as opções, que são macroeconômicas |
| Pres `energia` | Conta de luz e botijão valem no campo. Cuidado se um dia houver variante: cortar a CDE (opção b) tira o subsídio da tarifa rural e da irrigação |
| Pres `faccao`, `internet`, `contas`, `mulheres`; Gov `medida-protetiva`, `dinheiro-publico` | São cenas genéricas ("alguém que você conhece", "sua vizinha", "no posto falta remédio"), com nota 3 a 4 |
| Gov `passagem-cara` | O interior vê `passagem-interior` ou `passagem-moto` (4). No rural da Baixada e do Leste, a nota fica em 3, e há só uns milhares de pessoas nesse grupo |

## Lacunas (não dá para resolver reusando opções)

| # | Onde | Quem | O que acontece | Recomendação |
|---|---|---|---|---|
| R1 | Gov `falta-agua` | todo rural | "Faltou água aqui na rua… a conta veio mais cara" (2). Na roça, a água vem de poço ou nascente, sem conta nem rede. As 4 opções são sobre a concessão estadual (rever tarifa, fiscalizar metas, romper contrato, voltar à Cedae), e vários municípios do interior nem estão na concessão do estado. Forçar a cena seria enganoso | Aceitar por ora. Pergunta nova "água na roça" não tem proposta nos dossiês de governador (0 menções a poço, cisterna ou saneamento rural): as notas sairiam quase todas `null` |
| R2 | Gov `caminhao-pipa` (faixa privada) | produtor rural de faixa privada (R10) | "Faltou água no prédio… o condomínio chamou caminhão-pipa" (1) | **Ajuste de público** em `caminhao-pipa`: acrescentar `zona: ["urbana"]`. O produtor passa para a padrão (R1, ruim mas não contraditória). Custo: quem é de faixa privada e pulou a zona também passa para a padrão |
| R3 | Gov grupo `orla` (`correria-praia`, faixa mista ou privada, sem variante padrão) | rural de faixa mista ou privada (R10, R11) | "Fim de tarde na praia, começa uma correria" (1 a 2). A opção c (retomar áreas das facções) não cabe numa cena de sítio, e segurança já aparece no grupo do celular | **Ajuste de público**: `zona: ["urbana"]` em `correria-praia`. O rural fica sem cena nesse grupo (uma a menos no quiz). Custo: quem é de faixa mista ou privada e pulou a zona perde a cena. Decisão do orquestrador |
| R4 | Gov `garagem-alagada` (faixa privada) | rural de faixa privada fora do interior | garagem de prédio (1). No interior já vence `chuva-interior` | Mesmo ajuste `zona: ["urbana"]`, ou aceitar: são pouquíssimos casos |
| R5 | Gov `operacao-policial` e `via-expressa-fechada` | todo rural; rural com carro na capital, na Baixada ou no Leste | "Escola fechada, ônibus parado" e Avenida Brasil fechada: o rural vê isso como notícia (2 a 3). As opções medem o êxito de uma operação em área urbana dominada por facção. Não há cena de roça que carregue "retomada de território" e "letalidade" sem inventar | Aceitar. Uma cena "Deu no jornal: operação na cidade…" subiria para 3, não mais |
| R6 | Pres `celular-estrada` e `jornada-roca` no Norte ribeirinho (R06) | ribeirinho e pescador | "estrada de terra" e "colheita" são aproximados para quem vive no rio (3) | Variante `zona: rural` + `regiao: norte` com cena de rio só se o pré-teste com ribeirinhos mostrar estranhamento |
| R7 | Transporte escolar rural, estrada vicinal (de terra), luz que cai, crédito da safra (Pronaf), assistência técnica, abigeato e roubo de insumos | todo rural | Nenhuma pergunta tem opções sobre isso. São competências em parte municipais (vicinal, transporte escolar do fundamental) ou de programas que os dossiês quase não citam | Não criar pergunta agora: sem evidência nos dossiês, a cena teria notas `null` para quase todos os candidatos. Exceção abaixo |
| R8 | **Pres: água e seca na produção** (cisterna, irrigação, seguro da safra) | rural do Nordeste, do Sul e do Sudeste | `seca-nordeste` e `seca-lavoura` usam as opções macro do clima (desmatamento, obras, licença, petróleo) | **Candidata a pergunta nova com notas.** Os dois candidatos têm proposta documentada: um, cisternas (dossiê `lula` p107), irrigação e alerta precoce (p108); o outro, mais área irrigada, outorga simplificada e polos no semiárido (dossiê `flavio-bolsonaro` p145), seguro rural (p37) e armazenagem de safra (p146). Rascunho de opções: (a) cisterna e poço para cada família do semiárido; (b) mais irrigação, com licença de água mais rápida; (c) seguro da safra mais barato, pago em parte pelo governo; (d) alerta de seca e de chuva forte para quem planta. As 4 têm evidência em pelo menos um dos dois, e as notas teriam de passar pelo pipeline de aderência |

## Riscos

1. **"Comunidade" no rótulo da zona.** A resposta rural diz "Na zona rural: sítio, fazenda, roça ou comunidade". No Rio de Janeiro, "comunidade" é o nome corrente de favela. Morador de favela pode marcar "rural" e passar a ver estrada de terra, roça e diária, com nota 1 para ele. **Recomendo trocar para "comunidade rural", "ribeirinha ou quilombola", ou só "sítio, fazenda, roça ou aldeia".** É mudança na tela do perfil, que é do orquestrador.
2. **Autoclassificação diferente da do IBGE.** Quem mora na sede de um município pequeno tende a responder "cidade" e continua nas cenas de hoje, o que é aceitável. Quem mora em chácara periurbana pode responder "rural" e ver cenas de roça sem trabalhar na roça: `primo-roca` e `jornada-roca` falam de "diária na lavoura", e para essa pessoa a nota seria 3.
3. **Cena que puxa opção.** `jornada-roca` põe lado a lado a informalidade (puxa d, menos imposto na carteira) e a colheita sem folga (puxa a, fim da 6x1). O equilíbrio é parecido com o da origem, que puxava só a. `seca-lavoura` puxa b (obras), como `enchente-seca`. `assalto-estrada` não cita câmeras, que apareciam na notícia de origem, para não favorecer d.
4. **Opção adaptada.** "ruas e estradas" em `assalto-estrada/d` deve passar pelo verificador C.
5. **Fontes regionais.** `celular-estrada` cita um jornal local de Barrocas (BA), e `assalto-estrada` o Jornal do Estado RJ, que reproduz o V Notícia. São relatos de caso, não estatística, e a estatística fica no 1º parágrafo (PMPR, ISP via O Globo). `primo-roca` usa o Censo Agro 2017, que é o último disponível. A data da revista (2025-04-04) é a da página do artigo na Sober.
6. **Alcance fora do alvo.** `estrada-roca` também chega ao rural que respondeu "Não moro no estado do Rio" ou pulou a região. A cena continua plausível para ele, e esse caso já recebia `trem-parado`.
7. **Notas.** As variantes copiam as notas da origem (as preferências são idênticas), então não há reavaliação. As notas continuam sendo julgamento de pesquisador, e o pré-teste cognitivo com rurais (agricultor familiar, assalariado, ribeirinho) é o que valida as cenas.

## Como aplicar

`variantes-novas.json` segue o formato do `aplicar_curadoria.py`. Cada item tem `eleicao`, `id_novo`, `grupo`, `publico`, `origem_opcoes`, `inserir_antes_de` ou `inserir_depois_de`, `cena`, `pergunta`, `opcoes`, `fato` e `contexto`. Os ids das referências de posição existem nos quizzes atuais. A ordem de inserção dentro do mesmo arquivo não importa, porque nenhuma variante nova é referência de outra. Os scripts de checagem estão no scratchpad da sessão, em `rural/`: `gerar.py`, `validar.py`, `simular.ts`, `checar_alcance.ts` e `personas.ts`.
