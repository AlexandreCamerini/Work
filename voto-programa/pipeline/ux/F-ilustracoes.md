# F · Ilustrações das situações

Cada situação do quiz tem um desenho no topo da tela de cena. São 45 desenhos em SVG feitos à mão
no código (React), sem imagem externa, IA de imagem ou biblioteca. Código em `src/cenas/ilustracoes/`.

## Como aparece na cena

- A faixa `.cena-ilustra` vem antes do texto da cena, dentro do `main.meio`, que na cena vira coluna flex.
- Ela tem `flex: 1 1 0`, `min-height: 0` e `max-height: 140px`, então só ocupa a **sobra** do meio.
  Não empurra o texto para fora e não faz o meio rolar. Quando o texto é longo, ela encolhe.
- Ela tem `container-type: size`. Com menos de 60 px, o desenho some (`@container (max-height: 60px)`),
  para não ficar um selo ilegível.
- Medido nas capturas: com 390×844 a faixa fica sempre com 140 px. Com 360×640 varia de 42 a 88 px
  (trem 67, garagem alagada 72, barca 88, operação policial 42, que some).
- Na entrada o desenho sobe 6 px e aparece em 240 ms. Com `prefers-reduced-motion` a regra global
  corta a animação.
- É decorativo: `aria-hidden="true"` no SVG e na faixa, porque o texto da cena já descreve a situação.
  Não recebe foco e não entra na ordem de leitura.
- O mapa chega por `import()` num chunk próprio (`ilustracoes-*.js`, 44,7 kB, 10,6 kB gzip). O Quiz
  pede o chunk ao abrir a eleição, em paralelo aos dados. A cena usa `useIlustracoes()`. Enquanto o
  chunk não chega (ou se ele falhar), a faixa fica vazia, com a mesma altura, e nada se mexe.
- O JS inicial ficou em **226,23 kB**, igual a antes (o teto é 240 kB).

## Guia de estilo

### Quadro e proporção
- `viewBox="0 0 320 160"` (2:1). O fundo é um cartão de petróleo suave com cantos de 28, e todo o
  desenho é recortado nele (`clipPath` `#ilu-q`, com a mesma geometria em todos).
- O chão padrão fica em y = 136 (ou 132 nas cenas com mais coisa no alto). Quase todas as cenas têm
  uma faixa de chão em papel com o traço por cima.
- Uma pessoa em primeiro plano mede cerca de 74 de altura, quase metade do quadro. Ao fundo, a escala
  vai de 0,7 a 0,85. Busto (em janela, atrás de mesa) usa escala de 0,6 a 1,15.

### Traço
- Traço de 3 unidades na cor da tinta, com pontas e junções redondas, em todas as formas
  (`.ilu *`). Fino = 2 (`f`), largo = 6 (`w`), tracejado 5/6 (`d`).
- É flat com contorno: cor chapada, sem gradiente e sem sombra. A única transparência é `o`
  (0,75), usada em água e fumaça.
- Cantos arredondados em tudo (`rx` de 2 a 12).

### Paleta
São 4 cores da marca, por variáveis CSS, então o mesmo SVG serve no claro e no escuro:

| Classe | Papel | Claro | Escuro |
|---|---|---|---|
| `c` | fundo do quadro (petróleo suave) | `--cor-primaria-suave` #DFF1F6 | #133247 |
| `p` | petróleo: objetos grandes, roupa, água | `--cor-primaria` #0F6E8C | #5CC4E2 |
| `g` | goiaba: destaque (sol, moeda, porta, roupa) | `--cor-destaque` #F07AA0 | #FF8DB2 |
| `t` / traço | tinta (`currentColor` = `--ilu-traco`) | #16213A | #D3DAE6 |
| `b` | papel: chão, janelas, folhas (a superfície da UI) | `--cor-superficie` #FFFFFF | #172338 |

Fora da paleta de UI, e só em gente, há quatro tons de pele (`k1` #F1CFB0, `k2` #D6A078,
`k3` #A8693F, `k4` #6A3E26) e dois de cabelo (`h` escuro, `hg` grisalho). Esses tokens ficam em
`--ilu-*` no `src/index.css`. Linhas coloridas: `lp` (petróleo), `lg` (goiaba), `lb` (papel).
Não há verde nem amarelo, e o vermelho não aparece: o "sinal fechado" do semáforo é goiaba.

### Peças (`pecas.tsx`)
`Quadro`, `Chao`, `Agua`, `Pessoa` (poses `lado`, `segura`, `celular`, `sentada`, `busto`, `corre`;
cabelos `curto`, `longo`, `crespo`, `coque`, `tranca`, `careca`, `grisalho`, `lenco`, `bone`; `largo`
para corpo maior; `fantasma` para lugar vago), `Celular`, `Onibus`, `Carro`, `Predio`, `Casa`, `Nuvem`,
`Chuva`, `Arvore`, `Papel` (com código de barras = boleto), `Moedas`, `Sobe` (seta de preço),
`Relogio`, `Sol`, `Balao`, `Cone`. Um desenho novo deve ser montado com essas peças.

### Regras de conteúdo
- **Gente sem rosto:** cabeça lisa, sem olhos nem boca. A emoção vem da cena e da postura. Isso segue
  a regra da marca ("a pessoa é o você do texto") sem apagar quem aparece.
- **Diversidade em cada cena com gente:** os quatro tons de pele se alternam, e aparecem jovens e
  pessoas grisalhas (com bengala), corpos mais largos, cabelo crespo, trança, coque, lenço e boné.
  Não há papel fixo por tom de pele: quem entrega, quem é servidora, quem é patroa e quem espera no
  SUS muda de cena para cena.
- **Território sem estereótipo:** bairro é casa e rua comuns, sem favela caricata. A seca mostra açude,
  carro-pipa e uma mulher com balde, sem retirante.
- **Segurança pública mostra a consequência cotidiana, nunca o confronto:** escola com portão fechado,
  ônibus parado, gente checando o grupo, pista bloqueada com cone, mão vazia onde estava o celular,
  olhar no retrovisor, correria na praia. Não há arma, polícia, criminoso, sangue ou vítima no chão.
  Na medida protetiva, as vizinhas conversam no portão com a medida na mão, e o agressor não aparece.
- **Neutralidade:** sem rosto de político, sem símbolo, cor ou número de partido, sem bandeira, sem
  brasão e sem balança. O prédio público é genérico, com colunas e frontão. Não há logotipo de empresa
  real: o trem, a barca, a van, o caminhão e o aplicativo não têm marca.
- **Sem texto no desenho:** nenhum `<text>`, número ou letra. Conta, boleto e formulário são linhas e
  código de barras.

O teste `src/cenas/ilustracoes/ilustracoes.test.tsx` confere quatro coisas:
- toda cena dos dois quizzes tem desenho próprio;
- todo tema tem desenho de reserva;
- cada SVG é 320×160 e `aria-hidden`;
- cada SVG não tem `<text>`, `<image>`, `href` nem `style`, e tem até 6 KB.

## Mapa: `ilustracaoDe({ id, grupo, tema? })`

A busca segue esta ordem: id da cena, depois grupo, depois tema e, por último, `Generica`.

### Por grupo (24 chaves, 21 desenhos)

| Grupo | Desenho | Bytes |
|---|---|---|
| trem-parado | `TremParado`: vagão lotado, porta que não fecha | 4 076 |
| passagem-cara | `PassagemCara`: moedas que sobem no ponto de ônibus | 1 806 |
| fila-especialista | `FilaEspecialista`: sala de espera, relógio, painel de senha | 2 506 |
| escola-bagunca | `EscolaBagunca`: quadro rabiscado, mesa do professor vazia | 1 630 |
| operacao-policial | `OperacaoPolicial`: escola fechada, ônibus parado, grupo no celular | 2 098 |
| celular-roubado, celular | `CelularRoubado`: mão vazia no ponto de ônibus | 2 277 |
| medida-protetiva, mulheres | `MedidaProtetiva`: vizinhas no portão, a medida na mão | 2 021 |
| rua-alagada | `RuaAlagada`: rua cheia, geladeira boiando | 1 846 |
| falta-agua | `FaltaAgua`: torneira seca, balde vazio, conta que sobe | 967 |
| primo-desempregado | `PrimoDesempregado`: entregador de bicicleta | 1 501 |
| orla | `CorreriaPraia` (o mesmo da variante) | 2 894 |
| dinheiro-publico, contas | `DinheiroPublico`: prédio público e moedas, prateleira do posto vazia | 1 352 |
| jornada | `Jornada`: calendário com 6 dias de trabalho e 1 de folga | 1 349 |
| renda | `Renda`: carteira quase vazia, nota comprida, sacola | 950 |
| juros | `Juros`: cartão e parcelas que crescem | 918 |
| fila-sus | `FilaSus`: corredor, maca vazia, ampulheta | 2 105 |
| faccao | `Faccao`: taxa sobre o botijão e a internet do bairro | 1 269 |
| escola | `Escola`: jovem entre a escola e a loja | 1 647 |
| energia | `Energia`: lâmpada, conta, bomba de combustível, botijão | 1 077 |
| clima | `Clima`: metade enchente, metade seca | 1 206 |
| internet | `Internet`: vídeo duvidoso no celular e no grupo da família | 1 658 |

### Por id (24 variantes que mudam a cena)

| Id | Desenho | Bytes |
|---|---|---|
| barca-leste | barca, fila que dobra a estação, ponte parada | 3 717 |
| estrada-interior | estrada com buraco, sem acostamento, ponto com relógio | 1 575 |
| transito-carro | via expressa parada no fim de tarde | 3 918 |
| vale-transporte | cartão de transporte e moedas, colegas de trabalho | 2 195 |
| saude-interior | van de madrugada rumo à capital, paciente de lenço | 1 754 |
| plano-voltou-sus | cartão do plano que encarece, idosa a caminho do posto | 1 405 |
| especialista-longe | barco de dois andares no rio, com redes | 1 508 |
| falta-tecnico | vaga no mural (contorno vazio), bancada sem ninguém | 1 752 |
| via-expressa-fechada | pista bloqueada, carros parados, motorista no celular | 2 263 |
| roubo-carro | à noite, no portão, de olho no retrovisor | 1 288 |
| celular-sinal | no sinal, a mão pela janela e o celular que sumiu | 1 245 |
| correria-praia | praia no fim de tarde, gente correndo | 2 894 |
| encosta-serra | chuva na serra, rachadura na encosta | 1 658 |
| garagem-alagada | garagem do prédio cheia, carro debaixo d'água | 2 582 |
| caminhao-pipa | caminhão-pipa no prédio, boleto que sobe | 1 609 |
| enchente-sul | marca d'água na parede, casa sendo pintada, alerta | 1 978 |
| fumaca-queimada | fumaça sobre a cidade, barco encalhado no rio baixo | 1 962 |
| seca-nordeste | açude rachado, carro-pipa, mulher com balde | 1 603 |
| servidor-recomposicao | quatro calendários, servidor com crachá | 1 684 |
| licenca-empresa | galpão fechado, pilha de processo, ampulheta, árvore | 838 |
| custo-contratar | calculadora no balcão, cadeira com vaga (contorno) | 1 941 |
| trabalho-app | carro de aplicativo, rota, relógio, termômetro | 1 226 |
| imposto-renda | declaração no notebook, moedas do salário e das compras | 1 091 |
| pagar-faculdade | capelo e fila de boletos | 1 960 |

### Por tema (reserva)
transporte → PassagemCara · saude → FilaEspecialista · educacao → EscolaBagunca ·
seguranca → CelularRoubado · trabalho → PrimoDesempregado · agua-chuva → RuaAlagada ·
mulheres → MedidaProtetiva · contas → DinheiroPublico · economia → Renda · energia → Energia ·
clima → Clima · internet → Internet. Qualquer outro tema cai em `Generica` (ponto de ônibus e os
dois balões da marca, 1 463 B).

## Tamanho

- 45 desenhos. O SVG renderizado soma **81,4 KB** (média de 1,8 KB). O maior é `TremParado`,
  com 4,1 KB, abaixo do limite de 6 KB.
- O código-fonte (`src/cenas/ilustracoes/*.ts[x]`, com peças, mapa, carregador e teste) soma 60 KB.
- O chunk de produção `ilustracoes-*.js` tem 44,7 kB (10,6 kB gzip) e fica fora do JS inicial.
- O CSS novo (classes `.ilu`, a faixa da cena e 3 tokens × 3 temas) tem cerca de 1,6 kB.

## Capturas

Ficam em `pipeline/ux/capturas/ilustracoes/`, fora do git porque somam 2,8 MB. São seis cenas:
trem-parado, barca-leste, garagem-alagada, operacao-policial, escala-6x1 e seca-nordeste. Cada uma
tem versão em 390×844 e em 360×640 no tema claro, e o trem-parado também tem versão no tema escuro
nos dois tamanhos.
