# Perfil e prioridades: propostas de texto (27/09/2026)

Revisão de linguagem das telas "Sobre você" (`src/telas/PerfilPasso.tsx`), "Prioridades"
(`src/telas/Prioridades.tsx`) e dos rótulos que elas leem dos JSON (`regioes` e `temas`).
**Nada foi alterado no código.** Os `valor` e a pontuação de `src/lib/perfil.ts` não mudam:
só muda o texto que aparece na tela.

Teste usado em cada rótulo: uma diarista de 50 anos que estudou até a 5ª série entende de
primeira e escolhe a opção certa para ela? Um executivo lê sem achar infantil? Nenhuma opção
soa como "coisa de rico" ou "coisa de pobre"?

## Sobre você (`src/telas/PerfilPasso.tsx`)

| Arquivo:linha | Antes | Depois | Motivo |
|---|---|---|---|
| PerfilPasso.tsx:15 | Plano pago pela empresa | Plano de saúde pago pela empresa | "Plano" sozinho também é plano de celular. Custa 2 palavras e deixa a opção paralela à seguinte. Opcional. |
| PerfilPasso.tsx:16 | Plano pago pela família ou particular | Plano pago pela família, ou consulta particular | **Ambíguo.** "Ou particular" parece qualificar o plano ("plano particular"), e quem paga a consulta direto ao médico, sem plano, não se acha na lista. O valor continua `plano_proprio`, com os mesmos pontos. |
| PerfilPasso.tsx:24 | Não tem criança em idade escolar | Não tem criança ou adolescente na escola | "Idade escolar" é termo de formulário. O título fala de "crianças ou adolescentes" e a opção só de "criança". O valor continua `nenhuma`, que não conta ponto. |
| PerfilPasso.tsx:28 | No dia a dia, você anda mais de… | No dia a dia, como você mais vai de um lugar pro outro? | A frase incompleta não combina com todas as respostas: "anda mais de… a pé" e "anda mais de… trabalho em casa" não fazem sentido. Uma pergunta inteira serve às cinco. Mantive o registro oral; a revisão anterior tirou "se desloca" e eu não volto com ele. |
| PerfilPasso.tsx:33 | Aplicativo ou táxi | Corrida de aplicativo ou táxi | "Aplicativo" sozinho confunde quem **trabalha** com aplicativo com quem **usa** aplicativo (o trabalho já aparece em "Por conta própria, MEI ou aplicativo"). "Corrida" vale para carro e para moto por aplicativo, que é muito usada nas faixas de renda mais baixa. Atenção: `pesquisa-perfis.md` §1.5 aceita de propósito que o motorista de aplicativo escolha "aplicativo" ou "carro"; com "Corrida de…", ele tende a escolher "Carro próprio". O dono do produto decide. |
| PerfilPasso.tsx:34 | Trabalho em casa | Fico mais em casa | **Viés de classe e ambiguidade.** A diarista ou a empregada doméstica "trabalha em casa" (de família) e pode marcar esta opção por engano. "Trabalho em casa" também soa como home office, coisa de escritório. E aposentado ou quem cuida da casa não se vê nela. O valor continua `casa` (não conta ponto). |
| PerfilPasso.tsx:41 | Servidor(a) público(a) | Emprego público, concursado | O "(a)" atrapalha quem lê devagar, e o leitor de tela lê "servidor a público a". "Emprego público, concursado" tem o mesmo formato de "Carteira assinada" e é como a pessoa se descreve. |
| PerfilPasso.tsx:42 | Por conta própria, MEI ou aplicativo | Por conta própria, bico, MEI ou aplicativo | Quem vive de bico (é a palavra da cena `primo-desempregado`) nem sempre se chama de "por conta própria". Sem "bico", essa pessoa tende a marcar "Estudo, procuro trabalho…", que tem outra marca na hora de escolher as cenas (`trabalho-app` é só para `autonomo`). A pontuação é a mesma (0). |
| PerfilPasso.tsx:44 | Aposentado(a) | Já me aposentei | Tira o "(a)" sem escolher um gênero. Tem o mesmo tom de "Tenho empresa com funcionários". |
| PerfilPasso.tsx:49 | Quantos banheiros tem a sua casa? | (igual) | Fica igual. É a pergunta mais estranha para quem não sabe por que ela está ali: veja a próxima linha. |
| PerfilPasso.tsx:111 | Toque na resposta para seguir. Nada disso sai do seu celular. | No passo 0: "Serve pra mostrar situações parecidas com a sua vida. Pode pular. Nada disso sai do seu celular ou computador." Nos outros: "Toque na resposta pra seguir. Nada disso sai do seu celular ou computador." | **Nenhuma tela diz por que o app pergunta isso.** A tela `SobreVoce`, que explicava, não existe mais no fluxo novo: a Abertura leva direto ao passo 0. Sem explicação, a pergunta dos banheiros parece pergunta de renda. Isso deixa desconfiado quem tem pouco e também quem tem muito, e as duas faixas passam a pular mais. "Celular ou computador" repete o que o `App.tsx` já diz. |
| PerfilPasso.tsx:103, 130 | Pular / Pular tudo | (igual) | Claros. |

Impacto em teste: `e2e/apoio.ts:35-49` guarda os rótulos atuais (usados para clicar nas
opções). Quem aplicar as trocas precisa atualizar esse arquivo junto.

### Região (lida do JSON pela mesma tela)

| Arquivo:linha | Antes | Depois | Motivo |
|---|---|---|---|
| quiz-presidente.json:859 | Norte | Norte (Amazonas, Pará, Tocantins…) | Muita gente com pouca escolaridade não sabe em que **região** fica o seu estado (Tocantins, Maranhão, Goiás, Minas…), e a região decide a cena de clima e de saúde que a pessoa vê. Dar exemplos de estados resolve sem infantilizar. |
| quiz-presidente.json:863 | Nordeste | Nordeste (Bahia, Pernambuco, Ceará, Maranhão…) | Idem. O Maranhão é o estado que mais se confunde. |
| quiz-presidente.json:867 | Centro-Oeste | Centro-Oeste (Goiás, Mato Grosso, Mato Grosso do Sul, DF) | Idem. |
| quiz-presidente.json:871 | Sudeste | Sudeste (São Paulo, Rio, Minas, Espírito Santo) | Idem. |
| quiz-presidente.json:875 | Sul | Sul (Paraná, Santa Catarina, Rio Grande do Sul) | Idem. |
| quiz.json:1012-1032 | Onde você mora? / Cidade do Rio / Baixada Fluminense / Niterói, São Gonçalo, Maricá ou Itaboraí / Interior do estado / Não moro no estado do Rio | (igual) | Claros e concretos. |

Se os exemplos ficarem longos demais para o botão, uma alternativa é um subtítulo só nesta
pergunta: "Na dúvida, veja no mapa: o seu estado está em qual parte?". Mas a lista de estados
funciona melhor para quem lê devagar.

## Prioridades (`src/telas/Prioridades.tsx`)

| Arquivo:linha | Antes | Depois | Motivo |
|---|---|---|---|
| Prioridades.tsx:62 | O que mais pesa no seu dia? | Quais assuntos importam mais pra você? | "Pesa no seu dia" fala de sofrimento do dia a dia. Serve para "Transporte" e "Saúde", mas não para "Mulheres", "Internet" ou "Dinheiro público". E pesa de um jeito diferente conforme a classe: quem tem mais recurso "não sente o peso" e escolhe menos. O que a tela quer saber é o que importa mais, porque esses assuntos valem o dobro. |
| Prioridades.tsx:24 | Máximo de 3. Desmarque um para trocar. | Só dá pra marcar 3. Tire um pra marcar outro. | "Máximo" e "desmarque" são linguagem de formulário. |
| Prioridades.tsx:27 | Nenhum marcado: todos os temas valem igual. | Nenhum marcado: todos os assuntos valem igual. | O subtítulo (linha 64) diz "assuntos". Uma palavra só para a mesma coisa. |
| Prioridades.tsx:35-36 (e Quiz.tsx:47) | Prioridades | Mais importantes | "Prioridades" é palavra de gestão. É só o rótulo do topo e o título da aba, então o ganho é pequeno. Opcional. |
| Prioridades.tsx:64 | Marque até 3 assuntos. Eles valem o dobro no seu resultado. | (igual) | Claro. |

Para ficar coerente se a linha 62 mudar, fora do escopo pedido mas no mesmo fluxo:
`src/telas/Resumo.tsx:47` "O que mais pesa pra você:" → "O que mais importa pra você:";
`src/telas/Resumo.tsx:54` "…todos os temas valeram igual." → "…todos os assuntos valeram
igual."; `src/fluxo/cartao.ts:123` "O que mais pesa pra mim:" → "O que mais importa pra mim:"
(e "Todos os temas valem igual" → "Todos os assuntos valem igual").

### Nomes dos temas (JSON, aparecem nos botões da grade e no cartão)

| Arquivo:linha | Antes | Depois | Motivo |
|---|---|---|---|
| quiz.json:33 e quiz-presidente.json:45 | Mulheres | Violência contra a mulher | "Mulheres" é vago. Pode ser lido como "assunto só de mulher" ou como pauta de identidade, e o homem que se preocupa com a vizinha ameaçada não marca. As cenas são de medida protetiva, ou seja, violência. |
| quiz-presidente.json:37 | Internet | Redes sociais | A cena é de vídeo falso e de regras para as redes. "Internet" é lido como acesso ou preço da internet, que é preocupação maior de quem tem pouco: quem marcar por isso vai se frustrar. |
| quiz-presidente.json:41 | Governo e gastos | Gastos do governo | Um assunto só, e não dois. |
| (demais) | Segurança, Transporte, Saúde, Escola, Trabalho, Água e chuva, Dinheiro público, Dinheiro e impostos, Escola e faculdade, Luz e combustível, Clima e meio ambiente | (igual) | Concretos. |

Layout: a grade tem 2 colunas com letra de 15px (`src/index.css:427-437`). "Violência contra a
mulher" quebra em duas linhas dentro dos 52px de altura mínima, o que é aceitável. No cartão
de compartilhar (`cartao.ts`), a pílula fica mais longa e quebra de linha sozinha. Vale
conferir numa captura antes de aplicar.
