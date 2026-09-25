# Reavaliação de aderência: Eduardo Paes (governador RJ, quiz 3.4.0)

Data: 25/09/2026. Dossiê: `pipeline/dossies/governador-rj/eduardo-paes.json` (125 propostas; p81–p125 são novas).
Rascunho: `pipeline/rascunhos/reavaliacao-governador-eduardo-paes.json` (104 opções, completo). Base de comparação: `src/data/aderencia.json` (gerado em 24/09).
Rubrica: `pipeline/aderencia.py`, com a regra extra de contradição (posições documentadas que se contradizem e tocam a preferência → faixa 40-59, citando ambas).

## Resumo

- Notas alteradas: **23** de 104 (17 opções distintas; 6 se repetem em perguntas-gêmeas com a mesma preferência).
- null → nota: **3**. nota → null: **0**.
- Mudanças de 20 pontos ou mais: **9** (marcadas com ⚠ na tabela).
- Opções com nota mantida, mas evidências e/ou justificativa atualizadas: 42.
- Notas mantidas de propósito: variações de ±5 dentro da mesma faixa (ex.: câmeras integradas com p99, Refis/incentivos com p121) não mudaram a nota; só ganharam evidência.

## Todas as notas que mudaram

| pergunta / opção | antes → depois | evidências novas | motivo |
|---|---|---|---|
| trem-parado / a | 10 → **50** (+40) ⚠ | p109, p114, p91 | Novas falas admitem trocar a concessionária por empresa pública se ela falhar (p109, p114) e rever contratos (p91); contradição com p74 documentada → faixa 40-59. |
| trem-parado / b | 90 → **55** (-35) ⚠ | p91, p109, p114 | Auditoria sem ameaça de rompimento segue em p74/p91, mas a contradição documentada (p109, p114) toca justamente o "sem ameaçar romper" → faixa 40-59. |
| trem-parado / d | 5 → **40** (+35) ⚠ | p114, p109, p111 | Admite empresa pública nos moldes da MobiRio para os trens (p109, p111, p114), em contradição com p74 → faixa 40-59, no piso porque é condicional. |
| barca-leste / d | 10 → **40** (+30) ⚠ | p111, p114 | p111/p114 admitem empresa pública de transporte em geral; contradição com p74. Nada sobre barcas nem tarifa zero → piso da faixa 40-59. |
| passagem-cara / d | 45 → **60** (+15) | p108, p102 | p108 trata especificamente da tarifa do metrô: há como reduzir, após controle da bilhetagem e cálculo do subsídio; p102 diz que "dava para baixar". Mesma direção, condicional e sem valor. |
| vale-transporte / d | 45 → **60** (+15) | p108, p102 | p108 trata especificamente da tarifa do metrô: há como reduzir, após controle da bilhetagem e cálculo do subsídio; p102 diz que "dava para baixar". Mesma direção, condicional e sem valor. |
| operacao-policial / a | 70 → **80** (+10) | p85, p123, p90 | p85 e p123 põem a retomada de território no centro; p90 avalia a megaoperação pela falta de ocupação posterior. |
| operacao-policial / b | 90 → **55** (-35) ⚠ | p87, p98, p32, p123 | Contradição documentada: p31 (prender, não neutralizar) × p32 e p123 ("será neutralizado") → faixa 40-59. A parte de inteligência segue firme (p87, p98). |
| operacao-policial / c | 85 → **60** (-25) ⚠ | p88, p29, p100 | Presença policial após a operação segue firme (p88, p29), mas p100 questiona que áreas pacificadas precisem sobretudo de serviços sociais (tensão registrada no dossiê). |
| via-expressa-fechada / a | 70 → **80** (+10) | p85, p123, p90 | p85 e p123 põem a retomada de território no centro; p90 avalia a megaoperação pela falta de ocupação posterior. |
| via-expressa-fechada / b | 90 → **55** (-35) ⚠ | p87, p98, p32, p123 | Contradição documentada: p31 (prender, não neutralizar) × p32 e p123 ("será neutralizado") → faixa 40-59. A parte de inteligência segue firme (p87, p98). |
| via-expressa-fechada / c | 85 → **60** (-25) ⚠ | p88, p29, p100 | Presença policial após a operação segue firme (p88, p29), mas p100 questiona que áreas pacificadas precisem sobretudo de serviços sociais (tensão registrada no dossiê). |
| celular-roubado / b | 75 → **85** (+10) | p97, p1 | p97 promete preencher os quadros da PM; p1 (plano) prevê aumento do efetivo do policiamento ostensivo. |
| roubo-carro / b | 75 → **85** (+10) | p97, p1 | p97 promete preencher os quadros da PM; p1 (plano) prevê aumento do efetivo do policiamento ostensivo. |
| falta-agua / c | 10 → **20** (+10) | p91 | p91: "não terei problema em rever esses contratos". Revisão não é rescisão, e as falas sobre empresa pública (p109-p114) tratam só de transporte. |
| caminhao-pipa / c | 10 → **20** (+10) | p91 | p91: "não terei problema em rever esses contratos". Revisão não é rescisão, e as falas sobre empresa pública (p109-p114) tratam só de transporte. |
| primo-desempregado / c | 45 → **35** (-10) | p120, p121 | p120 e p121 reforçam papel ativo do estado (prioridade de industrialização e mais incentivos), direção oposta a limitar o Estado. |
| servidor-recomposicao / a | null → **50** | p96 | p96 é a primeira fala sobre reajuste anual, mas só como credencial de prefeito, sem compromisso para o estado → ambígua. |
| licenca-empresa / c | 95 → **55** (-40) ⚠ | p119, p115 | Contradição documentada: p53/p119 (regra estável, segurança jurídica) × p115 ("não tem essa conversa de agência reguladora mandando") → faixa 40-59. |
| licenca-empresa / d | null → **45** | p121, p52 | p121 pede "mais incentivos" e p52 propõe Refis, sem contrapartidas nem devolução. O tema incentivos passa a ter proposta, mas sem a condicionalidade pedida. |
| correria-praia / a | 75 → **85** (+10) | p1, p97 | p97 (preencher quadros da PM) e p1 (aumento do efetivo do policiamento ostensivo, no plano). |
| correria-praia / c | 85 → **95** (+10) | p85, p123 | p85 (o governador conduzirá a retomada em todo o estado) e p123 ("vai ter ... retomada de território") tornam a prioridade explícita. |
| dinheiro-publico / c | null → **55** | p57, p92, p83 | p92 ("vou no detalhe das despesas") e p83 ("não admite desperdício"), somados a p57, tratam de controle de despesa; corte de cargos (teto de 5%) só aparece em paráfrase. |

## Mudanças de 20 pontos ou mais

- ⚠ **trem-parado / a**: 10 → 50. Posição contraditória no dossiê: diz que não vai sair ameaçando romper contratos de concessão, mas admite criar empresa pública se a concessionária dos trens não operar bem e diz não ter problema em rever contratos.
- ⚠ **trem-parado / b**: 90 → 55. Posição contraditória no dossiê: propõe auditar os contratos de concessão sem ameaçar rompê-los, mas em outras falas admite substituir a concessionária dos trens por uma empresa pública.
- ⚠ **trem-parado / d**: 5 → 40. Posição contraditória no dossiê: diz não ter problema com concessões e não ameaçar rompê-las, mas não descarta criar uma empresa pública para os trens caso a concessionária falhe.
- ⚠ **barca-leste / d**: 10 → 40. Posição contraditória no dossiê: diz que não vai ameaçar romper concessões, mas admite criar empresa pública de transporte se necessário; não trata das barcas nem de tarifa social ou zero.
- ⚠ **operacao-policial / b**: 90 → 55. Posição contraditória no dossiê: na sabatina diz que o objetivo deve ser prender, com inteligência, e não neutralizar; em entrevistas anteriores diz que quem enfrenta o Estado tem que ser neutralizado.
- ⚠ **operacao-policial / c**: 85 → 60. Defende plano de ocupação para o dia seguinte e bases do Bope nas áreas retomadas, mas questiona a ideia de que essas áreas precisam sobretudo de serviços sociais.
- ⚠ **via-expressa-fechada / b**: 90 → 55. Posição contraditória no dossiê: na sabatina diz que o objetivo deve ser prender, com inteligência, e não neutralizar; em entrevistas anteriores diz que quem enfrenta o Estado tem que ser neutralizado.
- ⚠ **via-expressa-fechada / c**: 85 → 60. Defende plano de ocupação para o dia seguinte e bases do Bope nas áreas retomadas, mas questiona a ideia de que essas áreas precisam sobretudo de serviços sociais.
- ⚠ **licenca-empresa / c**: 95 → 55. Posição contraditória no dossiê: defende previsibilidade, regra estável e menos burocracia para investidores, mas diz que em seu governo não haverá agência reguladora mandando.

## null → nota

- servidor-recomposicao / a → 50 (p96). Apresenta como credencial ter dado reajuste aos servidores todos os anos como prefeito, sem compromisso explícito de recomposição anual no estado.
- licenca-empresa / d → 45 (p121, p52). Defende mais incentivos para o Sul Fluminense e Refis para estaleiros, sem tratar de contrapartidas de emprego ou devolução.
- dinheiro-publico / c → 55 (p57, p92, p83). Propõe revisar despesa por despesa e contrato por contrato e não admitir desperdício, sem propor corte de cargos ou enxugamento da estrutura.

## Nulls mantidos (conferidos contra as propostas novas)

- barca-leste/b (novas linhas de barca): o transporte lagunar (p116) é na Região dos Lagos, não na Baía de Guanabara.
- escola-bagunca/a (cívico-militar) e escola-bagunca/c (reforço no contraturno): o modelo do Ceará (p106) não detalha ações.
- celular-roubado/c e roubo-carro/c (receptação): a asfixia financeira (p27, p87) é contra facções, não contra a receptação.
- rua-alagada/b e gêmeas (limpeza de canais): os canais extravasores só aparecem em paráfrase.
- servidor-recomposicao/c (Rioprevidência e Banco Master) e licenca-empresa/b (licenciamento regional): nenhuma fala.

## Riscos

- **Peso de falas isoladas.** licenca-empresa/c cai 40 pontos por uma única frase regional (p115, Agenda do Poder 19/08, dita à Prolagos e à ViaLagos). A regra de contradição obriga a faixa 40-59, mas a frase pode ser lida como recado a concessionárias, e não como posição sobre regulação em geral.
- **Uso da força.** As notas de operacao-policial/b e d dependem de p123 (BBC, maio, antes da campanha) e p32 (entrevista de agosto), contra p31 (sabatina de setembro). Se a sabatina for tratada como posição mais recente e prevalente, b voltaria a ficar perto de 90.
- **Empresa pública.** trem-parado a/b/d e barca-leste/d se apoiam em p109, p111 e p114 (reportagens de 09/09 e entrevista de 24/09), todas condicionais ("se for necessário", "não descarto"). Em barca-leste/d a fala trata de transporte público em geral, sem citar barcas.
- **servidor-recomposicao/a (null → 50).** A única evidência (p96) é retrospectiva, e o dossiê registra dados do Sepe que a contestam. A nota mede a direção da fala, não a veracidade dela.
- **dinheiro-publico/c (null → 55).** Revisar despesas não é o mesmo que cortar cargos. O teto de 5% de comissionados, que seria a evidência direta, só existe em paráfrase.
- **passagem-cara/d (+15).** A evidência principal (p108) é uma reportagem do O Globo com fala condicional e sem valor. O Globo de 13/09 parafraseia subsídio à concessionária, o que não entra na nota.
- **Resumos corrigidos no dossiê** (p32, p35, p37, p38, p39, p58, p63, p65, p66, p73): só p39 ("trabalhar para que" agressores usem tornozeleira) mudou uma justificativa (medida-protetiva/a). A nota ficou em 90.
- **Mescla.** O `--padrao` padrão de `mesclar_rascunhos.py` é `aderencia-*.json`. Para publicar, rode com `--padrao reavaliacao-governador-eduardo-paes.json`. Isso não foi executado aqui.
