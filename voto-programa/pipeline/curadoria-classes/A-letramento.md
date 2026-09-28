# A. Letramento e classe: textos do quiz (27/09/2026)

Esta é a segunda passada de linguagem simples nos textos que o eleitor lê: cena, pergunta e
opções de `src/data/quiz.json` (governador RJ, 26 cenas) e `src/data/quiz-presidente.json`
(presidente, 22 cenas). A primeira passada (`pipeline/ux/A-linguagem.md`, já aplicada) cuidou
de tamanho, siglas e jargão. Esta cuida do que ainda atrapalha o **leitor de nível Inaf
"elementar"**, do **viés de classe** e do **equilíbrio entre as quatro opções**.
**Nada foi alterado em `src/`.**

- Propostas: `pipeline/curadoria-classes/textos-letramento.json` (mesmo formato de
  `pipeline/ux/textos-propostos.json`; dá para aplicar com `pipeline/ux/aplicar_textos.py`,
  trocando o caminho do arquivo).
- Perfil e prioridades: `pipeline/curadoria-classes/perfil-letramento.md`.
- Conferência: `pipeline/curadoria-classes/validar_letramento.py`.

## Resultado em números

| | Governador | Presidente | Total |
|---|---|---|---|
| Trocas no JSON | 24 | 22 | **46** |
| · cena | 3 | 3 | 6 |
| · pergunta | 3 | 1 | 4 |
| · opção | 18 | 18 | 36 |
| Reescritas diferentes (opções repetidas nas cenas-variante contam uma vez) | 20 | 15 | 35 |
| Cenas com algum texto alterado | 18 de 26 | 15 de 22 | 33 de 48 |

Trocas por tipo de problema (cada troca tem um tipo principal):

| Tipo | Trocas | Reescritas | Exemplo |
|---|---|---|---|
| Equilíbrio (argumento de venda, adjetivo de valor ou pergunta que favorece algumas opções; tamanho muito diferente) | 13 | 10 | "moradia digna" → "casa popular"; "que tá pesando no bolso" sai |
| Palavra abstrata ou nominalização | 10 | 6 | "o órgão" → "o governo"; "padrão nacional" → "regras iguais no país todo" |
| Ambiguidade (lido de dois jeitos) | 8 | 4 | "organizada por gravidade" (gravidez?) → "com quem está mais grave na frente" |
| Vocabulário difícil ou técnico | 8 | 8 | "estatal" → "empresa do governo"; "complexos" → "mais complicados" |
| Termo sem explicação | 3 | 3 | "medida protetiva" ganha "a Justiça mandou o ex ficar longe" |
| Estrutura (ponto e vírgula, sujeito escondido) | 2 | 2 | "…emprego; se não criar, devolve" → duas frases |
| Expressão idiomática | 1 | 1 | "a fila dobra a estação" → "a fila vai até a rua" |
| Palavra regional num quiz nacional | 1 | 1 | "sinal" → "semáforo" |

Validação, feita em 27/09 com os JSON atuais:

```
python3 pipeline/ux/checar_legibilidade.py --propostas pipeline/curadoria-classes/textos-letramento.json --avisos
  46 propostas conferidas/aplicadas em memória (nenhum arquivo alterado).
  Avisos de sigla/jargão (6): BRT, Cedae (2), MEI, INSS, fracking   ← os mesmos 6 de antes, todos explicados ou de uso comum
  0 violações.
python3 pipeline/curadoria-classes/validar_letramento.py
  46 propostas conferidas. OK
```

`validar_letramento.py` confere quatro coisas: todo `antes` é idêntico ao texto atual; o
campo é só `cena`, `pergunta` ou `opcao:<id>`; nenhuma troca mira as 4 opções protegidas
(escala-6x1/b, trabalho-app/b, operacao-policial/b, via-expressa-fechada/b); e o `depois` não
tem `palavras_depois` errado, nome ou sobrenome de candidato, nem sigla de partido.
`id`, `preferencia`, `grupo`, `publico` e `fato` não aparecem no arquivo.

Folga de caracteres: depois das trocas, 14 cenas ficam a 10 caracteres ou menos do limite de
260 nas opções. São elas: saude-interior, celular-roubado e celular-sinal (259),
gasto-governo (258), custo-contratar e as 4 de clima (257), primo-desempregado (255),
video-falso (253), escola-bagunca (252) e falta-tecnico (251). Cena + pergunta:
operacao-policial fica com 168 de 170; vale-transporte (170) e garagem-alagada (167) não
mudaram. Qualquer troca futura nessas cenas precisa recontar.

## Método

1. Li a revisão anterior (`pipeline/ux/A-linguagem.md`) e a curadoria
   (`pipeline/curadoria-cenas.md`) para não desfazer decisões. Continuam valendo: "escola
   cívico-militar", "fim da escala 6x1" e "poupança mensal" (o nome é a própria política);
   tirar bordão e detalhe que só um candidato usa; "de graça" no lugar de "tarifa zero";
   cenas contadas por terceiros nos temas sensíveis; e as 4 opções protegidas.
2. Li cada texto ao lado da `preferencia` e fiz o teste duplo. Uma diarista de 50 anos que
   estudou até a 5ª série entende de primeira, sem voltar na frase? Um executivo lê sem achar
   infantil? O diagnóstico olhou: palavra fora do vocabulário do dia a dia; palavra com dois
   sentidos para quem lê devagar ("gravidade", "dobrar", "complexo", "órgão", "empresas");
   sujeito escondido ou abstrato ("o Estado assume", "Teto:"); pontuação difícil (ponto e
   vírgula, dois-pontos que funciona como rótulo); e palavra que marca classe ou região.
3. **Equilíbrio**: comparei as quatro opções de cada cena. Procurei:
   - adjetivo ou argumento que só uma opção tem ("digna", "que tá pesando no bolso", "pra
     sair com profissão");
   - tamanho muito diferente (uma opção com 6 palavras ao lado de três com 10);
   - **pergunta que só combina com parte das opções**. Por exemplo, "O que tiraria mais carro
     da rua?" não combina com a opção "novas pistas"; "O que você queria ver na sua rua?" não
     combina com "investigar quem compra celular roubado".
4. Só troquei quando o ganho era real. Texto que já passava no teste ficou como está: das 48
   cenas, 15 não mudaram nada.
5. **Sentido**: cada `depois` diz a mesma direção e o mesmo alcance da `preferencia`. Quando a
   troca aproximou o texto da preferência (por exemplo, "incentivo pra empresa contratar", que
   está na preferência de primo-desempregado/a), o motivo diz isso. Não acrescentei meio,
   público nem condição que a preferência não tenha.
6. Validei com os dois scripts acima e recontei os caracteres de cada cena depois de cada
   troca. Quatro propostas passaram do limite de 260 e foram encurtadas.

## Glossário (usado de forma igual em todas as trocas)

Vale junto com o glossário da revisão anterior (concessão → "empresas privadas cuidarem",
subsídio → "dinheiro do estado", contraturno → "outro turno", drenagem → "escoar a água" etc.).

| Evite | Use | Por quê |
|---|---|---|
| o Estado (sujeito abstrato: "o Estado assume/retoma") | começar pelo verbo e dizer para onde vai: "passar … pro governo" | quem lê devagar não sabe quem é "o Estado"; nas outras opções o sujeito é quem responde |
| estatal / estatais | empresa(s) do governo; "manter com o governo" | "estatal" é substantivo técnico |
| órgão (sozinho) | o nome concreto ("secretaria") ou "o governo" | abstrato; "órgão" também é parte do corpo |
| complexo(s) | mais complicado(s) | técnico; no Rio, "complexo" lembra conjunto de favelas |
| organizada por gravidade | com quem está mais grave na frente | "gravidade" se confunde com "gravidez" |
| dobrar a Polícia X | dobrar o número de policiais … | "dobrar" também quer dizer vergar; não diz o que dobra |
| padrão nacional | regras iguais no país todo | abstrato |
| tempo integral; rede pública | o dia inteiro; todas as escolas públicas | termos de gestão; o governador já usa "o dia inteiro" |
| extração de gás de xisto | tirar gás de dentro da rocha (e o nome "fracking") | "extração" e "xisto" são técnicos |
| conter (mentira) | barrar | verbo pouco usado na fala |
| checar o app | ver no celular | anglicismo; "o app" não diz qual |
| a máquina (pública) | o próprio governo | jargão de gestão |
| sinal (de trânsito), em quiz nacional | semáforo | regional: em SP é "farol", no Sul é "sinaleira" |
| moradia digna / habitação de interesse social | casa popular | "digna" é adjetivo de valor; "casa popular" é o nome do dia a dia da política |
| regras estáveis; mudar o jogo | regras que não mudam toda hora | abstrato e metáfora |
| Teto: (rótulo solto) | pôr teto no gasto: … | rótulo com dois-pontos não é frase |
| rever pontos (de uma lei) | mudar partes | "pontos" é figurado; "alterar" é o que a preferência diz |
| ponto e vírgula dentro da opção | vírgula com sujeito explícito, ou duas frases curtas | quem lê devagar perde a segunda parte |
| termo jurídico na cena ("medida protetiva") | o termo + explicação de meia frase ("a Justiça mandou o ex ficar longe") | explica sem tirar o termo, que aparece nas opções, e sem infantilizar |
| "das empresas", quando pode ser o patrão | "das empresas de ônibus" | na cena do vale-transporte, "empresa" é também quem paga o vale |

Palavras de uso comum que **ficam**, porque trocar deixaria o texto infantil ou impreciso:
SUS, INSS, MEI, IPVA, PM, UPA, inflação, burocracia, reforma trabalhista, supersalário,
privatizar, mutirão, desmanche, orla, bico, cívico-militar.

## Tabela das 35 reescritas (a lista completa, cena a cena, está no JSON)

### Governador RJ

| Cena(s) | Campo | Antes | Depois | Pal. | Motivo |
|---|---|---|---|---|---|
| barca-leste | cena | 7h em Niterói. A barca atrasou de novo, a fila dobra a estação e a Ponte está parada. | 7h em Niterói. A barca atrasou de novo, a fila vai até a rua e a Ponte está parada. | 19 | expressão idiomática: 'a fila dobra a estação' pode ser lida como 'a estação dobrou de tamanho'; 'vai até a rua' diz o mesmo de forma literal |
| barca-leste | opcao:d | O Estado assume a barca e baixa a passagem. | Passar a barca pro governo e baixar a passagem. | 9 | 'O Estado assume' é sujeito abstrato; começa por verbo, como as outras três opções da cena; mesma preferência (estatizar, com passagem mais barata) |
| transito-carro | pergunta | O que tiraria mais carro da rua? | O que faria o trânsito andar melhor? | 7 | equilíbrio: 'tirar carro da rua' só combina com a, b e d; a opção c (novas pistas) não tira carro, melhora o fluxo. A nova pergunta serve às quatro |
| passagem-cara, vale-transporte | opcao:c | Tirar o cartão de passagem das empresas e mostrar o custo real. | Tirar o cartão das empresas de ônibus e mostrar o custo real. | 12 | ambiguidade: 'das empresas' sozinho pode ser lido como a empresa onde a pessoa trabalha (que paga o vale-transporte, justamente a cena vale-transporte); a preferência fala das empresas de ônibus |
| saude-interior | opcao:b | Centro de câncer e de exames complexos em cada região. | Centro de câncer e de exames mais complicados em cada região. | 11 | 'complexos' é palavra técnica e, no Rio, lembra 'complexo' de favelas; 'mais complicados' diz alta complexidade em palavra do dia a dia |
| escola-bagunca | opcao:d | Curso técnico já no ensino médio. | Levar curso técnico pra dentro da escola, no ensino médio. | 10 | equilíbrio de tamanho (6 palavras contra 8 a 11 das outras); começa por verbo e fica mais perto da preferência ('levar ensino técnico para o ensino médio estadual') |
| falta-tecnico | pergunta | O que a escola estadual devia fazer primeiro? | O que o estado devia fazer primeiro? | 7 | equilíbrio: a opção c (programa de primeiro emprego) não é coisa da escola; perguntar só da escola deixava c fora da pergunta |
| falta-tecnico | opcao:c | Programa de primeiro emprego com incentivo pra contratar jovem. | Primeiro emprego, com incentivo pra empresa contratar jovem. | 8 | ambiguidade: 'incentivo pra contratar jovem' não diz quem recebe o incentivo; a preferência é incentivo à contratação (para a empresa). 'Programa de' saiu para caber no limite de 260 caracteres da cena; 'Primeiro emprego, com incentivo…' continua lido como programa |
| operacao-policial | cena | Deu no grupo do bairro: operação policial. Escola fechada, ônibus parado, e todo mundo checando o app antes de sair. | Deu no grupo do bairro: operação policial. Escola fechada, ônibus parado, e todo mundo vendo no celular se dá pra sair. | 21 | 'checando o app' mistura anglicismo e 'app' sem dizer qual; 'vendo no celular se dá pra sair' diz o que a pessoa faz |
| celular-roubado | pergunta | O que você queria ver na sua rua? | O que funcionaria melhor? | 4 | equilíbrio: 'o que você queria ver na sua rua' favorece o que se vê (guarda, PM, câmera) e deixa de fora a opção c (investigação, que não aparece na rua); mesma pergunta da cena do presidente |
| celular-roubado | opcao:c | Ir atrás de quem compra celular roubado. | Investigar sem parar quem compra celular roubado. | 7 | equilíbrio: com a pergunta nova ('o que funcionaria melhor?'), 'ir atrás de' soava informal perto das outras; 'investigar sem parar' diz a investigação permanente da preferência |
| medida-protetiva | cena | Sua vizinha tem medida protetiva, mas o ex continua rondando a casa dela. | Sua vizinha tem medida protetiva: a Justiça mandou o ex ficar longe. Mas ele continua rondando a casa dela. | 19 | termo jurídico sem explicação ('medida protetiva'); a explicação curta ajuda quem não conhece e não infantiliza quem conhece; o termo continua porque aparece nas opções |
| rua-alagada, encosta-serra, garagem-alagada | opcao:d | Tirar as famílias da área de risco, com moradia digna perto dali. | Levar as famílias da área de risco pra casa popular perto dali. | 12 | equilíbrio: 'digna' é adjetivo de valor que só esta opção tinha; 'casa popular' é o nome do dia a dia de 'habitação de interesse social' (a preferência), mais preciso que 'moradia'; 'Tirar' soa como remoção à força |
| falta-agua, caminhao-pipa | opcao:a | Rever o aumento da conta, que tá pesando no bolso. | Rever os aumentos da conta de água e esgoto. | 9 | equilíbrio: 'que tá pesando no bolso' é argumento emocional que só esta opção tinha; a preferência é revisar os aumentos de tarifa (sem dizer quem os deu: quem autoriza é a agência reguladora, não só a empresa) |
| primo-desempregado | opcao:a | Programa de primeiro emprego com curso técnico. | Primeiro emprego, com curso técnico e incentivo pra empresa contratar. | 10 | equilíbrio de tamanho (7 palavras contra 10 a 12) e mais perto da preferência, que inclui 'incentivo à contratação'. Mesmo início da opção c de falta-tecnico; 'Programa de' saiu para caber no limite de 260 caracteres |
| primo-desempregado | opcao:c | Deixar o emprego com as empresas; o estado investe em segurança. | Criar emprego fica com as empresas, e o estado investe em segurança. | 12 | ponto e vírgula e 'deixar o emprego com as empresas' (pode ser lido como 'deixar o seu emprego'); diz quem faz o quê |
| licenca-empresa | opcao:c | Regras estáveis e menos burocracia, sem mudar o jogo toda hora. | Menos burocracia e regras que não mudam toda hora. | 9 | 'estáveis' é abstrato e 'mudar o jogo' é metáfora; 'regras que não mudam toda hora' diz previsibilidade em palavras concretas |
| licenca-empresa | opcao:d | Desconto de imposto só pra quem cria emprego; se não criar, devolve. | Desconto de imposto só pra quem criar emprego. Se não criar, devolve. | 12 | ponto e vírgula dificulta a leitura; duas frases curtas |
| dinheiro-publico | opcao:a | Teto: o gasto do governo só cresce se o que entra crescer. | Pôr teto no gasto: só cresce se o dinheiro que entra crescer. | 12 | 'Teto:' solto é rótulo de jargão; começa por verbo e diz 'o dinheiro que entra' em vez de 'o que entra' |
| dinheiro-publico | opcao:b | Conferir todo contrato e criar órgão pra vigiar quem ganha cargo. | Conferir todo contrato e criar secretaria pra vigiar quem ganha cargo. | 11 | 'órgão' é palavra abstrata (e ambígua); 'secretaria' é concreta e é o que a preferência diz (secretaria de integridade) |

### Presidente

| Cena(s) | Campo | Antes | Depois | Pal. | Motivo |
|---|---|---|---|---|---|
| escala-6x1 | pergunta | O que você queria pra sua jornada? | O que você mudaria nas regras do trabalho? | 8 | equilíbrio: 'pra sua jornada' favorece a e b (jornada) e deixa c e d (reforma trabalhista, imposto na carteira) deslocadas; a nova pergunta serve às quatro. A opção b (protegida) continua igual |
| escala-6x1 | opcao:c | Rever pontos da reforma trabalhista e da terceirização. | Mudar partes da reforma trabalhista e da lei da terceirização. | 10 | 'Rever pontos' é vago ('pontos' é figurado); 'mudar partes' é concreto e mais perto da preferência ('alterar pontos da legislação') |
| fila-cirurgia, especialista-longe, plano-voltou-sus | opcao:b | Fila única pela internet, organizada por gravidade. | Fila única pela internet, com quem está mais grave na frente. | 11 | 'organizada por gravidade': quem lê devagar confunde 'gravidade' com 'gravidez'; diz o critério (risco clínico) em palavras do dia a dia |
| celular-roubado, celular-sinal | opcao:c | Câmera no uniforme do policial, com padrão nacional. | Câmera no uniforme do policial, com regras iguais no país todo. | 11 | 'padrão nacional' é abstrato; 'regras iguais no país todo' diz o mesmo |
| celular-roubado, celular-sinal | opcao:d | Dobrar a Polícia Federal e a Rodoviária Federal. | Dobrar o número de policiais federais e rodoviários federais. | 9 | 'Dobrar a Polícia Federal' é ambíguo (dobrar = vergar) e não diz o quê; a preferência fala do efetivo |
| celular-sinal | cena | Parado no sinal, com o vidro aberto, levaram o celular da sua mão. Alguém da sua família já tinha passado pela mesma coisa. | Parado no semáforo, com o vidro aberto, levaram o celular da sua mão. Alguém da sua família já tinha passado pela mesma coisa. | 23 | 'sinal' é palavra regional (Rio e Nordeste); em SP é 'farol', no Sul 'sinaleira'. Quiz nacional: 'semáforo' todo mundo entende |
| largar-escola | opcao:b | Curso técnico no ensino médio, pra sair com profissão. | Mais curso técnico dentro do ensino médio. | 7 | equilíbrio: 'pra sair com profissão' é argumento de venda que só esta opção tinha (a mesma regra já tirou 'que já leva pro emprego' em pagar-faculdade) |
| largar-escola | opcao:d | Escola em tempo integral em toda a rede pública. | Aula o dia inteiro em todas as escolas públicas. | 9 | 'tempo integral' e 'rede pública' são termos de gestão; mesmo glossário das opções do governador ('o dia inteiro') |
| conta-luz | opcao:c | Liberar a extração de gás de xisto, o chamado fracking. | Liberar o fracking, que tira gás de dentro da rocha. | 10 | 'extração' e 'xisto' são palavras técnicas; o termo 'fracking' fica (é o nome da política) e ganha explicação neutra |
| enchente-seca, enchente-sul, fumaca-queimada, seca-nordeste | opcao:c | Licença ambiental com prazo: se o órgão não decidir, a licença sai. | Licença ambiental com prazo: se o governo atrasar, ela sai sozinha. | 11 | 'o órgão' é abstrato (qual órgão?); 'se o governo atrasar, ela sai sozinha' diz a concessão automática no prazo |
| video-falso | opcao:a | Criar regras pras redes sociais conterem mentira e discurso de ódio. | Criar regras pras redes sociais barrarem mentira e discurso de ódio. | 11 | 'conterem' é verbo pouco usado no dia a dia; 'barrarem' diz o mesmo |
| gasto-governo | cena | O governo diz que falta dinheiro pra saúde e escola, e a conta da própria máquina não para de crescer. | O governo diz que falta dinheiro pra saúde e escola, e o gasto do próprio governo não para de crescer. | 20 | jargão: 'a conta da própria máquina' (máquina pública); diz de quem é o gasto |
| gasto-governo | opcao:c | Privatizar estatal onde o governo não precisa estar. | Privatizar empresas que o governo não precisa ter. | 8 | 'estatal' é substantivo técnico; 'empresas que o governo não precisa ter' é concreto e mantém o 'caso a caso' |
| gasto-governo | opcao:d | Manter e recuperar estatais como Correios e Petrobras. | Manter com o governo e recuperar empresas como Correios e Petrobras. | 11 | 'estatais' é técnico; 'manter com o governo' diz o controle estatal da preferência |
| agressor-rondando | cena | Sua vizinha tem medida protetiva, mas o ex continua rondando a casa dela. | Sua vizinha tem medida protetiva: a Justiça mandou o ex ficar longe. Mas ele continua rondando a casa dela. | 19 | termo jurídico sem explicação ('medida protetiva'); a explicação curta ajuda quem não conhece e não infantiliza quem conhece; o termo continua porque aparece na opção d |

## Cenas padrão que não servem a todas as classes (para o agente de adaptação)

Quem pula o perfil vê a variante padrão (sem `publico`). Aqui só aponto o problema; o conteúdo
não foi mexido.

| Eleição / cena padrão | O que exclui | Quem cai nela sem se ver | Sugestão de caminho |
|---|---|---|---|
| presidente / **largar-escola** | "Seu filho está no ensino médio público" supõe um filho adolescente na escola pública | quem pula o perfil e não tem filho, ou tem filho pequeno ou em escola particular (a variante `pagar-faculdade` só aparece para quem respondeu "particular" ou "nenhuma") | contar por terceiro, como o governador já faz ("Seu sobrinho…", "Um adolescente da sua família…") |
| presidente / **salario-minimo** | "Você, ou alguém da sua casa, vive com um salário mínimo" | quem pula o perfil e tem renda média ou alta. A variante `imposto-renda` exige a faixa estimada, que não existe com menos de 3 respostas | terceiro próximo ("Muita gente na sua família ou no seu trabalho vive com um salário mínimo") |
| governador / **rua-alagada** | "Na última vez, você perdeu a geladeira" supõe casa térrea em rua que alaga | faixa "misto" em apartamento ou em bairro que não alaga (a variante `garagem-alagada` é só para "privado") | tirar a perda pessoal ou passar para um vizinho |
| governador / **operacao-policial** | "Deu no grupo do bairro" supõe um bairro que tem operação policial | quem pula o perfil e mora em bairro sem operação (a variante `via-expressa-fechada` é só para carro ou aplicativo) | "Deu no grupo: operação policial no caminho do trabalho…" |
| governador / **passagem-cara** | "De Nova Iguaçu pro Centro… todo dia" supõe quem pega ônibus todo dia | interior e Leste Fluminense (limite já conhecido); quem anda de moto ou a pé | já anotado em `curadoria-cenas.md`; falta variante regional |
| governador / **trem-parado** | cena de quem usa o ramal de Japeri | quem anda de ônibus, moto ou a pé na capital ou na Baixada | aceitável: a situação dá para imaginar e não está em "você" |

Marcas de classe **nas variantes** (menos grave, porque a variante já é para um perfil):

- `vale-transporte`: "Quem trabalha com você, ou na sua casa" supõe que a pessoa emprega
  alguém em casa. O "ou" deixa a frase servir para os dois casos.
- `caminhao-pipa`: "cota extra veio no boleto" é linguagem de condomínio. Serve para o
  público da variante.

Descompassos de conteúdo que apareceram na leitura (não são de linguagem):

- `fila-especialista`/c e `plano-voltou-sus`/c: a cena fala de **consulta** e a opção fala
  de **cirurgia**.
- `pagar-faculdade`/c: a cena fala de **faculdade** e a opção fala de **escola** particular
  (a preferência é voucher para escola).

## Opções que não consegui simplificar sem mudar o sentido

| Eleição / cena / opção | Texto | Por que ficou |
|---|---|---|
| as 4 protegidas | escala-6x1/b, trabalho-app/b, operacao-policial/b, via-expressa-fechada/b | decisão do produto; não foram tocadas |
| governador / trem-parado / c | Trem novo, no horário e com segurança própria a bordo. | "no horário" parece ser a tradução de "padrão BRT" na curadoria. Tirar seria mudar o sentido, deixar é manter um resultado prometido que as outras opções não têm. "Segurança própria a bordo" pode ser lida como "a sua própria segurança". Precisa de decisão do produto |
| presidente / 4 cenas de clima / b | Obras contra enchente e seca, como barragens, diques e reservatórios. | "diques" é palavra rara, mas é exemplo da própria preferência. Trocar a lista muda o exemplo |
| presidente / imposto-renda / a | Continuar sem imposto até R$ 5 mil, com tabela corrigida todo ano. | "tabela" é o termo do IR e quem declara (o público da variante) conhece. "Valor corrigido" perde precisão |
| presidente / trabalho-app / c | Contribuir pro INSS de um jeito mais flexível, quando der. | "flexível" não tem paráfrase curta que não acrescente condição (por exemplo, "sem valor fixo") |
| presidente / custo-contratar / b | …pra desempregado acima de 50. | faltaria "anos", mas com a palavra passa de 12 |
| presidente / conta-luz / b | Baixar as taxas extras da conta de luz e imposto de energia. | a preferência inclui imposto sobre **combustível**. Com a palavra, passa de 12 palavras ou fica ambíguo ("taxas extras" do combustível) |
| presidente / conta-luz / a | Petrobras voltar a vender combustível aos postos e refinar mais. | "refinar" é um pouco técnico, mas sem alternativa curta e fiel |
| governador / operacao-policial e via-expressa-fechada / c | …o governo chegou com serviço público depois. | dar exemplos (posto, escola) acrescentaria conteúdo |
| presidente / fila-sus (3 cenas) / b | (nova) Fila única pela internet… | a preferência inclui "com uso de inteligência artificial", que já estava fora. Não acrescentei |
| governador / primo-desempregado / b | Trazer estaleiro e fábrica de volta… | "estaleiro" é concreto e conhecido no RJ; "fábrica de navio" ficaria mais longo |
| governador / celular-roubado e correria-praia / d | Câmera inteligente… | é o nome técnico ("câmera inteligente"), não adjetivo de valor |

## Riscos de mudança de sentido

Ordenados do maior para o menor. Nenhum muda a `preferencia`, então as notas continuam
válidas. O risco é a opção passar a ser **lida** de outro jeito.

1. **Quatro perguntas reescritas** (transito-carro, falta-tecnico, celular-roubado do
   governador, escala-6x1). Elas mudam o enquadramento para servir às quatro opções. É a
   troca de maior efeito: a distribuição das respostas pode mudar (por exemplo, "novas pistas"
   deve ser mais escolhida quando a pergunta é "O que faria o trânsito andar melhor?"). É
   ajuste de equilíbrio, e não de vocabulário: precisa do aval do dono do produto.
2. **rua-alagada/d** ("Levar as famílias… pra casa popular perto dali"). "Levar" é mais suave
   que "Tirar". Ficou mais fiel à preferência (reassentar em habitação de interesse social),
   mas pode ficar mais atraente do que era.
3. **enchente-seca e variantes / c** ("se o governo atrasar, ela sai sozinha"). É fiel à
   concessão automática no prazo, e "sai sozinha" deixa o mecanismo mais claro. Pode deixar a
   opção menos atraente, porque "sozinha" pode soar como "sem análise", que é o que ela é.
4. **primo-desempregado/a** ganhou "incentivo pra empresa contratar", que está na preferência
   e faltava no texto. A opção fica mais completa e mais longa (70 caracteres, a maior da
   cena).
5. **Exemplos de explicação** ("medida protetiva: a Justiça mandou o ex ficar longe"; "fracking,
   que tira gás de dentro da rocha"). São fiéis, mas medida protetiva tem outros tipos além do
   afastamento. No contexto da cena ("o ex continua rondando"), o afastamento é o tipo certo.
6. **gasto-governo/c** ("Privatizar empresas que o governo não precisa ter"). O "caso a caso"
   da preferência fica implícito, como já estava em "onde o governo não precisa estar".
7. **falta-tecnico/c e primo-desempregado/a** perderam "Programa de" para caber em 260
   caracteres. "Primeiro emprego, com incentivo…" continua sendo lido como política.

Recomendação: antes de aplicar, rodar o pré-teste cognitivo sugerido em
`pipeline/curadoria-cenas.md` (5 a 8 pessoas por faixa, lendo em voz alta), pelo menos nas 4
perguntas e nas 10 opções de equilíbrio.
