# C · Marca: três direções

Proposta de identidade para o site hoje chamado "Qual proposta combina com você?".
Nada aqui foi aplicado em `src/`. Arquivos em `pipeline/ux/marca/`:

| Arquivo | O que é |
|---|---|
| `marca/direcoes.html` | Página para o dono escolher: as 3 direções lado a lado, cena do trem de Japeri no celular, botão, voz, cores, claro e escuro. Abre direto no navegador. |
| `marca/<slug>/logo.svg` | Símbolo 64×64, testado a 32 e 16 px |
| `marca/<slug>/logo-horizontal.svg` (+ `-escuro.svg`) | Símbolo + nome, texto convertido em curvas (não depende de fonte instalada) |
| `marca/<slug>/tokens.css` | Tokens claro/escuro, fontes, escala, com a tabela de contraste calculada no cabeçalho |
| `marca/combina/og.svg` e `og.png` | Cartão de compartilhamento 1200×630 da direção recomendada. Use o PNG no `og:image`: WhatsApp, Facebook e X não aceitam SVG. |

Slugs: `so-a-proposta`, `combina`, `ponto-a-ponto`.

---

## 0. Plataforma (vale para as três)

- **O que é:** site gratuito e apartidário. A pessoa escolhe o que faria em situações do dia a dia (trem lotado, fila do SUS, conta de luz) sem ver nomes. No fim vê quais candidatos propõem o que ela escolheu, com a fala literal e a fonte.
- **Para quem:** todo eleitor do RJ (governador) e do país (presidente). O caso que decide o desenho é quem anda de ônibus, usa o SUS e tem um Android simples, com tela pequena, brilho baixo, 4G fraco e pouca leitura. A classe média também precisa se reconhecer.
- **Promessa:** ver quem propõe o que você escolheria, sem torcida e com a fonte.
- **Personalidade:** leve, próxima, curiosa e confiável. **Não é** propaganda, santinho, jogo que trata o voto como bobagem, órgão público, professor, militante nem cínico com a política.
- **Território visual:** coisas de todo dia (ponto, trem, conta, posto), fala destacada, papel, cor sem bandeira.
- **De quem se afastar:** material de campanha (cara grande, número de urna, verde-amarelo, vermelho, "vote"), sites do TSE e de governo (azul institucional, brasão, "oficial"), quizzes de rede social (confete, "deu match", ranking de vencedor).

**Premissas assumidas:** não há nome registrado nem marca anterior a preservar. O site continua 100% no celular e sem cadastro. Os dois cargos ficam sob a mesma marca.

### Regras de neutralidade usadas nas três

| Regra | Como foi checado |
|---|---|
| Nada de vermelho dominante (PT, PCdoB, PSTU, PCO, UP) | Nenhuma primária fica entre 345° e 15° de matiz. Vermelho só aparece como cor semântica de erro, em texto pequeno. |
| Nada de verde-e-amarelo como assinatura | Nenhuma direção junta verde e amarelo em logo, primária ou destaque. O verde fica só como "sucesso", em ícone pequeno, nunca ao lado do amarelo. |
| Nada de azul-tucano como principal (PSDB, e azul + amarelo em geral) | Nenhuma primária é azul-royal médio, e nenhuma direção junta azul com amarelo. |
| Laranja de partido (Novo, Solidariedade) | Nenhuma primária laranja. O âmbar da direção 3 é o do letreiro de ônibus e anda com grafite, não com branco. |
| Sem símbolo de partido, estrela, mão, número de urna, bandeira, brasão, balança ou venda nos olhos (Justiça) | Os símbolos são um balão de fala, dois balões e uma linha de trajeto. Nenhum número aparece em destaque. |
| Sem estética de santinho | Sem foto de rosto, sem número grande, sem "vote", sem faixa diagonal, sem fundo chapado com nome em caixa-alta. |
| Nome longe de partido, candidato, slogan ou órgão | Nomes conferidos contra as siglas de 2026 e contra as coligações em `src/data/candidatos*.ts`: "Juntos para Mudar, Coragem para Reconstruir", "Rio Real", "Brasil Pronto pra Mais". Nenhum usa "Brasil", "Rio", "Juntos", "Muda", "Novo", "Real", "Esperança", "Justiça" nem "oficial". |

**Aviso sobre a paleta atual (`src/index.css`):** `mar` #0F6E8C + `sol` #FFC93C + `folha` #2E8B57 juntos formam azul, amarelo e verde, as cores da bandeira. Separadas não pesam, mas uma tela de resultado que mostre as três lado a lado (por exemplo, atende/em parte/não atende) pode ser lida como verde-e-amarelo. As três direções abaixo resolvem isso.

**Não verificado:** domínio, redes sociais e INPI (fora do escopo). Também não conferi os slogans de todas as campanhas de 2026 nem a identidade visual do partido Missão. Faça uma busca rápida antes de fechar o nome.

---

## Direção 1 · Só a Proposta (confiança)

- **Nome:** Só a Proposta
- **Alternativas:** Quem Propõe? · Às Cegas
- **Tagline:** Primeiro a ideia. Depois o nome.
- **Conceito:** o site esconde o rosto e mostra a fala. Você julga a proposta pelo que ela diz, com o trecho marcado a marca-texto e a fonte do lado.

### Voz
- **Atributos:** direta, transparente, serena.
- **Faz:** mostra a fonte em toda afirmação, diz o que não sabe ("este candidato não falou sobre isso"), usa frase curta e verbo concreto.
- **Não faz:** não adjetiva candidato, não diz "o melhor para você", não ironiza a política, não fala como professor.

| Momento | Texto |
|---|---|
| Botão de começar | **Ver a primeira situação** |
| Depois de escolher | Anotado. Quem propõe isso fica em segredo até o fim. |
| Revelação | Agora, os nomes. Veja de quem é cada proposta que você escolheu, com a fonte. |

### Paleta (tokens em `marca/so-a-proposta/tokens.css`)
Principal **anil #3B34B0**, um azul puxado para o violeta, longe do azul-royal tucano. Destaque **pêssego marca-texto #FFB892**, fundo **#F5F5FA** (papel frio).

| Par | Claro | Escuro |
|---|---|---|
| Texto / fundo | #191A33 sobre #F5F5FA: **15,62:1** | #EFEFF7 sobre #11121F: **16,25:1** |
| Texto suave / fundo | #4F5270 sobre #F5F5FA: **6,97:1** | #A6A8C4 sobre #11121F: **7,98:1** |
| Texto / cartão | #191A33 sobre #FFFFFF: **16,98:1** | #EFEFF7 sobre #1B1C2E: **14,66:1** |
| Texto do botão / botão | #FFFFFF sobre #3B34B0: **9,11:1** | #11121F sobre #A9A5FF: **8,42:1** |
| Link / fundo | #3B34B0 sobre #F5F5FA: **8,39:1** | #A9A5FF sobre #11121F: **8,42:1** |
| Texto / marca-texto | #191A33 sobre #FFB892: **10,12:1** | #11121F sobre #FFB892: **11,08:1** |
| Destaque como texto / fundo | #9C3F14 sobre #F5F5FA: **6,16:1** | #FFB892 sobre #11121F: **11,08:1** |
| Texto / opção escolhida | #191A33 sobre #FFE6D8: **14,20:1** | #EFEFF7 sobre #3A2A2E: **11,84:1** |

Regra do escuro: o marca-texto cobre a palavra inteira e o texto fica escuro. Pela metade, a parte de cima das letras sumiria no fundo.

### Tipografia
- Títulos: **Fraunces** com SOFT 100 e WONK 0 (serifa arredondada, com cara de jornal sem ser dura). Pacote `@fontsource-variable/fraunces`.
- Texto: **Atkinson Hyperlegible Next**, feita para baixa visão, com letras que não se confundem (I/l/1, O/0). Pacote `@fontsource-variable/atkinson-hyperlegible-next`.
- Escala 12/14/16/18/20/24/32/40, pesos 400/700 no texto e 700 nos títulos.

### Ilustração e ícones
Traço de 2 px com cantos redondos, só na cor principal. Nada de ilustração de gente. O único floreio é o marca-texto pêssego sobre números e trechos citados.

### Logo
Balão de fala com uma linha branca e uma faixa pêssego: a fala com o trecho destacado. A 32 px se lê como balão com destaque. Na versão horizontal, "Proposta" vem sublinhada com marca-texto.

### Neutralidade
- Cor: anil + pêssego não é assinatura de nenhum partido. Não tem vermelho, verde-amarelo nem azul+amarelo.
- Símbolo: balão de fala, sem venda nos olhos (a venda lembraria a Justiça e o TSE).
- Nome: não lembra partido nem coligação.

### Riscos
- **Duplo sentido do nome:** "é só proposta" é também o que diz quem não acredita em promessa ("isso é só proposta, ninguém cumpre"). A tagline e o marca-texto na fonte ajudam, mas o risco fica.
- "Às Cegas" como alternativa lembra "votar às cegas" (o contrário do objetivo) e é uma metáfora que pessoas cegas podem achar capacitista.
- Serifa + anil é a opção mais séria e a mais fria para quem lê pouco. Pode parecer jornal ou governo.
- São 4 palavras curtas, fáceis de ler, mas menos fáceis de guardar do que uma palavra só.

---

## Direção 2 · Combina? (conversa), recomendada

- **Nome:** Combina?
- **Alternativas:** Combina Comigo? · Qual é a Boa?
- **Tagline:** Você escolhe. Depois vê quem propõe igual.
- **Conceito:** uma conversa de ponto de ônibus. Você diz o que faria, e o site mostra, sem torcida, quem pensa parecido e onde falou isso.

### Voz
- **Atributos:** próxima, leve, curiosa.
- **Faz:** fala como gente ("bora", "dá pra ver"), comemora o avanço da pessoa e não o candidato, e fica sóbria no resultado e nas fontes.
- **Não faz:** não diz "deu match", não usa confete nem emoji, não chama o candidato mais próximo de "vencedor", não força gíria nem diz "vote".

| Momento | Texto |
|---|---|
| Botão de começar | **Bora começar** (o mesmo de hoje) |
| Depois de escolher | Anotado! No fim você descobre quem propõe parecido. |
| Revelação | Pronto! Agora dá pra ver quem propõe o que você escolheu, e onde cada um falou isso. |

### Paleta (tokens em `marca/combina/tokens.css`)
Principal **petróleo #0F6E8C** (o `mar` de hoje). Destaque **goiaba #F07AA0**, que entra no lugar de `sol` e `folha` como assinatura. Fundo **#FBF8F1** e texto **#16213A** vêm da paleta atual.

| Par | Claro | Escuro |
|---|---|---|
| Texto / fundo | #16213A sobre #FBF8F1: **15,08:1** | #F3EFE6 sobre #0E1726: **15,65:1** |
| Texto suave / fundo | #4A5572 sobre #FBF8F1: **6,99:1** | #A9B3C7 sobre #0E1726: **8,52:1** |
| Texto / cartão | #16213A sobre #FFFFFF: **16,00:1** | #F3EFE6 sobre #172338: **13,72:1** |
| Texto do botão / botão | #FFFFFF sobre #0F6E8C: **5,79:1** | #0E1726 sobre #5CC4E2: **8,94:1** |
| Link / fundo | #0F6E8C sobre #FBF8F1: **5,46:1** | #5CC4E2 sobre #0E1726: **8,94:1** |
| Texto / goiaba | #16213A sobre #F07AA0: **6,09:1** | #0E1726 sobre #FF8DB2: **8,30:1** |
| Goiaba como texto / fundo | #B3265A sobre #FBF8F1: **5,92:1** | #FF8DB2 sobre #0E1726: **8,30:1** |
| Texto / opção escolhida | #16213A sobre #FDE2EB: **13,14:1** | #F3EFE6 sobre #3A1F2E: **12,93:1** |

Regras: o goiaba #F07AA0 é cor de preenchimento (logo, fundo de chip, balão), nunca de texto sobre claro. Para texto em goiaba, use `--cor-destaque-texto` #B3265A. `sol` e `folha` podem continuar como cor semântica (aviso, sucesso), mas nunca lado a lado com o petróleo numa mesma tela de resultado.

### Tipografia
- Títulos: **Bricolage Grotesque** 800. Pacote `@fontsource-variable/bricolage-grotesque`, já instalado.
- Texto: **Nunito Sans** 400/700, redonda e aberta em tela pequena. Pacote `@fontsource-variable/nunito-sans`, já instalado.
- Escala 12/14/16/18/20/24/32/40.

### Ilustração e ícones
Pictogramas cheios em duas cores (petróleo + goiaba) sobre um círculo claro, com cantos redondos. Sem gente e sem rosto: a pessoa é o "você" do texto.

### Logo
Dois balões de fala que se sobrepõem, o seu (petróleo) e o da proposta (goiaba). A parte em comum fica escura: é onde combina. As pontas dos balões separam o desenho dos dois círculos da Mastercard. Funciona a 32 e 16 px. O ponto de interrogação do nome vem em goiaba.

### Neutralidade
- Cor: petróleo + goiaba não é assinatura de partido. O petróleo é mais escuro e mais azul que o turquesa da Rede. O goiaba é rosa, não vermelho, e aparece só em áreas pequenas.
- Símbolo: balões, sem estrela, mão ou número.
- Nome: verbo comum, sem relação com sigla, coligação ou órgão.

### Riscos
- **Duplo sentido:** "combinado" também quer dizer "arranjado" ("resultado combinado"). Com a interrogação e a tagline, a leitura de "armação" fica improvável, mas vale testar com 5 a 10 pessoas.
- "Combina" lembra aplicativo de namoro. A voz precisa proibir "match", "crush" e parecidos.
- Rosa pode ser lido como cor "de menina" por parte do público. Por isso a principal continua petróleo.
- É o nome menos exclusivo: "combina" é palavra comum, o que dificulta domínio e busca (não verificado).
- Pronúncia: 3 sílabas simples (com-bi-na), sem acento. É a mais fácil das três para quem lê pouco.

---

## Direção 3 · Ponto a Ponto (trajeto)

- **Nome:** Ponto a Ponto
- **Alternativas:** Dá Sinal · Próxima Parada
- **Tagline:** Do trem à conta de luz, proposta por proposta.
- **Conceito:** a eleição como o trajeto do seu dia. Cada situação é uma parada, o resultado é o ponto final, e tudo é sinalizado como o letreiro do ônibus.

### Voz
- **Atributos:** prática, urbana, objetiva.
- **Faz:** frase de aviso de estação (curta, informativa), mostra o progresso como paradas e trata o tempo da pessoa com respeito.
- **Não faz:** não fala como burocracia ("prezado eleitor"), não usa jargão de campanha ("embarque nessa", "o Rio vai pra frente"), não brinca com acidente nem com atraso.

| Momento | Texto |
|---|---|
| Botão de começar | **Partiu, primeira parada** |
| Depois de escolher | Parada 3 de 18 feita. Segue viagem. |
| Revelação | Ponto final. Veja quem propõe o que você escolheu em cada parada. |

### Paleta (tokens em `marca/ponto-a-ponto/tokens.css`)
Principal **grafite #1B1D22** com **âmbar de letreiro #FFB21A**. No claro, o botão é grafite com letra âmbar. No escuro, o botão é âmbar com letra grafite. Fundo **#F3F1EC** (concreto claro).

| Par | Claro | Escuro |
|---|---|---|
| Texto / fundo | #1B1D22 sobre #F3F1EC: **14,94:1** | #F3F1EC sobre #0C0D10: **17,22:1** |
| Texto suave / fundo | #50545E sobre #F3F1EC: **6,71:1** | #A4A8B2 sobre #0C0D10: **8,16:1** |
| Texto / cartão | #1B1D22 sobre #FFFFFF: **16,86:1** | #F3F1EC sobre #18191E: **15,55:1** |
| Texto do botão / botão | #FFB21A sobre #1B1D22: **9,34:1** | #0C0D10 sobre #FFB21A: **10,77:1** |
| Link / fundo | #1B1D22 sobre #F3F1EC: **14,94:1** | #FFB21A sobre #0C0D10: **10,77:1** |
| Texto / âmbar | #1B1D22 sobre #FFB21A: **9,34:1** | #0C0D10 sobre #FFB21A: **10,77:1** |
| Âmbar como texto / fundo | #8A5200 sobre #F3F1EC: **5,66:1** | #FFB21A sobre #0C0D10: **10,77:1** |
| Texto / opção escolhida | #1B1D22 sobre #FFEFC7: **14,79:1** | #F3F1EC sobre #33290F: **12,70:1** |
| Letreiro âmbar / placa | #FFB21A sobre #1B1D22: **9,34:1** | #FFB21A sobre #1F2127: **8,92:1** |

Regra: âmbar nunca vira texto sobre fundo claro (daria 1,6:1). Nesse caso use #8A5200.

### Tipografia
- Títulos e texto: **Archivo**, estreita (wdth 82) e em caixa-alta nos títulos, como placa de sinalização. Normal no texto. Pacote `@fontsource-variable/archivo`.
- Letreiro: **Doto** (matriz de pontos), só na logo e na faixa de horário da cena, nunca em frase. Pacote `@fontsource-variable/doto`.
- Escala 12/14/16/18/20/24/32/40.

### Ilustração e ícones
Pictogramas de placa de trânsito: quadrado grafite, figura cheia em âmbar, sem gradiente. O progresso é uma linha de trajeto com paradas.

### Logo
Placa grafite com uma linha de trajeto em âmbar, com ponto de partida cheio e chegada vazada. A versão horizontal junta o nome em letreiro de pontos. A 32 px o símbolo se lê. O letreiro só se lê de 40 px de altura para cima.

### Neutralidade
- Cor: grafite + âmbar não é assinatura de partido e não tem verde. O risco é o amarelo, lembrando a camisa amarela de ato de rua. O grafite e o tom alaranjado do âmbar afastam essa leitura, mas não a eliminam.
- Símbolo: trajeto, sem estrela, mão ou número.
- Nome: expressão comum, sem relação com sigla ou coligação.

### Riscos
- O letreiro em Doto é difícil de ler em tela pequena, com brilho baixo e para quem enxerga pouco. Por isso ele não pode passar de detalhe.
- O conceito de trajeto fala mais com quem anda de trem e ônibus no Rio do que com o eleitor de presidente no interior do Norte e do Nordeste.
- "Ponto a Ponto" é expressão comum e difícil de ter como marca. "Ponto" também tem sentidos de rua (ponto de venda de droga, ponto de prostituição), fracos nessa locução mas presentes.
- "Dá Sinal" lembra "sinal" de pagamento adiantado, perto demais de compra de voto. "Próxima Parada" é longo.
- Amarelo com preto também lembra obra e aviso de perigo.

---

## Recomendação: Direção 2, Combina?

1. **Continuidade:** "Combina?" é a forma curta do nome atual. Quem já compartilhou o link reconhece, e o título longo pode continuar como chamada da página.
2. **Fácil de falar e de lembrar:** uma palavra de 3 sílabas, sem acento, que dá para repetir numa conversa de WhatsApp ("faz o Combina aí"). É a que melhor atende quem lê pouco.
3. **Tom certo:** a pergunta convida sem mandar votar e é leve sem virar jogo. A tagline já explica o às cegas ("depois vê").
4. **Neutralidade melhor que a atual:** mantém o petróleo e troca o par sol/folha por goiaba como assinatura, o que tira a leitura de bandeira que a paleta de hoje corre.
5. **Custo baixo:** mesmas fontes e mesmos tokens de fundo e texto. A migração é trocar `sol`/`folha` como acento e adotar o símbolo.

Da direção 1, vale levar o **marca-texto na fonte citada** (dá peso ao trecho literal sem mudar a marca). Antes de fechar, faça um teste rápido com 5 a 10 pessoas do público de ônibus/SUS: mostre só o nome e pergunte "o que você acha que esse site faz?". Isso checa a leitura de "combinado = arranjado" e a de aplicativo de namoro.
