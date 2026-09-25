# B. Interação: novo fluxo do quiz

Escopo: como as coisas aparecem e se comportam. O texto é de outro agente. Nada aqui altera `src/`.

- Protótipo navegável: `pipeline/ux/prototipo-fluxo.html` (abra direto no navegador; em tela larga ele simula 360×640).
- Teste do protótipo: `node pipeline/ux/capturas/testar-prototipo.mjs` (58 verificações, todas passando).
- Capturas do estado atual: `pipeline/ux/capturas/antes/` (script `capturar-antes.mjs`, medidas em `medidas-*.json`).
- Capturas do protótipo: `pipeline/ux/capturas/prototipo/`.

---

## 1. Estado atual medido

Build de produção servido com `vite preview`, Playwright/Chromium, `isMobile`, perfil preenchido (1ª opção de cada), 3 prioridades, sempre a 2ª opção nas cenas.

| Medida | 360×640 | 390×844 |
|---|---|---|
| Cenas no fluxo (RJ / Presidente) | 11 / 12 | 11 / 12 |
| Altura da página na cena **depois** da escolha | 970 a 1090 px (1,5 a 1,7 telas) | 970 a 1057 px |
| Quanto a página cresce ao escolher (média RJ) | +239 px | +156 px |
| Botão "Próxima" fora da viewport após escolher | **11/11 (RJ), 12/12 (Pres.)** | **11/11, 12/12** |
| Rolagem necessária para alcançar "Próxima" | até 386 px | até 149 px |
| Última opção fora da viewport **antes** de escolher | 11/11 (RJ), 11/12 (Pres.) | 0 |
| "Nenhuma dessas / pular" visível sem rolar | não (y = 667) | sim |
| Opções travadas após escolher | sim, em todas | sim |
| Tela "Sobre você" | 1543 px (2,4 telas) | 1495 px |
| Resultado: altura / onde começa o bloco de voto (RJ) | 4931 px / y = 3786 (**5,9 telas abaixo**) | 4587 px / y = 3442 (4,1 telas) |
| Resultado: bloco de voto (Presidente) | y = 1835 (2,9 telas) | y = 1779 (2,1 telas) |
| Toques da home até o resultado | 35 (RJ) / 37 (Pres.) | igual |
| Rolagens forçadas até o resultado | 18 (RJ) / 21 (Pres.) | 16 / 16 |

**Toques:** home 1 + intro 1 + perfil 6 + continuar 1 + prioridades 3 + continuar 1 + 2 por cena (11 a 12 cenas). Mínimo possível (pulando tudo): 2 + 1 + 1 + 11 = 15.

**Duração estimada:** cada cena tem ~65 palavras (cena, pergunta e 4 opções) + ~21 do fato. A 200 palavras/min e ~5 s de decisão, dá ~31 s por cena, mais ~2 s de rolagem → **~6 min só nas cenas**, 7 a 9 min até o voto contando perfil, prioridades e a leitura do resultado. A intro promete "Uns 3 minutos".

**Achados de interação e acessibilidade no código atual**

1. `Cena.tsx`: `disabled={escolha !== null}` trava as opções; o fato e o botão entram **abaixo** das opções, empurrando o botão para fora da tela.
2. `Quiz.tsx`: as respostas são acumuladas em lista (`[...r, nova]`), sem jeito de voltar; a ordem das opções é sorteada em `useMemo` no componente, que tem `key` por pergunta: se houvesse Voltar, a ordem mudaria.
3. As etapas não entram no histórico: o **botão Voltar do Android sai do quiz** e perde tudo (a rota é só `#governador-rj`).
4. Alvos menores que 44 px: chips do perfil (40 px), "Pular tudo" (20 px), "Nenhuma dessas / pular" (20 px), "Refazer o teste" (20 px).
5. Contorno das opções `#e6e0d2` sobre branco = **1,32:1** (WCAG 1.4.11 pede 3:1 para identificar o controle).
6. Branco sobre `coral` = 3,68:1 e sobre `folha` = 4,25:1: não serve para texto pequeno (hoje só nos ícones ✓ ✗, que são `aria-hidden`; ok, mas não reaproveitar essas cores em texto).
7. Troca de cena não move foco nem anuncia nada: leitor de tela fica no botão que sumiu.
8. Opções opacas a 60% depois da escolha: parecem desabilitadas (e estão), leitura difícil.

---

## 2. Princípios

1. **Nenhuma tela de cena rola.** Ação sempre no mesmo lugar, na zona do polegar.
2. **Nada trava.** Escolher é reversível até o fim do voto; Voltar preserva tudo.
3. **Nada empurra nada.** Tudo que aparece depois de um toque ocupa espaço já reservado ou abre por cima.
4. **Diversão vem do ritmo, não de prêmio.** Marcos, microanimação e revelação dão ritmo; nada de pontos, acertos, troféus, confete para candidato, "match" ou "seu candidato é".
5. **O voto é da pessoa.** Afinidade não é recomendação; empate aparece como empate; o voto nunca vai para o cartão.
6. **Movimento é opcional.** Tudo funciona igual com `prefers-reduced-motion`.

---

## 3. Fluxo novo

```
Home ─► Intro ─► Sobre você (1 por tela, 6 telas, avança ao tocar) ─► Prioridades (tela única)
      ─► Cena 1 … Cena N  (escolhe/troca → Próxima; ← volta; "Você sabia?" abre por cima)
      ─► "Comparando…" (1,2 s) ─► Resumo em 2 cartões (tipo Wrapped, sem nomes)
      ─► Resultado às cegas (lista compacta; toque = detalhe em folha)
      ─► Voto às cegas ─► Contagem 3-2-1 ─► Revelação em sequência ─► Cartão para compartilhar
```

| | Atual | Novo |
|---|---|---|
| Toques até o resultado (RJ, respondendo tudo) | 35 | 35 + 2 (resumo) = 37, **0 rolagens** |
| Toques mínimos (pulando tudo) | 15 | 15 (perfil: "Pular" em cada tela ou "Pular tudo" na 1ª) |
| Rolagens até o resultado | 18 | 0 |
| Resultado → voto | rolar 4 a 6 telas | 1 toque ("Votar às cegas" fixo no rodapé) |
| Duração estimada | 7 a 9 min | ~5 min (fato vira opcional em 1 toque; menos rolagem; reler só se quiser) |

Ajuste de texto da intro: prometer o tempo medido ("uns 5 minutos") e, durante as cenas, o tempo que falta a partir do ritmo real ("faltam ~2 min") no marco de metade.

**Histórico e persistência:** cada etapa ganha rota (`#governador-rj/perfil/2`, `#governador-rj/cena/4`, `#governador-rj/resultado`). O botão Voltar do sistema faz o mesmo que o ← da tela. O progresso fica em `sessionStorage` (respostas, ordem sorteada, índice): um recarregamento acidental volta na mesma cena. Isso não muda a promessa "nada sai do seu celular". Na intro, se houver progresso: "Continuar de onde parei (cena 4 de 11)" e "Começar de novo".

---

## 4. Telas

Medidas em px CSS a 360×640. Largura útil 328 (gutter de 16).

### 4.1 Layout-base (todas as telas do fluxo)

```
┌──────────────────────────────────┐  height: 100dvh (fallback 100vh)
│ TOPO  44px                        │  contexto + progresso (não rola)
├──────────────────────────────────┤
│ MEIO  1fr                         │  conteúdo; overflow-y:auto só como rede
│                                   │  de segurança (ver critério editorial)
├──────────────────────────────────┤
│ DOCA  ~123px + safe-area          │  dica/fato (46) + ações (52)
└──────────────────────────────────┘
```

- `grid-template-rows: auto minmax(0,1fr) auto; grid-template-columns: minmax(0,1fr)` (sem a coluna mínima, texto em `nowrap` na doca alarga a tela inteira: aconteceu no protótipo).
- Em altura < 480 px (paisagem ou texto ampliado a 200%), a doca deixa de ser fixa e a página rola normalmente (WCAG 1.4.10 e 2.4.11: a doca não pode cobrir o foco).
- `scroll-padding-bottom` no MEIO para que foco por teclado nunca fique sob a doca.

### 4.2 Sobre você: 1 pergunta por tela, avança ao tocar

**Decisão:** 1 por tela. Justificativa:

- A tela única atual tem 2,4 telas de altura com chips de 40 px; o eleitor não vê quantas faltam nem onde está o "Continuar".
- Com 1 por tela, cada pergunta cabe com folga (4 a 6 opções de 52 px), sem rolagem, com alvos grandes, e o toque na resposta já avança: são os mesmos 6 toques, sem o "Continuar".
- Progresso próprio ("Sobre você 2/6") dá sensação de velocidade (é o padrão de onboarding do Duolingo e de quizzes do BuzzFeed).
- Contra: são 6 transições. Mitigação: transição curta (≤ 250 ms), 260 ms de pausa para ver a seleção antes de avançar, e "Pular tudo" na 1ª tela.

```
┌──────────────────────────────────┐
│ (SOBRE VOCÊ) ▓▓▓░░░░░░░░░░   1/6 │
│                                   │
│ Onde você mora?                   │  h1, recebe foco
│ Toque na resposta para seguir.    │  aviso prévio exigido por WCAG 3.2.2
│ ┌──────────────────────────────┐  │
│ │ Cidade do Rio                │  │  botões de 52px, largura total
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ Baixada Fluminense           │  │
│ └──────────────────────────────┘  │
│   … (até 6 opções)                │
├──────────────────────────────────┤
│ [ ← ]  [        Pular        ]    │  1ª tela: "Pular tudo" como link 44px
└──────────────────────────────────┘
```

| Estado | Comportamento |
|---|---|
| Vazio | Nenhuma marcada; ação da doca = "Pular" (estilo secundário). |
| Escolhido | Opção em `aria-pressed=true`, cor cheia + ícone ✓; após 260 ms avança. Com movimento reduzido avança sem animação, mas mantém 260 ms para a pessoa ver o que marcou. |
| Voltando | Ao voltar, a opção escolhida aparece marcada; tocar outra troca e avança; tocar a mesma avança sem mudar. |
| Erro | Não há erro possível: tudo é opcional. |

Regras: as opções são `<button aria-pressed>` (ativar um botão que navega não é "mudança de contexto por entrada", 3.2.2, e o aviso "Toque na resposta para seguir" fica na tela de qualquer forma). O foco vai para o `h1` a cada tela; `aria-live` anuncia "Pergunta 2 de 6".

### 4.3 Prioridades: tela única

**Decisão:** tela única. Hoje ela já cabe em 360×640 (medido: 640 px). É uma escolha comparativa ("o que pesa mais"): a pessoa precisa ver os 8 a 10 temas juntos.

```
┌──────────────────────────────────┐
│ (PRIORIDADES)                     │
│ O que mais pesa no seu dia?       │
│ Marque até 3. Contam em dobro.    │
│ ┌─────────────┐ ┌─────────────┐   │  grade 2 colunas, 52px
│ │ Saúde     ✓ │ │ Transporte  │   │
│ └─────────────┘ └─────────────┘   │
│   … (8 a 10 temas)                │
├──────────────────────────────────┤
│ ┆ 2 de 3 escolhidos             ┆ │  aria-live="polite"
│ [ ← ]  [      Continuar      ]    │  "Pular" quando 0
└──────────────────────────────────┘
```

| Estado | Doca |
|---|---|
| Vazio | "Nenhum marcado: todos os temas valem igual." + botão "Pular" (secundário) |
| 1 a 3 | "N de 3 escolhidos" + "Continuar" (primário) |
| Erro (4º toque) | Faixa coral: "Máximo de 3. Desmarque um para trocar." Nada é marcado. O foco fica no chip tocado. |

### 4.4 Cena (a tela principal)

```
┌──────────────────────────────────┐
│ (SAÚDE) ▓▓▓▓▓▓▓▓▒▒░░░░░░░    4/11 │  TOPO 44: tema, segmentos, contador
├──────────────────────────────────┤
│ Sua vizinha sente dor no joelho   │  cena: display 19/1.3, até 5 linhas
│ há meses. O posto mandou pro      │
│ especialista, mas a consulta…     │
│ O que resolveria mais rápido?     │  pergunta = <legend>, 16 bold, recebe foco
│ ┌──────────────────────────────┐  │
│ │ ○ Contratar mais médicos…    │  │  radios nativos, cartão 48–83px
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ ● Consulta por vídeo…     ✓  │  │  escolhida: fundo mar, ✓ branco
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ ○ …                          │  │
│ └──────────────────────────────┘  │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐  │  zona de 46px RESERVADA desde o início
│ │ ANOTADO · VOCÊ SABIA?  Ler › │  │  antes: dica tracejada
│ │ Em setembro de 2026, a par…  │  │  depois: teaser do fato (1 linha)
│ └──────────────────────────────┘  │
│ [ ← ]  [        Próxima        ]  │  52px; mesmo lugar em todas as cenas
└──────────────────────────────────┘
```

Medido no protótipo a 360×640 com as fontes do app: topo 44, meio 473, doca 123. Cena 2 do protótipo (cena de 146 caracteres + opção de 87, os máximos do quiz real) sobra 8 px; cenas médias sobram 78 px.

**Estados**

| Estado | Opções | Zona do fato | Botão principal |
|---|---|---|---|
| Vazio | todas em branco, contorno 3:1 | dica tracejada: "Escolha a que mais combina com você. Dá para trocar." | "Nenhuma dessas" (secundário) = pular, grava sem resposta |
| Escolhido | escolhida em `mar` + ✓ com "pop" de 220 ms | chip amarelo "ANOTADO · VOCÊ SABIA?" + 1ª linha do fato + "Ler ›" (entra subindo 8 px) | "Próxima" (primário); última cena: "Ver meu resultado" |
| Trocado | a nova fica marcada, a antiga volta ao normal | rótulo vira "TROCADO · VOCÊ SABIA?" | igual |
| Desmarcado (tocar de novo na escolhida) | nenhuma | volta à dica | volta a "Nenhuma dessas" |
| Fato aberto | inertes atrás do véu | folha de baixo (máx. 78% da altura) com título, texto, fonte e, se houver, "Spoiler: aqui os candidatos propõem coisas parecidas" | na folha: "Fechar" e "Próxima" (mesma linha do botão da doca) |
| Voltando de outra cena | resposta anterior marcada, **mesma ordem** | chip do fato já visível | "Próxima" |
| Erro de conteúdo (texto não cabe) | o MEIO rola por dentro com sombra de rolagem em cima/embaixo; a doca continua fixa | igual | igual (critério A2 pega isso no CI) |

**Regras de interação**

1. Opções são `<input type="radio">` nativos dentro de `<fieldset>` com a pergunta como `<legend>`: setas trocam, espaço marca, o leitor diz "selecionado, 2 de 4". O cartão inteiro é a área de toque.
2. Trocar é livre e não conta como resposta nova (a resposta é um mapa `perguntaId → opcaoId`, não uma lista).
3. "Próxima" avança; transição de 280 ms deslizando da direita (← desliza da esquerda).
4. "←" na 1ª cena volta para Prioridades; nas demais, para a cena anterior com tudo preservado.
5. A ordem das opções é sorteada **uma vez por pessoa e por cena** e guardada no estado do quiz (não no componente).
6. O fato não abre sozinho. O teaser mostra a 1ª linha para puxar a leitura sem obrigar. Pode-se medir depois quantos abrem (sem enviar nada: é só uma hipótese para o dono avaliar).
7. Folha do fato: `role="dialog" aria-modal="true"`, foco no título ao abrir, Tab preso dentro, Esc ou toque no véu fecham, o foco volta ao chip. Arrastar para baixo pode fechar, mas sempre há o botão "Fechar" (WCAG 2.5.7).
8. Desktop: teclas 1 a 4 escolhem, Enter no botão avança.
9. Ao mudar de cena: foco na pergunta (`tabindex=-1`), `aria-live` "Situação 5 de 11. Saúde.". Ao escolher: "Anotado. Dá para trocar." Ao trocar: "Resposta trocada."
10. Tipografia adaptativa: se `cena.length > 120`, cena em 18 px em vez de 19 px (ganha ~1 linha).

**Critério editorial para caber sem rolagem a 360×640** (para o agente de texto): `cena + pergunta ≤ 170 caracteres`, `soma das 4 opções ≤ 260`, `pergunta ≤ 50` (1 linha). Hoje o pior caso real é 183 e 279 (RJ): passaria a ~1 linha de caber. O critério A2 roda sobre todas as cenas reais.

### 4.5 "Comparando…" e resumo (tipo Wrapped, sem nomes)

Depois da última cena: 1,2 s de "Comparando suas escolhas com as propostas…" (transição de expectativa; com movimento reduzido, 0 s), depois 2 cartões de tela cheia em `mar`, com segmentos no topo e "Pular" à direita:

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓ ░░░░░░░░         Pular   │   │ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓         Pular   │
│ SEU JEITO                         │   │ ANTES DO RESULTADO                │
│ 11                                │   │ Em Segurança, todos propõem       │
│ situações do dia a dia com        │   │ quase a mesma coisa.              │
│ resposta sua                      │   │ Agora você vê quem ficou mais     │
│ O que mais pesa pra você:         │   │ perto das suas escolhas, sem os   │
│ (Saúde) (Transporte)              │   │ nomes. Depois vota às cegas.      │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│ [ ← ]  [      Continuar      ]    │   │ [ ← ] [ Ver resultado às cegas ]  │
└──────────────────────────────────┘   └──────────────────────────────────┘
```

Regras: avançam só por toque (sem temporizador: WCAG 2.2.2); "←" do 1º cartão volta para a última cena. O cartão 2 usa os consensos (`pergunta.consenso`), que hoje ficam escondidos no fim da página de resultado. Só dados que o app já tem; nada de inventar "perfil ideológico".

### 4.6 Resultado às cegas (hub)

```
┌──────────────────────────────────┐
│ (RESULTADO ÀS CEGAS)              │
│ Quem propõe algo parecido com as  │  h1 (2 linhas)
│ suas escolhas                     │
│ ┆ A e B estão quase empatados    ┆│  só se a diferença < 5 pontos
│ ┌──────────────────────────────┐  │
│ │ (A) Candidato A ✓6 ~1 ✗1  69%│  │  linha de 58px: letra, rótulo, contagem,
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░     │  │  barra, % (conta de 0 até o valor)
│ └──────────────────────────────┘  │
│   … B, C, D, E (5 visíveis)       │
│ Afinidade com as suas escolhas,   │
│ não é recomendação de voto.       │
├──────────────────────────────────┤
│ [       Votar às cegas         ]  │
│   Prefiro não votar, ver os nomes │  link 44px
└──────────────────────────────────┘
```

**Visível sem rolar a 360×640:** título, aviso de empate (se houver), as 5 primeiras linhas, o lembrete e o botão de votar. Presidente (2 candidatos) cabe inteiro; RJ (8) mostra 5 e a lista rola por dentro com a doca fixa. Candidato sem dados suficientes (`afinidade === null`) aparece por último, com "—" e "poucos dados" no lugar da barra.

Regras:
- Toque na linha abre **folha de detalhe** (Atende / Em parte / Não atende; sem trecho e sem fonte antes do voto, como hoje, porque entregariam quem é).
- As barras entram em sequência (180 ms entre linhas, 700 ms cada, com contagem numérica). Movimento reduzido: valores finais direto.
- "Nisso eles concordam" e "Como calculamos" saem do fim da página: o primeiro vira o cartão 2 do resumo; o segundo vira link "Como calculamos" no topo, que abre folha.
- Leitor de tela: cada linha é um botão com rótulo completo ("Candidato A, 69 por cento, 6 atendem, 1 não atende. Ver detalhes.").

### 4.7 Voto às cegas

```
┌──────────────────────────────────┐
│ (VOTO ÀS CEGAS)                   │
│ Só pelas propostas, em quem você  │  legend com h1
│ votaria?                          │
│ Os nomes aparecem logo depois.    │
│ ┌──────────────────────────────┐  │
│ │ ○ Candidato A            69% │  │  radios nativos
│ │ ○ Candidato B            62% │  │
│ │ ○ Prefiro não votar          │  │
│ └──────────────────────────────┘  │
│ [Turnstile, quando exigido]       │
├──────────────────────────────────┤
│ ┆ Dá para trocar até confirmar.  ┆│
│ [ ← ]  [ Confirmar e revelar ]    │
└──────────────────────────────────┘
```

| Estado | Comportamento |
|---|---|
| Vazio | dica "Dá para trocar até confirmar." |
| Escolhido | radio marcado; troca livre |
| Erro: confirmou sem escolher | faixa coral `role="alert"`: "Escolha uma opção acima, ou 'Prefiro não votar'." e foco na 1ª opção |
| Aguardando Turnstile | botão mostra "Verificando…" e fica ocupado (`aria-busy`), não desabilitado sem explicação |
| Envio falhou (`erro`, `devagar`, `desafio`) | não bloqueia a revelação: segue para a contagem e mostra `mensagemVoto` discretamente na tela de revelação |
| Já votou (`ja_votou`) | idem, com a mensagem atual |

### 4.8 Contagem regressiva e revelação em sequência

- Contagem: tela `tinta` com "Revelando em" e 3 → 2 → 1 (800 ms cada, 2,4 s no total, abaixo do limite de 5 s de 2.2.2). `aria-live` diz só "Revelando os nomes." Movimento reduzido: sem contagem.
- Revelação: o cartão do **voto da pessoa vem primeiro e maior** e vira sozinho (rotação Y de 600 ms): "Seu voto às cegas: Nome · Partido · número". Depois, "Revelar os outros" vira os demais em sequência (420 ms entre eles), na ordem do resultado. Sem voto: "Revelar" vira todos em sequência.
- Por que o voto primeiro: a recompensa é descobrir **em quem você votou só pelas propostas**, não "quem deu match". Isso mantém o foco na escolha da pessoa e evita tratar o 1º colocado como resposta certa.
- Cada virada anuncia via `aria-live`: "Candidato B é Fulano, Partido X, número 00." Face escondida com `aria-hidden`.
- Depois da revelação: lista com nomes (toque abre detalhe com trecho e fonte, como hoje em `ItemDaLista`), "Ler o plano de governo", "Montar meu cartão", "Refazer".

```
┌──────────────────────────────────┐
│ (QUEM É QUEM)                     │
│ Você votou no Candidato B         │
│ ┌──────────────────────────────┐  │
│ │ (B) Seu voto às cegas         │  │  132px, vira sozinho
│ │     FULANO DE TAL        62%  │  │
│ │     Partido · 00              │  │
│ └──────────────────────────────┘  │
│ E os outros:                      │
│ ┌ (A) Candidato A          69% ┐  │  64px cada, viram em sequência
│ ┌ (C) Candidato C          60% ┐  │
├──────────────────────────────────┤
│ [      Revelar os outros       ]  │  → depois: "Montar meu cartão"
└──────────────────────────────────┘
```

### 4.9 Cartão compartilhável

- Imagem gerada no aparelho (canvas 1080×1350, 4:5, bom para WhatsApp e stories): nome do teste, eleição, "O que mais pesa pra mim" (prioridades), resultado às cegas (barras sem nomes e sem números), chamada "Faça o seu", aviso "Não é pesquisa eleitoral nem recomendação de voto".
- Chave "Incluir nomes e percentuais" (`role="switch"`), **desligada por padrão**. Ligada: nomes e % de afinidade. **O voto nunca entra**, em nenhum modo, e o texto da tela diz isso.
- "Compartilhar imagem": Web Share com arquivo (`navigator.canShare({files})`); sem suporte, baixa o PNG. O link de WhatsApp em texto continua como alternativa.
- `alt` da prévia descreve o que vai na imagem.

---

## 5. Mecânicas de diversão e retenção (e limites)

| Mecânica | Como | Limite para não trivializar |
|---|---|---|
| Progresso segmentado | 1 segmento por cena; atual meio cheio | nada de pontos ou "acertos" |
| Marcos | toast sobre a barra: "Metade! Faltam 5" (na cena ⌈N/2⌉) e "Última! Depois vem o resultado"; `role="status"` | 1 vez cada; some em 2,4 s; nunca comenta a escolha |
| Reação curta | rótulo do chip: "Anotado", "Registrado", "Guardado"; "Trocado" na troca | nunca avalia ("boa!", "acertou", "a maioria escolheu") |
| Microanimações | ✓ com pop (220 ms), chip do fato sobe (250 ms), cenas deslizam (280 ms), barras enchem (700 ms), cartas viram (600 ms) | todas ≤ 700 ms, nenhuma em loop |
| Contagem para a revelação | 3-2-1 em 2,4 s | só depois do voto |
| Revelação tipo Wrapped | resumo em 2 cartões + virada de cartas começando pelo voto da pessoa | sem ranking comemorado; empate dito como empate |
| Resultado compartilhável | cartão-imagem sem voto, nomes opcionais | padrão sem nomes |
| Tempo honesto | intro com tempo real; "faltam ~2 min" no marco da metade | não prometer menos do que é |

Fora de propósito: sequências (streaks), níveis, emblemas, som, vibração, confete, "X% das pessoas escolheram igual a você" (sugere que há resposta certa e exige coletar dados).

---

## 6. Movimento

| Elemento | Duração | Curva | Com `prefers-reduced-motion` |
|---|---|---|---|
| ✓ da opção | 220 ms | pop (0,4 → 1,18 → 1) | aparece direto |
| Chip do fato | 250 ms | sobe 8 px + fade | aparece direto |
| Troca de cena | 280 ms | desliza 28 px + fade | troca direto |
| Segmento do progresso | 350 ms | ease-out | direto |
| Folha | 260 ms | sobe de 100% | aparece direto |
| Barras do resultado | 700 ms, 180 ms entre linhas | cubic-bezier(.2,.8,.2,1) | valor final direto |
| Contagem | 3 × 800 ms | escala 0,5 → 1,1 → 1 | pulada |
| Virada de carta | 600 ms, 420 ms entre cartas | cubic-bezier(.3,.7,.2,1) | troca direto, anúncio igual |

O CSS atual (`transition: none; animation: none` global em `reduce`) serve; os tempos no JS (auto-avanço, contagem, sequências) também têm que ler `matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 7. Acessibilidade (WCAG 2.2 AA)

| Critério | Regra no novo fluxo | Hoje |
|---|---|---|
| 1.3.1 / 4.1.2 Estrutura | cena = `fieldset` + `legend` + radios nativos; perfil/prioridades = `button[aria-pressed]` em `role="group"` com rótulo; folha = `dialog` modal; revelação com `aria-hidden` na face oculta | botões soltos, sem grupo |
| 1.3.2 Ordem de leitura | topo → cena → pergunta → opções → dica/fato → ← → ação; DOM na mesma ordem visual | ok |
| 1.4.3 Contraste de texto | `tinta-suave`/papel 6,99:1; branco/`mar` 5,79:1; texto em coral usa `#b83f1a` (5,58:1) e em verde `#257a4a` (5,3:1) | ok, exceto se reaproveitar coral/folha em texto |
| 1.4.11 Contraste não textual | contorno de controles `#948b79` (3,37:1 sobre branco); foco `mar` 5,46:1 sobre papel | contorno 1,32:1 |
| 1.4.10 Reflow / 1.4.4 texto 200% | doca deixa de ser fixa abaixo de 480 px de altura | n/a |
| 2.1.1 Teclado | radios com setas; atalhos 1 a 4; Esc fecha folha; Tab preso na folha | ok |
| 2.2.2 Pausar | nada avança sozinho por mais de 5 s; histórias só por toque | ok |
| 2.4.3 Ordem de foco / gestão de foco | foco na pergunta a cada cena, no título a cada tela, no título da folha ao abrir e de volta ao chip ao fechar | foco fica no nada |
| 2.4.7 / 2.4.11 Foco visível e não coberto | `outline` 3 px `mar` com 2 px de afastamento (inclusive no cartão da opção via `:has(input:focus-visible)`); `scroll-padding-bottom` = altura da doca | ok / n/a |
| 2.5.7 Arrastar | fechar folha por arraste sempre com botão "Fechar" | n/a |
| 2.5.8 Tamanho do alvo (e meta do projeto: 44 px) | opções ≥ 48, botões 52, links 44, chips 52 | 20 a 40 px em 5 alvos |
| 3.2.2 Na entrada | perfil avança ao tocar com aviso na tela; cena **não** avança ao escolher | ok |
| 3.3.1 / 3.3.3 Erro | erros de prioridades e voto em texto, perto da ação, com sugestão | n/a |
| 3.3.7 Entrada redundante | Voltar preserva tudo; recarregar retoma | perde tudo |
| 4.1.3 Mensagens de status | `aria-live="polite"`: "Situação 5 de 11", "Anotado", "Resposta trocada", "2 de 3 escolhidos", marcos, "Revelando os nomes", cada nome revelado | nenhuma |

---

## 8. Notas para quem for implementar

- Compatível com a máquina de estados de `D-tecnica.md` §2.1: "escolher/trocar" = `ESCOLHER`, "Próxima" = `CONFIRMAR`, "Nenhuma dessas" = `PULAR` (grava `null`), "←" = `VOLTAR`. Se a pessoa voltar ao perfil e mudar algo que troca as cenas sorteadas, as respostas das cenas que continuam ficam; as novas entram sem resposta.
- Respostas como `Record<perguntaId, opcaoId | null>`; ordem sorteada como `Record<perguntaId, opcaoId[]>`; os dois no `Quiz`, persistidos em `sessionStorage` por eleição.
- `calcularResultados` recebe a lista derivada do mapa (sem mudar a matemática).
- Uma casca de layout (`TelaFixa`: topo, meio, doca) usada por perfil, prioridades, cena, resultado e voto.
- Rotas por etapa com `history.pushState`/hash; o `hashchange` do `App` passa a ler subcaminhos.
- `data-testid` sugeridos: `cena-avancar`, `cena-voltar`, `fato-chip`, `fato-folha`, `progresso`, `resultado-votar`, `voto-confirmar`, `carta-<letra>`.
- Fontes: o protótipo carrega Nunito Sans e Bricolage do `node_modules` do repositório. Sem elas (fonte do sistema, mais larga) a cena de tamanho máximo estourava 95 px: os testes precisam rodar com as fontes do app carregadas.

---

## 9. Critérios de aceite (Playwright)

Rodar em 360×640 e 390×844, `isMobile`, com as duas eleições reais, **em todas as cenas sorteáveis** (perfil vazio e ao menos um perfil por região para cobrir variantes).

**Cena**

- A1. Antes de escolher: `document.documentElement.scrollHeight <= viewport.height`.
- A2. Antes de escolher: `#meio.scrollHeight <= #meio.clientHeight` (nenhuma rolagem interna) em todas as cenas reais. Se falhar, o relatório lista a cena e quantos px faltam, para o agente de texto.
- A3. Depois de escolher: a caixa de `getByTestId('cena-avancar')` fica inteira dentro da viewport (`y >= 0 && y + height <= viewport.height`).
- A4. Depois de escolher: `scrollHeight` igual ao de antes (nada cresce).
- A5. Escolher a opção 1 e depois a 3: só a 3 fica `checked`; a 1 continua `enabled`.
- A6. Tocar de novo na escolhida desmarca e o botão volta a "Nenhuma dessas".
- A7. Com uma opção marcada, `getByTestId('fato-chip')` está visível; ao clicar, `getByRole('dialog')` fica visível e a caixa de `cena-avancar` não muda de `y`.
- A8. Com a folha aberta, Esc fecha e o foco volta para `fato-chip`; Tab não sai da folha.
- A9. Na cena k, escolher, avançar e clicar em `cena-voltar`: a mesma opção está `checked`, a ordem das opções (`data-op`) é idêntica, e `progresso` tem `aria-valuenow = k`.
- A10. Voltar do sistema (`page.goBack()`) numa cena leva à cena anterior, não à home.
- A11. Recarregar numa cena (`page.reload()`) volta na mesma cena com a resposta marcada.
- A12. A cada troca de cena, `document.activeElement` é a pergunta da nova cena e a região `aria-live` contém "Situação k de N".
- A13. Na cena ⌈N/2⌉ aparece `role=status` com "Metade"; na última, "Última". Voltar e avançar de novo não repete.
- A14. Todos os `button`, `a`, `label.opcao` visíveis têm caixa ≥ 44×44.
- A15. Com `reducedMotion: 'reduce'`, `getAnimations()` nas opções e na cena retorna só animações com duração ≤ 1 ms.

**Perfil e prioridades**

- B1. Cada tela de perfil sem rolagem (A1) a 360×640.
- B2. Tocar numa resposta do perfil avança em ≤ 600 ms e o contador passa de k/6 para k+1/6; Voltar mostra a resposta marcada (`aria-pressed=true`).
- B3. Prioridades: o 4º toque não marca nada e exibe o texto de "Máximo de 3"; os 3 marcados continuam `aria-pressed=true`.

**Resultado, voto e revelação**

- C1. A 360×640, "Votar às cegas" (`resultado-votar`) visível sem rolar e ao menos 5 linhas de candidato visíveis (ou todas, se forem menos).
- C2. Tocar numa linha abre `dialog` sem nomes, sem `blockquote` e sem link de fonte.
- C3. "Confirmar e revelar" sem escolha mostra `role=alert` e não sai da tela.
- C4. Após votar no Candidato X, a 1ª carta é a de X e, depois da sequência, mostra o nome dele; as demais só viram depois de "Revelar os outros".
- C5. Com movimento reduzido, a tela de contagem não aparece (vai direto à revelação).
- C6. O cartão gerado não contém o voto: com a chave desligada, o texto desenhado não tem nenhum nome de candidato (verificar com a função de desenho exposta para teste ou pelo `alt`); com a chave ligada, tem nomes e %, mas não a palavra "votei" nem destaque ao candidato votado.
- C7. "Prefiro não votar" leva à revelação sem carta de destaque.

Os critérios A1 a A5, A7, A9, C1, C3 já rodam contra o protótipo em `pipeline/ux/capturas/testar-prototipo.mjs` e passam nos dois tamanhos.

---

## 10. Protótipo

`pipeline/ux/prototipo-fluxo.html` (HTML, CSS e JS inline; sem rede; fontes do app lidas do `node_modules` do repositório, com recuo para a fonte do sistema).

- Tela larga: bancada à esquerda com tamanho (360×640, 390×844, livre), simulação de movimento reduzido, atalhos para Cenas e Resultado, e o roteiro do que testar. Celular: tela cheia.
- Conteúdo: intro, 2 perguntas de perfil, prioridades, 3 cenas fictícias neutras (transporte, saúde, escola; a de saúde tem o tamanho máximo de texto do quiz real), "Comparando…", 2 cartões de resumo, resultado às cegas com detalhe em folha, voto com estado de erro, contagem, revelação começando pelo voto, cartão compartilhável com a chave de nomes.
- Candidatos, partidos, números e fatos são fictícios e estão marcados como tal.
- Para testar no celular é preciso servir a pasta do repositório (ex.: `npx vite preview` não serve `pipeline/`; usar `npx serve .` ou publicar como página); aberto fora do repositório ele funciona com a fonte do sistema.
