# Adaptação das cenas às classes sociais (27/09/2026)

Pergunta desta rodada: **cada perfil de eleitor recebe cenas que consegue imaginar na própria vida, com opções que fazem sentido do ponto de vista dele?** Quiz de governador 3.4.0 (26 perguntas, 13 grupos) e de presidente 1.3.0 (22 perguntas, 12 grupos).

Arquivos desta pasta:

| Arquivo | O que tem |
|---|---|
| `B-adaptacao.md` | este relatório |
| `variantes-novas.json` | 9 variantes novas, prontas para o script de mescla (opções com os mesmos ids e a mesma `preferencia` da origem; fato e contexto com fonte) |
| `ajustes-publico.json` | 3 ajustes de `publico` em variantes existentes |
| `cenas-padrao.json` | 3 reescritas de cena padrão (só a cena; opções intactas) |

Nada em `src/` foi alterado. As opções protegidas (escala-6x1/b, operacao-policial/b, via-expressa-fechada/b, trabalho-app/b) não foram tocadas; onde uma variante nova reusa escala-6x1, a opção b entra com o texto idêntico. Não proponho reescrita de texto de opção existente (isso é da rodada de linguagem). A única opção com texto adaptado é a b de `chuva-interior` ("canais e valões", mesma preferência).

## Método

1. **Personas (26), rodadas na função real.** Um script em TypeScript (`simular.ts`, no scratchpad da sessão) importa `estimarFaixa` e `selecionarCenas` de `src/lib/perfil.ts` e os dois `quiz*.json`, e lista a cena que cada persona vê em cada grupo. Com `--depois`, aplica antes os ajustes de `publico` e insere as variantes novas na posição indicada, e roda de novo. As personas do RJ votam nas duas eleições (região Sudeste no presidente); seis personas são só do quiz de presidente; `V00` é quem pula o perfil.
2. **Notas por célula** (`notas.py`): (a) plausibilidade de 1 a 5; (b) se as 4 opções fazem sentido do ponto de vista dela (S = sim; P = uma fica fora do mundo dela; N = duas ou mais); (c) o que a cena ou as opções pressupõem e ela não tem. A escala:
   - **5** vive isso hoje;
   - **4** vive às vezes, ou alguém da casa vive;
   - **3** conhece de perto (bairro, parente, noticiário local), mas precisa se pôr no lugar de outro;
   - **2** é cena de outra classe, lugar ou idade;
   - **1** contradiz a situação dela.
3. **Cobertura** = nº de cenas com nota ≥ 4 por persona, antes e depois das propostas (`matriz.py`).
4. **Validação** (`validar.py`): preferências idênticas às da origem, limites de texto iguais aos de `src/lib/legibilidade.test.ts`, 3 a 4 parágrafos (≤ 55 palavras cada, ≤ 200 no total), URLs https, datas AAAA-MM-DD e nenhum nome de candidato ou partido (nos textos, veículos, títulos e links; lista tirada de `candidatos*.ts`, com os de fora do quiz e "Garotinho"). **Resultado: OK.** Na validação caiu uma fonte cujo link tinha "…alaga-ruas-em-padua…": o teste de cegamento reprovaria o sobrenome "Ruas". Troquei por outra notícia do mesmo fato.

As notas são julgamento de pesquisador, não medição. O que elas pedem é pré-teste cognitivo com 5 a 8 pessoas por perfil: aposentado, autônomo não-app, interior e rural antes de todos.

## Personas

| Id | Persona | Quem é | saude | escola | deslocamento | trabalho | banheiros | região (RJ / Brasil) | Faixa estimada |
|---|---|---|---|---|---|---|---|---|---|
| P01 | Diarista na Baixada | Mulher, 44, diarista em 3 casas na Zona Sul, mora em Belford Roxo, 2 filhos na estadual, SUS, trem + ônibus | sus | publica | publico | autonomo | 1 | baixada / sudeste | publico |
| P02 | Motoboy de app em São Gonçalo | Homem, 26, entregador de app com moto financiada, sem filhos, SUS | sus | nenhuma | moto | autonomo | 1 | leste / sudeste | publico |
| P03 | Aposentado do INSS no interior | Homem, 68, aposentado com 1 salário mínimo em Campos, SUS, ônibus municipal | sus | nenhuma | publico | aposentado | 1 | interior / sudeste | publico |
| P04 | Desempregada com filhos | Mulher, 34, procura emprego há 10 meses, 3 filhos na escola municipal/estadual, Bolsa Família, Zona Norte | sus | publica | publico | sem_trabalho | 1 | capital / sudeste | publico |
| P05 | Servidora professora | Mulher, 47, professora da rede estadual, plano do servidor, filho na pública, ônibus, Tijuca | plano_empresa | publica | publico | servidor | 2 | capital / sudeste | misto |
| P06 | Pequeno comerciante MEI | Homem, 52, dono de bar/mercearia (MEI, sem empregado fixo) em Nova Iguaçu, carro usado, filha em escola particular de bairro, SUS | sus | particular | carro | autonomo | 1 | baixada / sudeste | misto |
| P07 | Executivo na Zona Sul | Homem, 45, diretor CLT em empresa de energia, plano próprio, carro, 2 filhos em escola particular, Leblon | plano_proprio | particular | carro | carteira | 3 | capital / sudeste | privado |
| P08 | Casal de classe média em Niterói | Mulher, 38, analista CLT, plano da empresa, carro, filho em escola particular, Icaraí | plano_empresa | particular | carro | carteira | 2 | leste / sudeste | privado |
| P09 | Estudante universitário sem renda | Homem, 20, UERJ/UFRJ, cotista, mora com a mãe em Madureira, SUS, BRT/metrô | sus | nenhuma | publico | sem_trabalho | 1 | capital / sudeste | publico |
| P10 | Trabalhador rural no interior | Homem, 39, meeiro/diarista em lavoura no Norte Fluminense, moto, filhos na escola do município, SUS | sus | publica | moto | autonomo | 1 | interior / sudeste | publico |
| P11 | Morador de favela com operação | Homem, 31, repositor CLT em supermercado (6x1), mora na Maré, filhos na pública, SUS, ônibus | sus | publica | publico | carteira | 1 | capital / sudeste | publico |
| P12 | Idosa sem escolaridade | Mulher, 74, pensionista (1 SM), não lê bem, mora com a filha em Duque de Caxias, SUS, anda a pé e de ônibus | sus | nenhuma | publico | aposentado | 1 | baixada / sudeste | publico |
| P13 | Motorista de app na Baixada | Homem, 41, motorista de aplicativo com carro alugado/financiado, mora em São João de Meriti, SUS, filhos na pública | sus | publica | carro | autonomo | 1 | baixada / sudeste | publico |
| P14 | Empresária na Barra | Mulher, 50, dona de 2 restaurantes (30 funcionários), plano próprio, carro, filhos em particular | plano_proprio | particular | carro | empresario | 3 | capital / sudeste | privado |
| P15 | Aposentado de classe média | Homem, 71, ex-bancário aposentado, plano próprio caro, anda de metrô (gratuidade), Tijuca | plano_proprio | nenhuma | publico | aposentado | 2 | capital / sudeste | misto |
| P16 | Analista em home office | Mulher, 33, CLT em home office, plano da empresa, sem filhos, Botafogo | plano_empresa | nenhuma | casa | carteira | 2 | capital / sudeste | misto |
| P17 | Engenheiro em Macaé | Homem, 40, CLT no setor de petróleo, plano da empresa, carro, filhos em particular, Macaé | plano_empresa | particular | carro | carteira | 2 | interior / sudeste | privado |
| P18 | Comerciária de São Gonçalo | Mulher, 29, vendedora CLT em loja de Niterói, ônibus todo dia, filho na escola municipal, SUS | sus | publica | publico | carteira | 1 | leste / sudeste | publico |
| B01 | Agricultor familiar no Nordeste | Homem, 55, agricultor familiar no sertão de Pernambuco, moto, filhos na escola pública, SUS | sus | publica | moto | autonomo | 1 | — / nordeste | publico |
| B02 | Trabalhadora do Sul após a enchente | Mulher, 42, operária CLT em Canoas (RS), plano da empresa, ônibus, filha na estadual, casa atingida em 2024 | plano_empresa | publica | publico | carteira | 1 | — / sul | publico |
| B03 | Ribeirinho no Norte | Homem, 48, pescador no interior do Amazonas, barco de linha, filhos na escola ribeirinha, SUS | sus | publica | publico | autonomo | 1 | — / norte | publico |
| B04 | Entregador de app em SP | Homem, 24, entregador de moto em São Paulo, sem filhos, SUS | sus | nenhuma | moto | autonomo | 1 | — / sudeste | publico |
| B05 | Aposentada do INSS no Nordeste | Mulher, 67, aposentada rural com 1 SM em Caruaru, SUS, a pé/van | sus | nenhuma | publico | aposentado | 1 | — / nordeste | publico |
| B06 | Produtor rural no Centro-Oeste | Homem, 49, produtor de soja com 12 empregados em Rio Verde (GO), plano próprio, caminhonete, filhos em particular | plano_proprio | particular | carro | empresario | 3 | — / centro-oeste | privado |
| V00 | Quem pula o perfil | Não responde nada: vê só as variantes padrão | — | — | — | — | — | — / — | — (não estima) |

## Matriz persona × cena (antes)

Cena que a persona vê em cada grupo, na ordem do quiz, com a nota de plausibilidade em negrito. `*` = variante específica (tem `publico`); sem `*` = variante padrão. `·P` = uma opção fora do mundo dela; `·N` = duas ou mais; sem marca = as 4 opções fazem sentido. As colunas contam as cenas com nota ≥ 4 e ≤ 2.

| Persona | Eleição | Faixa | Cena vista (nota · opções) | ≥4 | ≤2 |
|---|---|---|---|---|---|
| P01 Diarista na Baixada | Gov | publico | trem-parado **5**; passagem-cara **5**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 11/11 | 0 |
| P01 Diarista na Baixada | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 1 |
| P02 Motoboy de app em São Gonçalo | Gov | publico | *barca-leste **3**; passagem-cara **2**; fila-especialista **4**; escola-bagunca **3**; operacao-policial **5**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **5**; primo-desempregado **5**; dinheiro-publico **4** | 8/11 | 1 |
| P02 Motoboy de app em São Gonçalo | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P03 Aposentado do INSS no interior | Gov | publico | *estrada-interior **5**; passagem-cara **2**·P; *saude-interior **4**; escola-bagunca **3**; operacao-policial **3**; celular-roubado **3**; medida-protetiva **4**; *encosta-serra **2**; falta-agua **4**·P; primo-desempregado **3**; dinheiro-publico **4** | 5/11 | 2 |
| P03 Aposentado do INSS no interior | Pres | publico | escala-6x1 **3**·P; salario-minimo **5**; juros-altos **4**; fila-cirurgia **2**; faccao-bairro **3**; celular-roubado **3**; *pagar-faculdade **1**·N; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 7/12 | 2 |
| P04 Desempregada com filhos | Gov | publico | trem-parado **4**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **5**; dinheiro-publico **4** | 10/11 | 0 |
| P04 Desempregada com filhos | Pres | publico | escala-6x1 **4**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P05 Servidora professora | Gov | misto | trem-parado **4**; passagem-cara **3**; *plano-voltou-sus **4**; escola-bagunca **5**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **3**; falta-agua **4**; *servidor-recomposicao **5**; *correria-praia **4**; dinheiro-publico **4** | 10/12 | 0 |
| P05 Servidora professora | Pres | misto | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P06 Pequeno comerciante MEI | Gov | misto | *transito-carro **5**; *vale-transporte **2**; fila-especialista **4**; escola-bagunca **4**; *via-expressa-fechada **5**; *roubo-carro **4**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; *correria-praia **3**; dinheiro-publico **4** | 10/12 | 1 |
| P06 Pequeno comerciante MEI | Pres | misto | *trabalho-app **1**·N; *imposto-renda **3**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; *celular-sinal **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 1 |
| P07 Executivo na Zona Sul | Gov | privado | *transito-carro **5**; *vale-transporte **5**; *plano-voltou-sus **4**; *falta-tecnico **4**; *via-expressa-fechada **3**; *roubo-carro **5**; medida-protetiva **4**; *garagem-alagada **5**; *caminhao-pipa **4**; primo-desempregado **4**; *correria-praia **5**; dinheiro-publico **4** | 11/12 | 0 |
| P07 Executivo na Zona Sul | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **5**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P08 Casal de classe média em Niterói | Gov | privado | *barca-leste **4**; *vale-transporte **3**; *plano-voltou-sus **4**; *falta-tecnico **4**; *via-expressa-fechada **4**; *roubo-carro **4**; medida-protetiva **4**; *garagem-alagada **4**; *caminhao-pipa **4**; primo-desempregado **4**; *correria-praia **4**; dinheiro-publico **4** | 11/12 | 0 |
| P08 Casal de classe média em Niterói | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **4**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P09 Estudante universitário sem renda | Gov | publico | trem-parado **4**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **4**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **4**; dinheiro-publico **4** | 10/11 | 0 |
| P09 Estudante universitário sem renda | Pres | publico | escala-6x1 **3**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **5**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| P10 Trabalhador rural no interior | Gov | publico | *estrada-interior **5**; passagem-cara **2**·P; *saude-interior **4**; escola-bagunca **4**; operacao-policial **2**; celular-roubado **2**; medida-protetiva **4**; *encosta-serra **2**; falta-agua **3**·P; primo-desempregado **3**; dinheiro-publico **3** | 4/11 | 4 |
| P10 Trabalhador rural no interior | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **2**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 2 |
| P11 Morador de favela com operação | Gov | publico | trem-parado **3**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 9/11 | 0 |
| P11 Morador de favela com operação | Pres | publico | escala-6x1 **5**; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P12 Idosa sem escolaridade | Gov | publico | trem-parado **3**; passagem-cara **3**; fila-especialista **2**; escola-bagunca **3**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **3**; dinheiro-publico **3** | 5/11 | 1 |
| P12 Idosa sem escolaridade | Pres | publico | escala-6x1 **3**·P; salario-minimo **5**; juros-altos **4**·N; fila-cirurgia **2**; faccao-bairro **4**; celular-roubado **4**; *pagar-faculdade **1**·N; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **3**·P; agressor-rondando **4** | 8/12 | 2 |
| P13 Motorista de app na Baixada | Gov | publico | *transito-carro **5**; *vale-transporte **1**; fila-especialista **4**; escola-bagunca **4**; *via-expressa-fechada **5**; *roubo-carro **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 10/11 | 1 |
| P13 Motorista de app na Baixada | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **5**; *celular-sinal **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P14 Empresária na Barra | Gov | privado | *transito-carro **4**; *vale-transporte **5**; *plano-voltou-sus **4**; *falta-tecnico **3**; *via-expressa-fechada **4**; *roubo-carro **5**; medida-protetiva **4**; *garagem-alagada **5**; *caminhao-pipa **4**; *licenca-empresa **2**·P; *correria-praia **4**; dinheiro-publico **4** | 10/12 | 1 |
| P14 Empresária na Barra | Pres | privado | *custo-contratar **5**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **4**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| P15 Aposentado de classe média | Gov | misto | trem-parado **2**; passagem-cara **2**; *plano-voltou-sus **2**; escola-bagunca **3**; operacao-policial **3**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **3**; falta-agua **4**; primo-desempregado **3**; *correria-praia **3**; dinheiro-publico **4** | 4/12 | 3 |
| P15 Aposentado de classe média | Pres | misto | escala-6x1 **2**·P; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **2**; faccao-bairro **3**; celular-roubado **4**; *pagar-faculdade **2**·P; conta-luz **5**; enchente-seca **3**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 7/12 | 3 |
| P16 Analista em home office | Gov | misto | trem-parado **2**; passagem-cara **2**; *plano-voltou-sus **4**; *falta-tecnico **3**; operacao-policial **3**; celular-roubado **3**; medida-protetiva **4**; rua-alagada **2**; falta-agua **3**; primo-desempregado **3**; *correria-praia **5**; dinheiro-publico **4** | 4/12 | 3 |
| P16 Analista em home office | Pres | misto | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **3**; *pagar-faculdade **3**; conta-luz **5**; enchente-seca **3**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 7/12 | 0 |
| P17 Engenheiro em Macaé | Gov | privado | *estrada-interior **5**; *vale-transporte **1**·P; *saude-interior **3**; *falta-tecnico **5**; *via-expressa-fechada **2**; *roubo-carro **3**; medida-protetiva **4**; *encosta-serra **2**; *caminhao-pipa **3**·P; primo-desempregado **3**; *correria-praia **3**; dinheiro-publico **4** | 4/12 | 3 |
| P17 Engenheiro em Macaé | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **3**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 0 |
| P18 Comerciária de São Gonçalo | Gov | publico | *barca-leste **5**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **4**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 10/11 | 0 |
| P18 Comerciária de São Gonçalo | Pres | publico | escala-6x1 **4**; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| B01 Agricultor familiar no Nordeste | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**·P; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **2**; largar-escola **5**; conta-luz **5**; *seca-nordeste **5**; video-falso **4**; gasto-governo **3**; agressor-rondando **4** | 8/12 | 2 |
| B02 Trabalhadora do Sul após a enchente | Pres | publico | escala-6x1 **4**; salario-minimo **4**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; *enchente-sul **5**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| B03 Ribeirinho no Norte | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**·P; *especialista-longe **5**; faccao-bairro **4**; celular-roubado **2**; largar-escola **5**; conta-luz **4**·P; *fumaca-queimada **5**; video-falso **3**; gasto-governo **3**; agressor-rondando **4** | 8/12 | 2 |
| B04 Entregador de app em SP | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| B05 Aposentada do INSS no Nordeste | Pres | publico | escala-6x1 **3**·P; salario-minimo **5**; juros-altos **4**·P; fila-cirurgia **2**; faccao-bairro **3**; celular-roubado **3**; *pagar-faculdade **1**·N; conta-luz **5**; *seca-nordeste **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 7/12 | 2 |
| B06 Produtor rural no Centro-Oeste | Pres | privado | *custo-contratar **5**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **3**; faccao-bairro **3**; *celular-sinal **3**; *pagar-faculdade **5**; conta-luz **5**; *fumaca-queimada **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 0 |
| V00 Quem pula o perfil | Gov | — | trem-parado **3**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **4**; dinheiro-publico **4** | 9/11 | 0 |
| V00 Quem pula o perfil | Pres | — | escala-6x1 **4**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **3**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |



### Onde a nota fica em 3 ou menos, ou alguma opção fica de fora, e por quê (antes)

| Persona | Eleição | Cena | Nota | Opções | Por quê |
|---|---|---|---|---|---|
| P01 Diarista na Baixada | Pres | trabalho-app | 1 | N | diarista: "roda de aplicativo" não é ela; a, b, d falam de app |
| P02 Motoboy de app em São Gonçalo | Gov | barca-leste | 3 | S | motoboy: vive a Ponte parada, não a barca |
| P02 Motoboy de app em São Gonçalo | Gov | passagem-cara | 2 | S | anda de moto; Nova Iguaçu é outra região |
| P02 Motoboy de app em São Gonçalo | Gov | escola-bagunca | 3 | S | 26 anos, sem filhos |
| P03 Aposentado do INSS no interior | Gov | passagem-cara | 2 | P | interior: Nova Iguaçu e metrô são de outra região |
| P03 Aposentado do INSS no interior | Gov | escola-bagunca | 3 | S | seria o neto |
| P03 Aposentado do INSS no interior | Gov | operacao-policial | 3 | S | interior: acontece, menos |
| P03 Aposentado do INSS no interior | Gov | celular-roubado | 3 | S |  |
| P03 Aposentado do INSS no interior | Gov | encosta-serra | 2 | S | Campos é planície: o problema é o rio, não a serra |
| P03 Aposentado do INSS no interior | Gov | falta-agua | 4 | P | Campos: concessão municipal; opção d (Cedae) não é dele |
| P03 Aposentado do INSS no interior | Gov | primo-desempregado | 3 | S |  |
| P03 Aposentado do INSS no interior | Pres | escala-6x1 | 3 | P | aposentado: "combinar a minha jornada" não é dele |
| P03 Aposentado do INSS no interior | Pres | fila-cirurgia | 2 | S | 68 anos: a paciente seria ele, não a mãe |
| P03 Aposentado do INSS no interior | Pres | faccao-bairro | 3 | S |  |
| P03 Aposentado do INSS no interior | Pres | celular-roubado | 3 | S |  |
| P03 Aposentado do INSS no interior | Pres | pagar-faculdade | 1 | N | 68 anos, sem filho em idade de faculdade: financiamento e voucher não são dele |
| P04 Desempregada com filhos | Gov | passagem-cara | 3 | S | ônibus municipal na capital |
| P05 Servidora professora | Gov | passagem-cara | 3 | S |  |
| P05 Servidora professora | Gov | rua-alagada | 3 | S | apartamento na Tijuca |
| P05 Servidora professora | Pres | escala-6x1 | 3 | S |  |
| P05 Servidora professora | Pres | faccao-bairro | 3 | S |  |
| P06 Pequeno comerciante MEI | Gov | vale-transporte | 2 | S | mora em Nova Iguaçu e não tem empregado fixo |
| P06 Pequeno comerciante MEI | Gov | correria-praia | 3 | S | Baixada: praia no fim de semana |
| P06 Pequeno comerciante MEI | Pres | trabalho-app | 1 | N | dono de bar (MEI) |
| P06 Pequeno comerciante MEI | Pres | imposto-renda | 3 | S | MEI; declara pouco |
| P07 Executivo na Zona Sul | Gov | via-expressa-fechada | 3 | S | Leblon: usa pouco a Avenida Brasil |
| P07 Executivo na Zona Sul | Pres | escala-6x1 | 3 | S | diretor; ninguém da casa em 6x1 |
| P07 Executivo na Zona Sul | Pres | faccao-bairro | 3 | S |  |
| P08 Casal de classe média em Niterói | Gov | vale-transporte | 3 | S | Niterói: funcionária vem de SG, não de Nova Iguaçu |
| P08 Casal de classe média em Niterói | Pres | escala-6x1 | 3 | S |  |
| P08 Casal de classe média em Niterói | Pres | faccao-bairro | 3 | S |  |
| P09 Estudante universitário sem renda | Gov | passagem-cara | 3 | S | BRT municipal |
| P09 Estudante universitário sem renda | Pres | escala-6x1 | 3 | S | estudante |
| P10 Trabalhador rural no interior | Gov | passagem-cara | 2 | P | interior e moto |
| P10 Trabalhador rural no interior | Gov | operacao-policial | 2 | S | zona rural: "escola fechada, ônibus parado" é da metrópole |
| P10 Trabalhador rural no interior | Gov | celular-roubado | 2 | S | zona rural |
| P10 Trabalhador rural no interior | Gov | encosta-serra | 2 | S | Norte Fluminense: rio e barreira, não "na serra" |
| P10 Trabalhador rural no interior | Gov | falta-agua | 3 | P | rural: poço ou rede municipal; Cedae fora |
| P10 Trabalhador rural no interior | Gov | primo-desempregado | 3 | S | rural: "bico de entrega" é urbano |
| P10 Trabalhador rural no interior | Gov | dinheiro-publico | 3 | S |  |
| P10 Trabalhador rural no interior | Pres | trabalho-app | 1 | N | trabalhador rural |
| P10 Trabalhador rural no interior | Pres | faccao-bairro | 3 | S |  |
| P10 Trabalhador rural no interior | Pres | celular-roubado | 2 | S | zona rural |
| P11 Morador de favela com operação | Gov | trem-parado | 3 | S | usa ônibus/BRT; trem é do vizinho |
| P11 Morador de favela com operação | Gov | passagem-cara | 3 | S | ônibus municipal |
| P12 Idosa sem escolaridade | Gov | trem-parado | 3 | S | ramal de Saracuruna; pouco usa |
| P12 Idosa sem escolaridade | Gov | passagem-cara | 3 | S | idosa tem gratuidade |
| P12 Idosa sem escolaridade | Gov | fila-especialista | 2 | S | 74 anos: "sua mãe" não existe mais; ela é a paciente |
| P12 Idosa sem escolaridade | Gov | escola-bagunca | 3 | S | seria o neto |
| P12 Idosa sem escolaridade | Gov | primo-desempregado | 3 | S |  |
| P12 Idosa sem escolaridade | Gov | dinheiro-publico | 3 | S | "imposto perdoado pra empresa" é abstrato para ela |
| P12 Idosa sem escolaridade | Pres | escala-6x1 | 3 | P | idem |
| P12 Idosa sem escolaridade | Pres | juros-altos | 4 | N | consignado sim; arcabouço e Banco Central são abstratos |
| P12 Idosa sem escolaridade | Pres | fila-cirurgia | 2 | S | 74 anos |
| P12 Idosa sem escolaridade | Pres | pagar-faculdade | 1 | N | 74 anos, sem escolaridade |
| P12 Idosa sem escolaridade | Pres | gasto-governo | 3 | P | emendas é abstrato |
| P13 Motorista de app na Baixada | Gov | vale-transporte | 1 | S | motorista de app da Baixada: não emprega ninguém |
| P14 Empresária na Barra | Gov | falta-tecnico | 3 | S | restaurante precisa de cozinheiro, não de técnico |
| P14 Empresária na Barra | Gov | licenca-empresa | 2 | P | restaurante: licença sanitária e bombeiros, não galpão no órgão ambiental |
| P14 Empresária na Barra | Pres | faccao-bairro | 3 | S |  |
| P15 Aposentado de classe média | Gov | trem-parado | 2 | S | Tijuca, metrô; trem da Baixada é notícia |
| P15 Aposentado de classe média | Gov | passagem-cara | 2 | S | gratuidade no metrô; Tijuca |
| P15 Aposentado de classe média | Gov | plano-voltou-sus | 2 | S | 71 anos: a cena é da mãe dele; o plano caro é o dele |
| P15 Aposentado de classe média | Gov | escola-bagunca | 3 | S |  |
| P15 Aposentado de classe média | Gov | operacao-policial | 3 | S |  |
| P15 Aposentado de classe média | Gov | rua-alagada | 3 | S | apartamento |
| P15 Aposentado de classe média | Gov | primo-desempregado | 3 | S |  |
| P15 Aposentado de classe média | Gov | correria-praia | 3 | S |  |
| P15 Aposentado de classe média | Pres | escala-6x1 | 2 | P | aposentado de classe média; ninguém em casa em 6x1 |
| P15 Aposentado de classe média | Pres | plano-voltou-sus | 2 | S | 71 anos: a cena é da mãe dele |
| P15 Aposentado de classe média | Pres | faccao-bairro | 3 | S |  |
| P15 Aposentado de classe média | Pres | pagar-faculdade | 2 | P | 71 anos |
| P15 Aposentado de classe média | Pres | enchente-seca | 3 | S |  |
| P16 Analista em home office | Gov | trem-parado | 2 | S | trabalha em casa na Zona Sul; não se desloca |
| P16 Analista em home office | Gov | passagem-cara | 2 | S | trabalha em casa |
| P16 Analista em home office | Gov | falta-tecnico | 3 | S | trabalha em serviços, remoto |
| P16 Analista em home office | Gov | operacao-policial | 3 | S |  |
| P16 Analista em home office | Gov | celular-roubado | 3 | S | pouco sai |
| P16 Analista em home office | Gov | rua-alagada | 2 | S | apartamento em Botafogo: "perdeu a geladeira" não é dela |
| P16 Analista em home office | Gov | falta-agua | 3 | S |  |
| P16 Analista em home office | Gov | primo-desempregado | 3 | S |  |
| P16 Analista em home office | Pres | escala-6x1 | 3 | S |  |
| P16 Analista em home office | Pres | faccao-bairro | 3 | S |  |
| P16 Analista em home office | Pres | celular-roubado | 3 | S |  |
| P16 Analista em home office | Pres | pagar-faculdade | 3 | S |  |
| P16 Analista em home office | Pres | enchente-seca | 3 | S |  |
| P17 Engenheiro em Macaé | Gov | vale-transporte | 1 | P | Macaé: Nova Iguaçu não tem nada a ver |
| P17 Engenheiro em Macaé | Gov | saude-interior | 3 | S | tem plano da empresa |
| P17 Engenheiro em Macaé | Gov | via-expressa-fechada | 2 | S | Macaé: Avenida Brasil é de outra região |
| P17 Engenheiro em Macaé | Gov | roubo-carro | 3 | S | Macaé, menos frequente |
| P17 Engenheiro em Macaé | Gov | encosta-serra | 2 | S | Macaé, litoral |
| P17 Engenheiro em Macaé | Gov | caminhao-pipa | 3 | P | Macaé: Cedae não é a empresa de lá |
| P17 Engenheiro em Macaé | Gov | primo-desempregado | 3 | S |  |
| P17 Engenheiro em Macaé | Gov | correria-praia | 3 | S |  |
| P17 Engenheiro em Macaé | Pres | escala-6x1 | 3 | S | regime offshore, não 6x1 |
| P17 Engenheiro em Macaé | Pres | faccao-bairro | 3 | S |  |
| P17 Engenheiro em Macaé | Pres | celular-sinal | 3 | S | Macaé |
| P18 Comerciária de São Gonçalo | Gov | passagem-cara | 3 | S | paga passagem, mas SG–Niterói |
| B01 Agricultor familiar no Nordeste | Pres | trabalho-app | 1 | N | agricultor familiar |
| B01 Agricultor familiar no Nordeste | Pres | juros-altos | 4 | P |  |
| B01 Agricultor familiar no Nordeste | Pres | faccao-bairro | 3 | S |  |
| B01 Agricultor familiar no Nordeste | Pres | celular-roubado | 2 | S | sertão, zona rural |
| B01 Agricultor familiar no Nordeste | Pres | gasto-governo | 3 | S |  |
| B02 Trabalhadora do Sul após a enchente | Pres | faccao-bairro | 3 | S |  |
| B03 Ribeirinho no Norte | Pres | trabalho-app | 1 | N | pescador ribeirinho |
| B03 Ribeirinho no Norte | Pres | juros-altos | 4 | P |  |
| B03 Ribeirinho no Norte | Pres | celular-roubado | 2 | S | ribeirinho, sem ponto de ônibus |
| B03 Ribeirinho no Norte | Pres | conta-luz | 4 | P | fracking e hidrelétrica distantes; luz sim |
| B03 Ribeirinho no Norte | Pres | video-falso | 3 | S | internet fraca no rio |
| B03 Ribeirinho no Norte | Pres | gasto-governo | 3 | S |  |
| B05 Aposentada do INSS no Nordeste | Pres | escala-6x1 | 3 | P | idem |
| B05 Aposentada do INSS no Nordeste | Pres | juros-altos | 4 | P |  |
| B05 Aposentada do INSS no Nordeste | Pres | fila-cirurgia | 2 | S | 67 anos |
| B05 Aposentada do INSS no Nordeste | Pres | faccao-bairro | 3 | S |  |
| B05 Aposentada do INSS no Nordeste | Pres | celular-roubado | 3 | S |  |
| B05 Aposentada do INSS no Nordeste | Pres | pagar-faculdade | 1 | N | 67 anos |
| B06 Produtor rural no Centro-Oeste | Pres | plano-voltou-sus | 3 | S | família paga o plano da mãe |
| B06 Produtor rural no Centro-Oeste | Pres | faccao-bairro | 3 | S |  |
| B06 Produtor rural no Centro-Oeste | Pres | celular-sinal | 3 | S | Rio Verde |
| V00 Quem pula o perfil | Gov | trem-parado | 3 | S |  |
| V00 Quem pula o perfil | Gov | passagem-cara | 3 | S |  |
| V00 Quem pula o perfil | Pres | faccao-bairro | 3 | S |  |
| V00 Quem pula o perfil | Pres | largar-escola | 3 | S | quem pula pode não ter filho |


## Lacunas

### 1. Mais graves (nota 1 ou 2, grupo grande de eleitores)

| # | Eleição / grupo | Quem fica mal servido | O que acontece hoje | Tamanho |
|---|---|---|---|---|
| L1 | Pres / jornada | **Todo autônomo que não trabalha por aplicativo**: diarista, pedreiro, camelô, MEI com loja, agricultor familiar, pescador | A resposta "Por conta própria, MEI ou aplicativo" manda todos para `trabalho-app` ("você roda de aplicativo dez horas por dia"). Três das quatro opções falam de app (nota 1, opções N) | 25,3% dos ocupados trabalham por conta própria ([IBGE, 2º tri/2026](https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/47774-pnad-continua-trimestral-desocupacao-cai-em-13-das-27-ufs-no-2-trimestre-de-2026)); por aplicativo são 1,7 milhão ([IBGE, 2025](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44806-numero-de-trabalhadores-por-aplicativos-cresceu-25-4-entre-2022-e-2024)) |
| L2 | Pres / escola | **Aposentado sem criança em casa** | Marca "não tem criança em idade escolar" e cai em `pagar-faculdade` ("seu filho, ou você, quer fazer faculdade, e a dívida do financiamento assusta"). Aos 70 anos, nota 1 e opções N | 32,1 milhões de pessoas com 60+ ([IBGE, Censo 2022](https://biblioteca.ibge.gov.br/visualizacao/livros/liv102038.pdf)) |
| L3 | Pres / fila-sus e Gov / fila-especialista | **Idosos** | A cena padrão é "sua mãe espera", e `plano-voltou-sus` é "o plano da sua mãe ficou caro depois dos 60". Para quem já tem 60+, o paciente é ele mesmo (nota 2). Nenhuma variante fala com o aposentado | No RJ, 18,8% têm 60+, a 2ª maior fatia do país (mesma fonte) |
| L4 | Gov / rua-alagada | **Interior fora da serra** (Norte, Noroeste, Lagos, Sul Fluminense) | `encosta-serra` ("choveu três dias seguidos na serra") vai para todo o interior. Em Campos, Itaperuna ou Macaé, a chuva é rio que transborda e barreira que cai na estrada (nota 2) | A maior parte do interior |
| L5 | Gov / passagem-cara | **Interior, Leste Fluminense e quem anda de moto, bicicleta ou a pé** | Só existem a cena de Nova Iguaçu ao Centro do Rio e a de quem anda de carro. No interior e para quem não pega ônibus, a nota é 2; em São Gonçalo, 3 | Interior + Leste + a resposta "moto, bicicleta ou a pé" (andar a pé é o meio principal de 21,6% da população urbana, [CNT via Correio Braziliense](https://www.correiobraziliense.com.br/economia/2024/08/6915554-onibus-perdem-passageiros-para-carro-moto-e-app-mostra-pesquisa.html)) |
| L6 | Gov / passagem-cara | **Motorista de app e pequeno comerciante da Baixada** (carro, faixa pública ou mista) | `vale-transporte` ("quem trabalha com você, ou na sua casa, vem de Nova Iguaçu") pressupõe empregar alguém e morar longe da Baixada. Para quem mora em Meriti e não emprega ninguém, a nota é 1. No interior, também 1 | Todo dono de carro fora da capital e de Niterói |
| L7 | Gov / operacao-policial | **Dono de carro no interior** | `via-expressa-fechada` (Avenida Brasil fechada) vai para quem dirige em Macaé ou Campos (nota 2) | Interior motorizado |

### 2. Perfis sem nenhuma variante própria (antes)

| Perfil | Governador | Presidente |
|---|---|---|
| Aposentado (`trabalho=aposentado`) | nenhuma: vê "sua mãe" e "seu primo" | nenhuma; e pior, cai em `pagar-faculdade` |
| Autônomo não-app | nenhuma: as cenas padrão já servem | nenhuma própria: recebe a do app, que não é dele |
| Sem trabalho (desempregado, estudante, dona de casa) | nenhuma, mas `primo-desempregado` já é a vida dela (nota 4-5) | nenhuma, e as padrão servem (4) |
| Moto, bicicleta ou a pé | nenhuma | nenhuma (as padrão servem) |
| Trabalha em casa (`casa`) | nenhuma: vê o trem de Japeri e a passagem de Nova Iguaçu (nota 2 na Zona Sul) | n/a |
| Leste Fluminense com ônibus | só `barca-leste` | n/a |
| Rural | **não há campo no perfil** que identifique zona rural | idem |

### 3. Variantes padrão que não são neutras (quem pula o perfil vê estas)

| Padrão | Problema | Proposta |
|---|---|---|
| Gov `fila-especialista`: "Sua mãe tá há mais de 5 meses na fila…" | exclui idosos e quem já perdeu a mãe | "Sua mãe, ou alguém da família, …" (o mesmo recurso de escala-6x1 e salario-minimo) |
| Pres `fila-cirurgia`: "Sua mãe espera há meses…" | idem | idem |
| Pres `largar-escola`: "Seu filho está no ensino médio público…" | quem pula e não tem filho (jovem, idoso) fica sem lugar na cena (nota 3) | "Seu filho, ou um jovem da família, …" |
| Gov `trem-parado` (ramal de Japeri) e `passagem-cara` (Nova Iguaçu) | são da Baixada, e é de propósito: a competência do estado está no trem e no ônibus intermunicipal, e a Baixada é o maior público. Não reescrevi. As lacunas do interior, do Leste e de moto/a pé foram tratadas com variantes | — |
| Gov `rua-alagada`: "você perdeu a geladeira" | casa térrea: nota 2 a 3 para quem mora em apartamento da faixa mista. Mantive, porque a maioria de quem vê a padrão (faixa pública e quem pula) mora em casa na Baixada, na Zona Norte e na Zona Oeste, onde a nota é 5. Mudar para "vizinho" perderia mais do que ganharia | — |

### 4. Regras de `publico` que mandam a variante errada

| Variante | Regra hoje | Quem recebe e não devia | Nota |
|---|---|---|---|
| Pres `trabalho-app` | `trabalho: autonomo` | diarista, MEI, agricultor, pescador | 1 |
| Pres `pagar-faculdade` | `escola: particular, nenhuma` | aposentado sem criança em casa | 1 |
| Gov `vale-transporte` | `deslocamento: carro` | motorista de app e comerciante da Baixada; dono de carro do interior | 1-2 |
| Gov `via-expressa-fechada` | `deslocamento: carro, app` | quem dirige no interior | 2 |
| Gov `encosta-serra` | `regiao: interior` | interior fora da serra | 2 |
| Gov `plano-voltou-sus` e Pres `plano-voltou-sus` | `saude: plano_*` | aposentado com plano ("a mãe dele") | 2 |
| Gov `licenca-empresa` | `trabalho: empresario` | empregador de comércio ou serviço (restaurante, loja): galpão e licença ambiental são da indústria | 2 (sem correção possível: a opção b é sobre licenciamento ambiental; fica como lacuna) |

**Causa estrutural (fora do escopo de dados, mas é a correção de verdade).** Três respostas da tela "sobre você" juntam grupos que vivem coisas diferentes:

- "Por conta própria, MEI ou aplicativo": 26 milhões de conta-própria junto com 1,7 milhão de trabalhadores de app.
- "Moto, bicicleta ou a pé": o motoboy junto com quem caminha para economizar a passagem.
- Não há como saber quem mora na zona rural.

Recomendo separar "Aplicativo (entrega ou motorista)" de "Por conta própria ou MEI". O `publico` de `trabalho-app` passaria a ser `trabalho: app`, e o ajuste por deslocamento proposto abaixo deixaria de ser necessário. Mudar a tela é mudança em `src/`, e fica para o dono do produto decidir.

## Propostas, por prioridade (nº de eleitores afetados)

A ordem conta: `selecionarCenas` pega a **primeira** variante que combina, na ordem do JSON. A coluna "Onde" diz em que ponto do `perguntas[]` inserir.

| Prio | Tipo | Eleição | Id | Público | Onde | Resolve |
|---|---|---|---|---|---|---|
| 1 | ajuste | Pres | `trabalho-app` | `autonomo` **e** deslocamento `moto`, `carro` ou `app` | — | L1 (parte) |
| 1 | variante | Pres | **`conta-propria`** (opções de escala-6x1) | `trabalho: autonomo` | depois de `trabalho-app` | L1 |
| 2 | variante | Pres | **`fila-aposentado`** (opções de fila-cirurgia) | `trabalho: aposentado` | **antes** de `especialista-longe`, porque a variante do Norte também fala "sua mãe" | L3 |
| 2 | variante | Pres | **`neto-escola`** (opções de largar-escola) | `trabalho: aposentado` | antes de `pagar-faculdade` | L2 |
| 2 | variante | Pres | **`jornada-familia`** (opções de escala-6x1, b com o texto protegido) | `trabalho: aposentado` | depois de `conta-propria` | aposentado na jornada (nota 2-3 → 4) |
| 3 | variante | Gov | **`fila-aposentado`** (opções de fila-especialista) | `trabalho: aposentado` | depois de `saude-interior` (no interior, "sua tia" ainda serve ao aposentado) e antes de `plano-voltou-sus` | L3 |
| 4 | variante | Gov | **`chuva-interior`** (opções de rua-alagada; b "canais e valões") | `regiao: interior` | antes de `encosta-serra`, que fica inalcançável: **retirar `encosta-serra` e seu contexto** | L4 |
| 5 | variante | Gov | **`passagem-moto`** (opções de passagem-cara) | `deslocamento: moto` | depois de `vale-transporte` | L5 |
| 5 | variante | Gov | **`passagem-interior`** (idem) | `regiao: interior` | depois de `passagem-moto` | L5 |
| 5 | variante | Gov | **`passagem-leste`** (idem) | `regiao: leste` | depois de `passagem-interior` | L5 |
| 6 | ajuste | Gov | `vale-transporte` | `carro` ou `casa`, **e** faixa mista/privada, **e** região capital ou Leste | — | L6 |
| 7 | ajuste | Gov | `via-expressa-fechada` | `carro`/`app` **e** região capital, Baixada ou Leste | — | L7 |
| 8 | padrão | Gov | `fila-especialista` (cena) | — | — | universalidade |
| 8 | padrão | Pres | `fila-cirurgia` (cena) | — | — | universalidade |
| 8 | padrão | Pres | `largar-escola` (cena) | — | — | universalidade |

Ordem final dos grupos que mudam:

- Pres `jornada`: escala-6x1 · custo-contratar · trabalho-app · **conta-propria** · **jornada-familia**
- Pres `fila-sus`: fila-cirurgia · **fila-aposentado** · especialista-longe · plano-voltou-sus
- Pres `escola`: largar-escola · **neto-escola** · pagar-faculdade
- Gov `fila-especialista`: fila-especialista · saude-interior · **fila-aposentado** · plano-voltou-sus
- Gov `rua-alagada`: rua-alagada · **chuva-interior** · ~~encosta-serra~~ · garagem-alagada
- Gov `passagem-cara`: passagem-cara · vale-transporte · **passagem-moto** · **passagem-interior** · **passagem-leste**

Por que moto vem antes de interior e de Leste no grupo da passagem: a cena da moto fala da escolha da própria pessoa (ela saiu do ônibus), e a regional fala da passagem que ela não paga mais. No trem e na saúde a regra "região antes de faixa" continua valendo.

### As 9 variantes novas (texto)

| Id | Cena | Pergunta | Fato (fonte) |
|---|---|---|---|
| Pres `conta-propria` | Você trabalha por conta própria: se parar um dia, não ganha. A vaga com carteira que aparece é 6x1 e paga pouco. | O que faria a carteira assinada valer a pena pra você? | 25,3% dos ocupados por conta própria, 33,8% no Maranhão (IBGE, PNAD 2º tri/2026) |
| Pres `fila-aposentado` | Você passou dos 60 e precisa operar. Pelo SUS, a espera já passa de meses, e plano nessa idade custa caro. | O que resolvia mais rápido? | 32,1 milhões com 60+ em 2022, +56% sobre 2010 (IBGE, Censo 2022) |
| Pres `neto-escola` | Seu neto está no ensino médio público e fala em largar a escola pra trabalhar. | O que segurava ele na escola? | 1 em cada 4 jovens de 19 anos sem ensino médio (Anuário 2026, o mesmo da origem) |
| Pres `jornada-familia` | Seu filho, ou seu neto, trabalha seis dias por semana e folga um. No domingo, mal dá pra ver a família. | O que você defenderia pra jornada de trabalho? | o da origem (14,8 milhões em 6x1, g1/MTE) |
| Gov `fila-aposentado` | Você passou dos 60 e precisa de um especialista. No SUS, a espera passa de 5 meses, e plano nessa idade custa caro. | O que resolvia mais rápido? | 18,8% dos moradores do RJ têm 60+, 2ª maior fatia do país (IBGE, Censo 2022) |
| Gov `chuva-interior` | Três dias de chuva no interior: o rio subiu, a água entrou nas casas e a barreira caiu na estrada. | O que devia vir primeiro? | 2.600 afetados e 315 desalojados em Itaperuna, fev/2026 (g1) |
| Gov `passagem-moto` | Você trocou o ônibus pela moto, pela bicicleta ou pela caminhada. A passagem pesava demais no mês. | Pra passagem voltar a caber no bolso, o que você prefere? | 69,6% de quem largou o ônibus voltaria com passagem mais barata (CNT 2024, via Technibus) |
| Gov `passagem-interior` | No interior, o ônibus pra cidade vizinha pode passar de R$ 20. Quem estuda ou se trata fora paga ida e volta. | Pra passagem pesar menos no seu bolso, o que você prefere? | reajuste de 11,69% no interior; Friburgo–Cordeiro a R$ 20 (A Voz da Serra, 20/02/2026) |
| Gov `passagem-leste` | De São Gonçalo a Niterói, o ônibus custa R$ 7,10. Quem segue pro Rio ainda paga a barca, todo dia. | Pra passagem pesar menos no seu bolso, o que você prefere? | SG–Niterói a R$ 7,10 após reajuste de 12,61% (Tempo Real RJ, 13/02/2026) |

Contexto do "Leia": cada variante traz 3 ou 4 parágrafos, com 138 a 170 palavras. O 1º parágrafo é novo; os de trade-off (em geral o 3º) vêm da pergunta de origem, com as fontes dela. Todas as fontes novas foram abertas e lidas nesta rodada, e as reaproveitadas foram reabertas para conferir que o link ainda funciona.

### Riscos e limites das propostas

- **`conta-propria` e `jornada-familia` reusam as opções da 6x1.** Para o autônomo, a pergunta vira "o que faria a carteira valer a pena", e as quatro opções (fim da 6x1, negociar direto, rever a reforma, menos encargo) respondem a ela sem mudar a preferência. Na `jornada-familia`, a opção b protegida fala "a minha jornada". Para o avô, a leitura fica meio torta (nota de opções P), mas o texto não pode mudar.
- **Cena que puxa uma opção.** Em `conta-propria`, "a vaga… é 6x1" põe a 6x1 como o problema, como a cena de origem já fazia. Em `fila-aposentado`, "plano nessa idade custa caro" não favorece nenhuma das quatro saídas.
- **Opção d (metrô) em `passagem-interior` e `passagem-leste`.** Continua fora do mundo de quem mora lá; é o limite de reusar as opções de passagem-cara. A cena passa a ser dele, e a opção vira "a que ele não escolheria".
- **Resíduo de L1.** O autônomo não-app que anda de moto ou de carro (agricultor, pedreiro, comerciante com carro) continua vendo a cena do app. Só a mudança na tela do perfil resolve.
- **`passagem-moto` e quem anda a pé.** A cena cobre as três formas da resposta ("moto, bicicleta ou caminhada") de propósito. O dado honesto vai no contexto: na Grande Rio, quem trocou o ônibus pela moto aponta mais o tempo de viagem que o preço ([Coppe/UFRJ](https://diariodotransporte.com.br/2025/12/03/pesquisa-da-ufrj-aponta-migracao-acelerada-de-usuarios-do-transporte-coletivo-para-motos-no-rio-de-janeiro-e-reforca-urgencia-de-prioridade-aos-sistemas-publicos/)).
- **Notas dos candidatos.** São copiadas da origem por script, como pedido. Nenhuma preferência mudou, então não há reavaliação a fazer.

### Lacunas que ficam (nota ≤ 2 mesmo depois)

| Persona | Cena | Por quê fica |
|---|---|---|
| Rural (P10, B01) | Pres `trabalho-app`; Gov `operacao-policial`; `celular-roubado` nas duas | não há campo "zona rural"; o agricultor anda de moto e cai no app |
| Ribeirinho (B03) | Pres `celular-roubado` ("no ponto de ônibus") | idem |
| MEI com carro (P06) | Pres `trabalho-app` | resíduo de L1 |
| Empresária de serviços (P14) | Gov `licenca-empresa` | a opção b é sobre licença ambiental; uma cena de restaurante não tem como carregá-la |
| Aposentado da Tijuca (P15), home office em Botafogo (P16) | Gov `trem-parado`, `passagem-cara`, `rua-alagada` | as opções do trem e da passagem são da competência do estado, e o trem é da Baixada; não há cena de trem para quem não usa trem. É lacuna aceitável: esses perfis veem a cena como notícia (nota 2 a 3), não como vida |


## Cobertura antes e depois (simulada com a função real)

Cenas com nota ≥ 4 por persona, nota média e nº de cenas com nota ≤ 2. "Depois" = `selecionarCenas` rodando sobre os JSON com os 3 ajustes, as 9 variantes nas posições indicadas e as 3 cenas padrão reescritas. ◀ marca quem mudou.

| Persona | Eleição | Cenas ≥4 antes | depois | Nota média antes | depois | Cenas ≤2 antes | depois |
|---|---|---|---|---|---|---|---|
| P01 Diarista na Baixada | Gov | 11/11 | 11/11 | 4.55 | 4.55 | 0 | 0 |
| P01 Diarista na Baixada ◀ | Pres | 11/12 | 12/12 | 4.17 | 4.42 | 1 | 0 |
| P02 Motoboy de app em São Gonçalo ◀ | Gov | 8/11 | 9/11 | 3.91 | 4.18 | 1 | 0 |
| P02 Motoboy de app em São Gonçalo | Pres | 12/12 | 12/12 | 4.33 | 4.33 | 0 | 0 |
| P03 Aposentado do INSS no interior ◀ | Gov | 5/11 | 7/11 | 3.36 | 3.82 | 2 | 0 |
| P03 Aposentado do INSS no interior ◀ | Pres | 7/12 | 10/12 | 3.50 | 4.08 | 2 | 0 |
| P04 Desempregada com filhos | Gov | 10/11 | 10/11 | 4.09 | 4.09 | 0 | 0 |
| P04 Desempregada com filhos | Pres | 12/12 | 12/12 | 4.25 | 4.25 | 0 | 0 |
| P05 Servidora professora | Gov | 10/12 | 10/12 | 4.00 | 4.00 | 0 | 0 |
| P05 Servidora professora | Pres | 10/12 | 10/12 | 4.08 | 4.08 | 0 | 0 |
| P06 Pequeno comerciante MEI ◀ | Gov | 10/12 | 11/12 | 4.08 | 4.25 | 1 | 0 |
| P06 Pequeno comerciante MEI | Pres | 10/12 | 10/12 | 3.75 | 3.75 | 1 | 1 |
| P07 Executivo na Zona Sul | Gov | 11/12 | 11/12 | 4.33 | 4.33 | 0 | 0 |
| P07 Executivo na Zona Sul | Pres | 10/12 | 10/12 | 4.17 | 4.17 | 0 | 0 |
| P08 Casal de classe média em Niterói | Gov | 11/12 | 11/12 | 3.92 | 3.92 | 0 | 0 |
| P08 Casal de classe média em Niterói | Pres | 10/12 | 10/12 | 4.08 | 4.08 | 0 | 0 |
| P09 Estudante universitário sem renda | Gov | 10/11 | 10/11 | 4.00 | 4.00 | 0 | 0 |
| P09 Estudante universitário sem renda | Pres | 11/12 | 11/12 | 4.17 | 4.17 | 0 | 0 |
| P10 Trabalhador rural no interior ◀ | Gov | 4/11 | 6/11 | 3.09 | 3.55 | 4 | 2 |
| P10 Trabalhador rural no interior | Pres | 9/12 | 9/12 | 3.75 | 3.75 | 2 | 2 |
| P11 Morador de favela com operação | Gov | 9/11 | 9/11 | 4.18 | 4.18 | 0 | 0 |
| P11 Morador de favela com operação | Pres | 12/12 | 12/12 | 4.42 | 4.42 | 0 | 0 |
| P12 Idosa sem escolaridade ◀ | Gov | 5/11 | 6/11 | 3.55 | 3.82 | 1 | 0 |
| P12 Idosa sem escolaridade ◀ | Pres | 8/12 | 11/12 | 3.58 | 4.17 | 2 | 0 |
| P13 Motorista de app na Baixada ◀ | Gov | 10/11 | 11/11 | 4.18 | 4.45 | 1 | 0 |
| P13 Motorista de app na Baixada | Pres | 12/12 | 12/12 | 4.42 | 4.42 | 0 | 0 |
| P14 Empresária na Barra | Gov | 10/12 | 10/12 | 4.00 | 4.00 | 1 | 1 |
| P14 Empresária na Barra | Pres | 11/12 | 11/12 | 4.25 | 4.25 | 0 | 0 |
| P15 Aposentado de classe média ◀ | Gov | 4/12 | 5/12 | 3.08 | 3.25 | 3 | 2 |
| P15 Aposentado de classe média ◀ | Pres | 7/12 | 9/12 | 3.50 | 3.92 | 3 | 0 |
| P16 Analista em home office ◀ | Gov | 4/12 | 4/12 | 3.17 | 3.25 | 3 | 2 |
| P16 Analista em home office | Pres | 7/12 | 7/12 | 3.75 | 3.75 | 0 | 0 |
| P17 Engenheiro em Macaé ◀ | Gov | 4/12 | 5/12 | 3.17 | 3.58 | 3 | 0 |
| P17 Engenheiro em Macaé | Pres | 9/12 | 9/12 | 4.00 | 4.00 | 0 | 0 |
| P18 Comerciária de São Gonçalo ◀ | Gov | 10/11 | 11/11 | 4.27 | 4.45 | 0 | 0 |
| P18 Comerciária de São Gonçalo | Pres | 12/12 | 12/12 | 4.33 | 4.33 | 0 | 0 |
| B01 Agricultor familiar no Nordeste | Pres | 8/12 | 8/12 | 3.75 | 3.75 | 2 | 2 |
| B02 Trabalhadora do Sul após a enchente | Pres | 11/12 | 11/12 | 4.17 | 4.17 | 0 | 0 |
| B03 Ribeirinho no Norte ◀ | Pres | 8/12 | 8/12 | 3.75 | 3.92 | 2 | 1 |
| B04 Entregador de app em SP | Pres | 12/12 | 12/12 | 4.17 | 4.17 | 0 | 0 |
| B05 Aposentada do INSS no Nordeste ◀ | Pres | 7/12 | 10/12 | 3.50 | 4.08 | 2 | 0 |
| B06 Produtor rural no Centro-Oeste | Pres | 9/12 | 9/12 | 4.08 | 4.08 | 0 | 0 |
| V00 Quem pula o perfil | Gov | 9/11 | 9/11 | 3.82 | 3.82 | 0 | 0 |
| V00 Quem pula o perfil ◀ | Pres | 10/12 | 11/12 | 3.92 | 4.00 | 0 | 0 |
| **Média geral** | | **9.09** | **9.64** | **3.92** | **4.05** | **0.84** | **0.30** |
| Média Gov (19 personas) | | 8.16 | 8.74 | 3.83 | 3.97 | 1.05 | 0.37 |
| Média Pres (25 personas) | | 9.80 | 10.32 | 3.99 | 4.10 | 0.68 | 0.24 |


**Resumo.** A média de cenas com nota ≥ 4 por persona vai de **9,09 para 9,64** (governador: 8,16 → 8,74 em 11 a 12 cenas; presidente: 9,80 → 10,32 em 12). As cenas com nota ≤ 2 caem de **0,84 para 0,30 por persona** (37 → 13 células). O ganho se concentra onde a lacuna era maior:

- aposentado do INSS no interior: gov 5 → 7, pres 7 → 10 cenas ≥ 4;
- aposentada do Nordeste: pres 7 → 10;
- idosa da Baixada: gov 5 → 6, pres 8 → 11;
- aposentado de classe média: gov 4 → 5, pres 7 → 9;
- trabalhador rural: gov 4 → 6;
- engenheiro de Macaé: células ≤ 2 de 3 para 0;
- diarista: pres 11 → 12;
- motoboy de São Gonçalo: gov 8 → 9;
- motorista de app da Baixada: gov 10 → 11.

Quem já estava bem servido (classe média e alta da capital, trabalhador CLT da Baixada, entregador) não perde nada: nenhuma célula piorou.


## Como reproduzir

Scripts no scratchpad da sessão (`/tmp/claude-0/-home-user-Work/4683c10c-a959-51d0-8cc2-3c3f2049863a/scratchpad/classes/`):

- `personas.ts`: as 26 personas.
- `simular.ts`: roda `selecionarCenas` antes; com `--depois`, aplica `ajustes-publico.json` e `variantes-novas.json`; com `--json`, sai em JSON.
- `notas.py`: as notas por célula.
- `matriz.py`: as tabelas.
- `gerar_propostas.py`: gera os 3 JSON, copiando opções e parágrafos da origem.
- `validar.py`: as regras do app.

Para aplicar: inserir cada variante na posição de `inserir_antes_de`/`inserir_depois_de`, copiar as notas e evidências de `origem_opcoes` para o novo id (as preferências são idênticas), pôr `contexto` em `contexto*.json` sob o `id_novo`, aplicar `ajustes-publico.json` e `cenas-padrao.json`, e remover `encosta-serra` e seu contexto. Depois, rodar `npm test`. `cegamento.test.ts` exige contexto para todas as perguntas, e `legibilidade.test.ts` confere os limites (já validados aqui).

## Apêndice: matriz depois

| Persona | Eleição | Faixa | Cena vista (nota · opções) | ≥4 | ≤2 |
|---|---|---|---|---|---|
| P01 Diarista na Baixada | Gov | publico | trem-parado **5**; passagem-cara **5**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 11/11 | 0 |
| P01 Diarista na Baixada | Pres | publico | *conta-propria **4**; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P02 Motoboy de app em São Gonçalo | Gov | publico | *barca-leste **3**; *passagem-moto **5**; fila-especialista **4**; escola-bagunca **3**; operacao-policial **5**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **5**; primo-desempregado **5**; dinheiro-publico **4** | 9/11 | 0 |
| P02 Motoboy de app em São Gonçalo | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P03 Aposentado do INSS no interior | Gov | publico | *estrada-interior **5**; *passagem-interior **5**·P; *saude-interior **4**; escola-bagunca **3**; operacao-policial **3**; celular-roubado **3**; medida-protetiva **4**; *chuva-interior **4**; falta-agua **4**·P; primo-desempregado **3**; dinheiro-publico **4** | 7/11 | 0 |
| P03 Aposentado do INSS no interior | Pres | publico | *jornada-familia **4**·P; salario-minimo **5**; juros-altos **4**; *fila-aposentado **5**; faccao-bairro **3**; celular-roubado **3**; *neto-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P04 Desempregada com filhos | Gov | publico | trem-parado **4**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **5**; dinheiro-publico **4** | 10/11 | 0 |
| P04 Desempregada com filhos | Pres | publico | escala-6x1 **4**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P05 Servidora professora | Gov | misto | trem-parado **4**; passagem-cara **3**; *plano-voltou-sus **4**; escola-bagunca **5**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **3**; falta-agua **4**; *servidor-recomposicao **5**; *correria-praia **4**; dinheiro-publico **4** | 10/12 | 0 |
| P05 Servidora professora | Pres | misto | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P06 Pequeno comerciante MEI | Gov | misto | *transito-carro **5**; passagem-cara **4**; fila-especialista **4**; escola-bagunca **4**; *via-expressa-fechada **5**; *roubo-carro **4**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; *correria-praia **3**; dinheiro-publico **4** | 11/12 | 0 |
| P06 Pequeno comerciante MEI | Pres | misto | *trabalho-app **1**·N; *imposto-renda **3**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; *celular-sinal **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 1 |
| P07 Executivo na Zona Sul | Gov | privado | *transito-carro **5**; *vale-transporte **5**; *plano-voltou-sus **4**; *falta-tecnico **4**; *via-expressa-fechada **3**; *roubo-carro **5**; medida-protetiva **4**; *garagem-alagada **5**; *caminhao-pipa **4**; primo-desempregado **4**; *correria-praia **5**; dinheiro-publico **4** | 11/12 | 0 |
| P07 Executivo na Zona Sul | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **5**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P08 Casal de classe média em Niterói | Gov | privado | *barca-leste **4**; *vale-transporte **3**; *plano-voltou-sus **4**; *falta-tecnico **4**; *via-expressa-fechada **4**; *roubo-carro **4**; medida-protetiva **4**; *garagem-alagada **4**; *caminhao-pipa **4**; primo-desempregado **4**; *correria-praia **4**; dinheiro-publico **4** | 11/12 | 0 |
| P08 Casal de classe média em Niterói | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **4**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| P09 Estudante universitário sem renda | Gov | publico | trem-parado **4**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **4**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **4**; dinheiro-publico **4** | 10/11 | 0 |
| P09 Estudante universitário sem renda | Pres | publico | escala-6x1 **3**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **5**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| P10 Trabalhador rural no interior | Gov | publico | *estrada-interior **5**; *passagem-moto **4**·P; *saude-interior **4**; escola-bagunca **4**; operacao-policial **2**; celular-roubado **2**; medida-protetiva **4**; *chuva-interior **5**; falta-agua **3**·P; primo-desempregado **3**; dinheiro-publico **3** | 6/11 | 2 |
| P10 Trabalhador rural no interior | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **2**; largar-escola **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 2 |
| P11 Morador de favela com operação | Gov | publico | trem-parado **3**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 9/11 | 0 |
| P11 Morador de favela com operação | Pres | publico | escala-6x1 **5**; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P12 Idosa sem escolaridade | Gov | publico | trem-parado **3**; passagem-cara **3**; *fila-aposentado **5**; escola-bagunca **3**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **3**; dinheiro-publico **3** | 6/11 | 0 |
| P12 Idosa sem escolaridade | Pres | publico | *jornada-familia **4**·P; salario-minimo **5**; juros-altos **4**·N; *fila-aposentado **5**; faccao-bairro **4**; celular-roubado **4**; *neto-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **3**·P; agressor-rondando **4** | 11/12 | 0 |
| P13 Motorista de app na Baixada | Gov | publico | *transito-carro **5**; passagem-cara **4**; fila-especialista **4**; escola-bagunca **4**; *via-expressa-fechada **5**; *roubo-carro **5**; medida-protetiva **4**; rua-alagada **5**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 11/11 | 0 |
| P13 Motorista de app na Baixada | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **5**; fila-cirurgia **4**; faccao-bairro **5**; *celular-sinal **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| P14 Empresária na Barra | Gov | privado | *transito-carro **4**; *vale-transporte **5**; *plano-voltou-sus **4**; *falta-tecnico **3**; *via-expressa-fechada **4**; *roubo-carro **5**; medida-protetiva **4**; *garagem-alagada **5**; *caminhao-pipa **4**; *licenca-empresa **2**·P; *correria-praia **4**; dinheiro-publico **4** | 10/12 | 1 |
| P14 Empresária na Barra | Pres | privado | *custo-contratar **5**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **4**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| P15 Aposentado de classe média | Gov | misto | trem-parado **2**; passagem-cara **2**; *fila-aposentado **4**; escola-bagunca **3**; operacao-policial **3**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **3**; falta-agua **4**; primo-desempregado **3**; *correria-praia **3**; dinheiro-publico **4** | 5/12 | 2 |
| P15 Aposentado de classe média | Pres | misto | *jornada-familia **4**·P; *imposto-renda **5**; juros-altos **4**; *fila-aposentado **4**; faccao-bairro **3**; celular-roubado **4**; *neto-escola **3**; conta-luz **5**; enchente-seca **3**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 0 |
| P16 Analista em home office | Gov | misto | trem-parado **2**; *vale-transporte **3**; *plano-voltou-sus **4**; *falta-tecnico **3**; operacao-policial **3**; celular-roubado **3**; medida-protetiva **4**; rua-alagada **2**; falta-agua **3**; primo-desempregado **3**; *correria-praia **5**; dinheiro-publico **4** | 4/12 | 2 |
| P16 Analista em home office | Pres | misto | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **3**; *pagar-faculdade **3**; conta-luz **5**; enchente-seca **3**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 7/12 | 0 |
| P17 Engenheiro em Macaé | Gov | privado | *estrada-interior **5**; *passagem-interior **3**·P; *saude-interior **3**; *falta-tecnico **5**; operacao-policial **3**; *roubo-carro **3**; medida-protetiva **4**; *chuva-interior **4**; *caminhao-pipa **3**·P; primo-desempregado **3**; *correria-praia **3**; dinheiro-publico **4** | 5/12 | 0 |
| P17 Engenheiro em Macaé | Pres | privado | escala-6x1 **3**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; *celular-sinal **3**; *pagar-faculdade **5**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 0 |
| P18 Comerciária de São Gonçalo | Gov | publico | *barca-leste **5**; *passagem-leste **5**·P; fila-especialista **4**; escola-bagunca **4**; operacao-policial **5**; celular-roubado **5**; medida-protetiva **4**; rua-alagada **4**; falta-agua **5**; primo-desempregado **4**; dinheiro-publico **4** | 11/11 | 0 |
| P18 Comerciária de São Gonçalo | Pres | publico | escala-6x1 **4**; salario-minimo **5**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **5**; celular-roubado **5**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| B01 Agricultor familiar no Nordeste | Pres | publico | *trabalho-app **1**·N; salario-minimo **5**; juros-altos **4**·P; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **2**; largar-escola **5**; conta-luz **5**; *seca-nordeste **5**; video-falso **4**; gasto-governo **3**; agressor-rondando **4** | 8/12 | 2 |
| B02 Trabalhadora do Sul após a enchente | Pres | publico | escala-6x1 **4**; salario-minimo **4**; juros-altos **4**; *plano-voltou-sus **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **5**; conta-luz **5**; *enchente-sul **5**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |
| B03 Ribeirinho no Norte | Pres | publico | *conta-propria **3**; salario-minimo **5**; juros-altos **4**·P; *especialista-longe **5**; faccao-bairro **4**; celular-roubado **2**; largar-escola **5**; conta-luz **4**·P; *fumaca-queimada **5**; video-falso **3**; gasto-governo **3**; agressor-rondando **4** | 8/12 | 1 |
| B04 Entregador de app em SP | Pres | publico | *trabalho-app **5**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **4**; celular-roubado **4**; *pagar-faculdade **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 12/12 | 0 |
| B05 Aposentada do INSS no Nordeste | Pres | publico | *jornada-familia **4**·P; salario-minimo **5**; juros-altos **4**·P; *fila-aposentado **5**; faccao-bairro **3**; celular-roubado **3**; *neto-escola **4**; conta-luz **5**; *seca-nordeste **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 10/12 | 0 |
| B06 Produtor rural no Centro-Oeste | Pres | privado | *custo-contratar **5**; *imposto-renda **5**; juros-altos **4**; *plano-voltou-sus **3**; faccao-bairro **3**; *celular-sinal **3**; *pagar-faculdade **5**; conta-luz **5**; *fumaca-queimada **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 9/12 | 0 |
| V00 Quem pula o perfil | Gov | — | trem-parado **3**; passagem-cara **3**; fila-especialista **4**; escola-bagunca **4**; operacao-policial **4**; celular-roubado **4**; medida-protetiva **4**; rua-alagada **4**; falta-agua **4**; primo-desempregado **4**; dinheiro-publico **4** | 9/11 | 0 |
| V00 Quem pula o perfil | Pres | — | escala-6x1 **4**; salario-minimo **4**; juros-altos **4**; fila-cirurgia **4**; faccao-bairro **3**; celular-roubado **4**; largar-escola **4**; conta-luz **5**; enchente-seca **4**; video-falso **4**; gasto-governo **4**; agressor-rondando **4** | 11/12 | 0 |

