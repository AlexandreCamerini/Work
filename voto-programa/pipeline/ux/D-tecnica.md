# D · Preparação técnica para a refatoração de UX

Data: 25/09/2026. Base: commit `07ec359`. Nada em `src/`, `server/` nem nos dados foi alterado.
Artefatos desta etapa, todos em `pipeline/ux/`:

- `D-tecnica.md`: este documento.
- `e2e-proposta.spec.ts`: esqueleto da suíte E2E (§5). Roda no Playwright e é pulado no Vitest.
- `gerar-golden.ts` e `golden-baseline.json`: linha de base do comportamento travado (§6).

Como medi: `tsc -b` e `vite build` com saída no scratchpad, para não tocar no `dist/` do projeto; um relatório de tamanho por módulo; um build experimental numa cópia do projeto, com os dados carregados sob demanda; `vite preview` com Playwright 1.56.1 (Chromium 1194 de `/opt/pw-browsers`), `@axe-core/playwright` instalado fora do projeto e axe com as regras WCAG 2.2 AA e best-practice, a 390×844 e a 360×640, nas duas eleições. `npm test`: 4 arquivos, 49 testes, tudo verde.

---

## 1. Arquitetura atual

### 1.1 Mapa de dependências

```
index.html → src/main.tsx ── @fontsource-variable/{bricolage-grotesque,nunito-sans}/wght.css (todos os subsets)
                 └─ App.tsx  (rota = location.hash; home inline)
                     ├─ data/index.ts ── quiz.json, aderencia.json, evidencias.json           (governador-rj)
                     │                ├─ quiz-presidente.json, aderencia-…, evidencias-…     (presidente)
                     │                ├─ candidatos.ts, candidatos-presidente.ts
                     │                └─ ../../pipeline/acompanhamento/lula-2022.json  (só com VITE_PUBLICAR_ACOMPANHAMENTO)
                     ├─ components/Acompanhamento.tsx   (entra no bundle mesmo com a área desligada)
                     └─ components/Quiz.tsx  (máquina de etapas implícita, 5 useState)
                          ├─ Intro.tsx            ← lib/perfil (selecionarCenas p/ contar "São N")
                          ├─ SobreVoce.tsx        ← lib/perfil (PERFIL_VAZIO); perfil em estado local
                          ├─ Prioridades.tsx      (estado local, máx. 3)
                          ├─ Cena.tsx             ← lib/ordem (embaralhar no useMemo); `escolha` local
                          └─ Resultados.tsx       ← lib/matching, lib/votacao, config (RESPONSAVEL)
                               └─ Votacao.tsx (EscolhaVoto) ← lib/votacao
                                    └─ Turnstile.tsx (script externo da Cloudflare, só com coleta ligada)
lib/matching.ts  calcularResultados, pontoNaCena, encaixe, encaixesDoCandidato   (TRAVADO)
lib/perfil.ts    PERFIL_VAZIO, estimarFaixa, selecionarCenas                     (TRAVADO)
lib/ordem.ts     embaralhar, misturarTemas (sorteio injetável)
lib/votacao.ts   lerEstado (/api/estado), enviarVoto (/api/votos), textos de aviso
server/app.ts    GET /api/estado → {coleta, contaCandidato, turnstileSiteKey}; POST /api/votos → 204/403/429/400
```

Estado de hoje (`Quiz.tsx`): `etapa` ('intro'|'perfil'|'prioridades'|'cenas'|'resultado'), `cenas: Pergunta[]` (sorteadas ao sair do perfil), `prioridades: string[]`, `respostas: Resposta[]` (append) e `indice`. O perfil só existe dentro de `SobreVoce`; a escolha da cena só existe dentro de `Cena`. Em `Resultados` ficam `estado` (API), `revelado`, `voto` e `copiado`; em `EscolhaVoto`, `escolha`, `token` e `enviando`.

### 1.2 Cheiros

| # | Onde | Problema | Consequência para a refatoração |
|---|---|---|---|
| 1 | `Quiz.tsx` | Etapas implícitas e transições espalhadas em callbacks. `respostas` só cresce (`[...r, nova]`) | Não há Voltar nem edição. Reeditar com append duplicaria a resposta e a cena contaria duas vezes em `calcularResultados` |
| 2 | `Cena.tsx` | A escolha é local e os botões ficam `disabled` depois do toque | Não dá para trocar a resposta. O foco cai no `<body>` (medido, ver §4) |
| 3 | `Cena.tsx` | `embaralhar(pergunta.opcoes)` roda no `useMemo` do componente montado | Com Voltar, as opções mudariam de ordem a cada visita. A ordem precisa ir para o estado |
| 4 | `SobreVoce.tsx` | O perfil fica no componente e se perde ao sair | Voltar ao perfil apagaria as respostas. Mudar o perfil precisa recalcular as cenas sem perder as respostas das que continuam |
| 5 | `Resultados.tsx` (12,5 KB) | Mistura fetch de `/api/estado`, voto, revelação, texto de compartilhar, clipboard, regra de consenso (`nota >= 70` para todos) e rótulos A/B/C (a letra é calculada em dois lugares) | Separar o que é regra (seletor puro e testável) do que é apresentação |
| 6 | 5 arquivos | Classe do CTA primário copiada 5 vezes. Chip de alternar copiado 4 vezes. O contêiner `mx-auto max-w-xl px-4 pt-12 pb-16` se repete em toda tela | O rebrand teria de passar por todos. Criar `Botao`, `Chip`, `OpcaoRadio` e `TelaFixa` |
| 7 | Todas as telas | `<section>` sem `<main>`. A cena não tem `<h1>`. O foco não é tratado entre etapas | É a origem das violações do axe (§4) |
| 8 | `App.tsx`, `Quiz.tsx` | `window.scrollTo` em 3 lugares. As etapas não entram no histórico | No Android, o botão Voltar do sistema sai do quiz e perde tudo |
| 9 | `data/index.ts` | Importa estaticamente os 6 JSON das duas eleições, mais um JSON de `pipeline/` (fora do `include` do tsconfig) | 713 KB de JS no primeiro carregamento (§3) |
| 10 | `Intro.tsx` | "São N situações" usa `PERFIL_VAZIO`, mas o N real depende do perfil (11 a 12) | Texto inexato. Melhor dizer "cerca de N" ou calcular depois do perfil |
| 11 | Testes | Só lógica e integridade de dados, e todos em jsdom (57% do tempo é criar o ambiente). Nenhum teste de componente nem E2E, embora o testing-library esteja instalado. Os testes importam `data/index.ts`, que usa `import.meta.env` | O carregamento sob demanda quebra esses imports. Os testes de lógica devem ler os JSON direto ou usar o novo carregador com `await` |

O que está bom e deve ficar: `lib/` é pura, determinística e testada, com sorteio injetável em `ordem.ts`. Os testes de integridade (toda opção avaliada, toda nota com evidência e URL https, `versao_quiz` batendo) são a melhor rede de segurança do projeto. A privacidade também: fontes locais, CSP estrita e nenhuma requisição externa no fluxo (medido).

---

## 2. Arquitetura proposta

### 2.1 Máquina de estados do fluxo

```
abertura ──COMECAR──▶ perfil[0..n-1] ──CONFIRMAR/PULAR──▶ prioridades ──CONFIRMAR/PULAR──▶ cena[0..N-1] ──CONFIRMAR(última)──▶ resultado ──VOTAR→REVELAR──▶ revelado
    ▲                      │ VOLTAR ▲                         │ VOLTAR ▲                    │ ESCOLHER/TROCAR (fica)          │ VOLTAR (volta à última cena)
    └──────REINICIAR───────┴────────┴─────────────────────────┴────────┴────────────────────┴─ PULAR (resposta=null, avança) ─┘
```

```ts
// src/fluxo/maquina.ts: puro, sem React, sem Math.random, sem window
type Etapa =
  | { tipo: 'abertura' }
  | { tipo: 'perfil'; passo: number }       // uma pergunta por tela: cabe sem rolagem
  | { tipo: 'prioridades' }
  | { tipo: 'cena'; indice: number }
  | { tipo: 'resultado' }                    // às cegas
  | { tipo: 'revelado'; voto: { candidatoId: string | null; resultado: ResultadoVoto } }

interface EstadoFluxo {
  etapa: Etapa
  perfil: Perfil                             // começa em PERFIL_VAZIO
  prioridades: string[]                      // [] = pulou (mesma semântica de hoje)
  cenas: string[]                            // ids na ordem sorteada, fixada ao sair do perfil
  ordemOpcoes: Record<string, string[]>      // embaralhar(), fixado por cena
  respostas: Map<string, string | null>      // cenaId → opcaoId; null = pulou; ausente = não vista
}

type Evento =
  | { tipo: 'COMECAR' }
  | { tipo: 'ESCOLHER'; valor: string }      // perfil: campo do passo; prioridades: alterna; cena: grava no Map
  | { tipo: 'CONFIRMAR'; sorteio?: { cenas: string[]; ordemOpcoes: Record<string, string[]> } }
  | { tipo: 'PULAR' }                        // perfil: campo=null; prioridades: []; cena: set(id, null); sempre avança
  | { tipo: 'VOLTAR' }
  | { tipo: 'VOTAR_ENVIADO'; candidatoId: string | null; resultado: ResultadoVoto } // efeito fora, fato dentro
  | { tipo: 'REVELAR' }                      // "prefiro não votar"
  | { tipo: 'REINICIAR' }
```

Regras da máquina:

- **ESCOLHER e TROCAR são o mesmo evento.** Na cena, `ESCOLHER` faz `new Map(respostas).set(cenaId, opcaoId)`. Nada fica desabilitado. O "Você sabia?" aparece quando `respostas.get(id)` é uma string. `CONFIRMAR` só avança, e só se houver escolha (a guarda `podeAvancar`).
- **VOLTAR** nunca apaga nada. Da cena 0 vai para prioridades, e do resultado vai para a última cena. Do `revelado` não há Voltar, porque o voto já foi mostrado e voltar ao "às cegas" não faz sentido.
- **Ao sair do perfil** (`CONFIRMAR` no último passo), o hook calcula `selecionarCenas(quiz.perguntas, perfil)`. Se o conjunto de ids for o mesmo do estado atual, mantém a ordem e as respostas. Se mudou, sorteia a nova ordem com `misturarTemas` e `embaralhar` e manda o resultado no payload `sorteio`, para o reducer continuar puro. As respostas de cenas que continuam na seleção ficam, e as que saíram são removidas do Map.
- **Seletor `respostasOrdenadas(estado)`** = `estado.cenas.filter(id => typeof respostas.get(id) === 'string').map(id => ({ perguntaId: id, opcaoId }))`. Isso reproduz exatamente o array de hoje: ordem das cenas, sem as puladas. É o que vai para `calcularResultados` e `encaixesDoCandidato`, sem mudança nenhuma em `lib/` (ver §6 sobre a ordem).
- Efeitos ficam fora do reducer, em `useFluxo`: `lerEstado()`, `enviarVoto()`, scroll, foco e histórico.

### 2.2 Onde guardar: `useReducer`, sem dependência nova

- **`useReducer(reduzir, eleicao, estadoInicial)`** dentro de `useFluxo(eleicao)`. A máquina tem 6 estados e 8 eventos, e um reducer com `switch (estado.etapa.tipo)` é legível e testável com Vitest em ambiente `node`, sem DOM. XState ou Zustand acrescentariam de 15 a 40 KB e uma curva de aprendizado sem ganho, porque não há estados paralelos, timers nem atores.
- **Context só para leitura:** `FluxoContext` com `{ estado, enviar, eleicao }`, e as telas consomem com `useFluxo()`. Isso acaba com o prop drilling (`Resultados` recebe 5 props hoje).
- **Map no estado:** toda escrita cria um Map novo. Se um dia houver persistência, serializar com `[...map]`.
- **Histórico:** cada transição de etapa faz `history.pushState({ passo }, '', location.hash)`, e o `popstate` dispara `VOLTAR`. Assim o botão Voltar do Android funciona e o hash continua sendo `#governador-rj`, sem deep link para o meio do fluxo, que não teria estado.
- **Persistência:** nenhuma por padrão (a promessa é "nada sai do aparelho"). Se o produto quiser retomar depois de recarregar a página, usar `sessionStorage` com try/catch. A informação continua no aparelho.
- **Foco:** a cada troca de etapa ou de cena, `h1.focus()` (com `tabIndex={-1}`), e um `aria-live="polite"` anuncia "Cena 3 de 11".

### 2.3 Estrutura de pastas

```
src/
  main.tsx                    importa ./estilo/fontes.css (latin + latin-ext) e ./estilo/index.css
  app/App.tsx                 rota por hash, Suspense, tela de erro de carregamento
  app/rotas.ts                parse do hash (eleição | acompanhamento | home)
  data/manifesto.ts           [{ id, nome, nCandidatos, primeiroTurno }]: único dado no bundle inicial
  data/carregar.ts            carregarEleicao(id): Promise<Eleicao> por import() dinâmico
  data/*.json, candidatos*.ts (sem mudança)
  fluxo/maquina.ts            tipos, reduzir(), estadoInicial()
  fluxo/seletores.ts          respostasOrdenadas, progresso, podeAvancar, cenaAtual, consensos, rotuloAsCegas
  fluxo/useFluxo.ts           useReducer + efeitos (histórico, foco, API)
  fluxo/maquina.test.ts       transições (ambiente node)
  lib/                        matching.ts, perfil.ts, ordem.ts, votacao.ts: SEM MUDANÇA
  telas/Abertura.tsx  PerfilPasso.tsx  Prioridades.tsx  Cena.tsx  Resultado.tsx  Revelado.tsx
  telas/Acompanhamento.tsx    lazy
  ui/TelaFixa.tsx  Topo.tsx  Rodape.tsx  Botao.tsx  OpcaoRadio.tsx  Chip.tsx  Nota.tsx  BarraProgresso.tsx
  estilo/tokens.css           @theme do rebrand
  estilo/fontes.css
e2e/fluxo.spec.ts             (de pipeline/ux/e2e-proposta.spec.ts)
playwright.config.ts
```

Nota: `data/index.ts` deixa de importar `pipeline/acompanhamento/lula-2022.json` estaticamente. Esse arquivo passa para `import()` dentro do `if` da flag, ou é copiado para `src/data/`.

### 2.4 Layout de tela sem rolagem

```tsx
// ui/TelaFixa.tsx
export function TelaFixa({ etapa, topo, rodape, children }: Props) {
  return (
    <div className="grid h-screen h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-papel">
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">{topo /* Voltar + BarraProgresso */}</header>
      <main data-etapa={etapa} className="mx-auto w-full max-w-xl overflow-y-auto overscroll-contain px-4 py-3">
        {children}
      </main>
      <footer className="border-t border-linha bg-papel px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl">{rodape /* CTA primário + ação secundária (Pular) */}</div>
      </footer>
    </div>
  )
}
```

- No `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Sem `viewport-fit=cover`, `env(safe-area-inset-*)` vale 0 no iOS.
- `h-screen h-dvh`: a segunda classe sobrescreve a primeira onde há suporte, e navegadores antigos ficam com 100vh. O `dvh` acompanha a barra de endereço do Safari e do Chrome.
- A linha do meio é `minmax(0,1fr)` com `overflow-y-auto`. Se o conteúdo não couber (360×640 com a cena mais longa), a rolagem fica só no meio e **o CTA continua fixo e visível**. Esse é o critério testado no E2E. Mostrar uma sombra no rodapé quando houver conteúdo abaixo, para indicar que a área rola.
- Medido hoje, depois de escolher uma opção: o botão "Próxima" termina entre 882 e 993 px (390×844) e entre 795 e 1026 px (360×640). Fica fora da tela em **23 de 23 cenas** a 390×844 (11 do governador e 12 de presidente) e nas 11 do governador a 360×640. O "Continuar" do perfil está em 1380 a 1480 px. Uma cena com 4 ou 5 opções não cabe em 640 − topo − rodapé (uns 480 px) com a tipografia atual. É preciso escolher entre (a) opções compactas (`text-base`, `py-3`, até 2 linhas) com o "Você sabia?" recolhido em `<details>` ou numa folha inferior, e (b) aceitar rolagem só no meio. O E2E cobre as duas, porque mede o CTA e não a altura do documento.
- `Rodape` recebe `acao` (CTA) e `secundaria` (Pular). Os alvos de toque têm pelo menos 44 px de altura, acima do mínimo de 24 px da WCAG 2.2.

---

## 3. Performance

### 3.1 Bundle hoje (`vite build`, Vite 8.3 / Rolldown)

| Arquivo | min | gzip |
|---|---:|---:|
| `index-*.js` (um único chunk) | **713,0 KB** | **174,8 KB** |
| `index-*.css` | 20,1 KB | 4,8 KB |
| 8 × woff2 (2 fontes × latin, latin-ext, cyrillic, cyrillic-ext, vietnamese) | 175,0 KB no dist | — |

O que pesa no JS, por módulo, antes da minificação:

| Módulo | KB | gzip KB |
|---|---:|---:|
| react-dom-client (+ react, scheduler) | 548 | 105 |
| `evidencias.json` (governador) | 184 | 40 |
| `aderencia.json` (governador) | 138 | 23 |
| `evidencias-presidente.json` | 52 | 13 |
| `quiz.json` | 38 | 10 |
| `quiz-presidente.json` | 32 | 9 |
| `aderencia-presidente.json` | 27 | 5 |
| Todo o código do app (`components/`, `lib/`, `candidatos*.ts`) | ~60 | ~20 |

Os **dados somam cerca de 470 KB minificados, 66% do JS**, e todos são baixados e parseados antes da home aparecer, mesmo quem só vai jogar uma eleição. `Acompanhamento.tsx` (7 KB) entra no bundle mesmo com a área desligada.

### 3.2 Dados sob demanda (medido num build experimental no scratchpad)

A troca feita na cópia: `data/index.ts` passou a exportar só um `resumos` (id, nome, número de candidatos) e um `carregarEleicao(id)` com `Promise.all([import('./quiz.json'), import('./aderencia.json'), import('./evidencias.json')])`, e `Quiz` virou `lazy()`. Resultado real do build:

| Chunk | min | gzip |
|---|---:|---:|
| **`index` (JS inicial: React + App + manifesto + lib)** | **234,0 KB** | **73,1 KB** |
| `Quiz` (telas do fluxo, Resultados, Votacao) | 25,9 | 8,3 |
| `quiz` (governador) | 33,6 | 9,7 |
| `aderencia` (governador) | 132,5 | 22,9 |
| `evidencias` (governador) | 182,9 | 40,5 |
| `quiz-presidente` | 28,9 | 8,7 |
| `aderencia-presidente` | 25,8 | 4,7 |
| `evidencias-presidente` | 52,1 | 12,8 |

Isso dá **−67% no JS inicial (713 → 234 KB; gzip 175 → 73 KB)**. Proposta de carregamento em três ondas por eleição:

1. **Home:** só o chunk `index`, 234 KB (73 KB gz).
2. **Abrir a eleição:** `Quiz` + `quiz*.json`. Governador +59 KB (18 KB gz), presidente +55 KB (17 KB gz). Isso basta para jogar.
3. **Durante as cenas:** `aderencia*.json` em prefetch (`import()` disparado ao entrar na primeira cena, já que só é usado no resultado). **Ao revelar:** `evidencias*.json`, porque justificativas e trechos só aparecem depois do voto (`ItemDaLista` com `revelado`). Para o governador isso tira 183 KB do caminho crítico.

Cuidados: `carregarEleicao` precisa de estado de carregando e de erro ("Não deu para carregar. Tentar de novo"), porque a rede do celular falha. `Eleicao.evidencias` passa a chegar depois, então `Resultados` recebe `evidencias` de um `use()` ou de um hook próprio. Em `manifesto.ts`, `nCandidatos` vem de `candidatos*.ts` (1,5 a 5 KB, pode ficar no inicial). Os testes que hoje importam `data/index.ts` passam a importar os JSON direto ou a usar `await carregarEleicao(id)`.

Ganho extra, opcional: React é 70% do inicial. Trocar por Preact/compat economizaria cerca de 150 KB, mas é dependência nova e traz risco com o React 19. **Não recomendo agora.**

### 3.3 Fontes

- Hoje, `@fontsource-variable/*/wght.css` declara 5 subsets por família, e o build copia 8 woff2 (175 KB) e cerca de 1,5 KB de `@font-face` para o CSS.
- **Medido no navegador:** por causa do `unicode-range`, o Chromium baixou **só os 2 arquivos latin** (Bricolage 41 KB + Nunito Sans 31 KB = 72 KB) em todo o fluxo, nas duas eleições. Todo o texto do app cabe no latin (ç, ã, é, “ ”, —, –, …, ’). ✓ e ✗ não estão em nenhum subset e caem na fonte do sistema.
- **Proposta:** trocar os dois imports por um `src/estilo/fontes.css` próprio, só com latin e latin-ext (este fica de reserva para nomes próprios com ł, ő etc.), apontando para `@fontsource-variable/<família>/files/<família>-{latin,latin-ext}-wght-normal.woff2`. O arquivo exato está validado no build experimental. Resultado: o dist cai de 8 para 4 woff2 (−57 KB) e o CSS de 20,1 para 18,6 KB. **Na rede não muda nada**: o ganho é de higiene e de deploy.
- O ganho real de percepção vem de outro lugar: `<link rel="preload" as="font" type="font/woff2" crossorigin>` para os dois latin, via plugin do Vite ou `import url from '…woff2?url'`, e `size-adjust`/`ascent-override` num `@font-face` de fallback para reduzir o CLS do `font-display: swap`. Se o rebrand trocar as famílias, aplicar a mesma regra: variável, só `wght`, latin + latin-ext.

---

## 4. Acessibilidade (axe-core 4.x, Chromium, 390×844 e 360×640, duas eleições)

Telas auditadas: home, abertura, perfil, prioridades, cena antes da escolha, cena depois da escolha, resultado às cegas, voto escolhido e revelado. Nenhum erro de console. Nenhuma requisição fora da origem (o `/api/estado` do `vite preview` devolve HTML, e o app cai corretamente em `SEM_API`).

### 4.1 Violações do axe

| Severidade | Regra | Telas | Seletor | Correção |
|---|---|---|---|---|
| serious* | `color-contrast` 3,03:1 (#d9dbdf sobre #36859c) | voto escolhido (360×640 e presidente 390×844) | `.border-mar.px-3[role="radio"]` | *Artefato: medido no meio da `transition` de cor. Em repouso, branco sobre `mar` dá 5,79:1. Correção: no E2E, `reducedMotion: 'reduce'`. No design, transicionar só `transform`/`box-shadow`, não cor |
| moderate | `landmark-one-main` | todas, menos a home | `html` | `TelaFixa` renderiza `<main>`. Hoje cada tela é um `<section>` solto |
| moderate | `region` (conteúdo fora de landmark) | todas, menos a home (até 23 nós no revelado) | `header`, `h1`, `article:nth-child(n) > .p-5…`, `fieldset > legend` | Mesma correção: `<header>`, `<main>` e `<footer>` do `TelaFixa` |
| moderate | `page-has-heading-one` | cena (antes e depois da escolha) | `html` | Na cena, o texto da pergunta vira o `<h1>` (hoje é `<h2>`) e a situação vira um `<p>` antes dele. O `h1` recebe `tabIndex={-1}` para receber foco |

### 4.2 Problemas que o axe não pega (verificados com Playwright)

| Severidade | Critério WCAG | Onde | Problema medido | Correção |
|---|---|---|---|---|
| serious | 2.4.3 e 4.1.3 | `Cena.tsx` | Depois de escolher com o teclado, `document.activeElement` vira `BODY`, porque o botão escolhido fica `disabled`. Depois de "Próxima" e em toda troca de etapa, o foco também fica no `BODY` e o leitor de tela não sabe que a tela mudou | Não desabilitar opções. Na troca de etapa, `h1.focus()` e `aria-live` com "Cena N de M" |
| serious | 4.1.2 | `Cena.tsx` | As opções são `<button>` sem `aria-pressed`/`aria-checked`, e a seleção só é comunicada pela cor | `fieldset` + `legend` e `<input type="radio">` nativo estilizado (`OpcaoRadio`), ou `role="radiogroup"` com `aria-checked` e setas |
| serious | 3.3.4 e usabilidade | `Cena.tsx` | Não dá para trocar a resposta depois de escolher, e não há Voltar | Máquina da §2 |
| moderate | 4.1.2 | `Votacao.tsx` | `role="radio"` em `<button>`: cada opção é uma parada de Tab e as setas não funcionam (o padrão ARIA fica incompleto) | Rádios nativos ou roving tabindex |
| moderate | 4.1.3 | `Cena.tsx` | O "Você sabia?" aparece depois da escolha sem ser anunciado | `role="status"` no contêiner ou foco explícito |
| moderate | 2.4.2 | `index.html` | O `<title>` é sempre o mesmo em todas as rotas e etapas | `document.title = "Cena 3 de 11 · Governador RJ · …"` no `useFluxo` |
| moderate | 1.3.1 | `Resultados.tsx` | O nome do candidato é um `<p>` dentro do `<article>`, sem heading | `<h2>` em cada cartão |
| minor | 1.3.1 | `Resultados.tsx` | O resumo "(3 ✓ · 2 ✗)" é lido como símbolos, e os glifos não existem na fonte | Texto para leitor de tela ("3 atendem, 2 não atendem") e ícone com `aria-hidden` |
| minor | 3.2.5 (AAA) / G201 | links "Fonte:", evidências, plano | `target="_blank"` sem aviso | "(abre em nova aba)" em `sr-only` |
| minor | 1.4.3 | `Acompanhamento.tsx` (desligado em produção) | Texto `text-xs` branco sobre `coral` dá 3,68:1 e sobre `folha` 4,25:1 | Escurecer os tokens no rebrand (meta ≥ 4,5:1) |
| info | 1.4.3 (isento) | `Cena.tsx` | Opções não escolhidas com `opacity-60` ficam com ~2,9:1. É isento por estar `disabled`, mas vai sumir com a correção acima | — |

Tabela de contraste dos tokens atuais, para o rebrand: branco sobre `mar` 5,79 · `tinta-suave` sobre `papel` 6,99 · `mar-escuro` sobre `mar-claro` 7,46 · `tinta` sobre `sol` 10,41 · branco sobre `folha` **4,25** · branco sobre `coral` **3,68** · borda `linha` sobre `papel` **1,24**. A borda é o único indicador do estado não selecionado de opções e chips e precisa de ≥ 3:1 (1.4.11).

---

## 5. Testes

### 5.1 Suíte atual (`npm test`: 4 arquivos, 49 testes, ~3 s, verde)

- `lib/matching.test.ts`: regras de afinidade com dados sintéticos (ordenação, ausência de proposta, peso das prioridades, centragem e cobertura mínima) mais a integridade dos dados publicados. **Forte.**
- `lib/perfil.test.ts`: faixa, seleção por grupo e variantes reais das duas eleições. Forte, mas **frágil por conteúdo**: depende de ids específicos (`plano-voltou-sus`, `barca-leste`…), então uma curadoria nova quebra o teste. Isso é intencional, mas convém dizer no nome do teste que a quebra é esperada quando a curadoria muda.
- `lib/ordem.test.ts`: embaralhamento com LCG determinístico. Bom.
- `server/app.test.ts`: API.
- Lacunas: nenhum teste de componente, fluxo ou acessibilidade. Nenhum teste garante que `Quiz` passa `respostas` na ordem certa, nem que a revelação esconde nomes e fontes antes do voto. Todos rodam em `jsdom` (57% do tempo), e os de `lib/` poderiam usar `// @vitest-environment node`.
- Acoplamento a resolver na refatoração: os testes importam `src/data/index.ts`. Com carregamento sob demanda, passar a importar os JSON direto.

### 5.2 Suíte proposta

1. **Unitários da máquina** (`src/fluxo/maquina.test.ts`, ambiente node): cada evento em cada etapa. ESCOLHER duas vezes deixa uma entrada no Map. VOLTAR preserva. PULAR grava `null`. `respostasOrdenadas` segue a ordem de `cenas`. Trocar o perfil mantém as respostas das cenas que continuam e remove as outras. `podeAvancar` é falso sem escolha.
2. **Golden de comportamento travado** (§6), no CI.
3. **Componentes** (testing-library): `OpcaoRadio` (teclado e `aria-checked`), `Resultado` (nenhum nome, partido nem URL de evidência no DOM antes do voto: é a regra editorial "às cegas").
4. **E2E Playwright**: `pipeline/ux/e2e-proposta.spec.ts`, projetos 360×640 e 390×844, nas duas eleições:
   1. Depois de escolher, o botão de avançar fica **inteiro na viewport e não coberto** (`boundingBox` + `elementFromPoint`) em todas as cenas, sem rolagem horizontal.
   2. Trocar a opção muda a seleção: exatamente um `aria-checked="true"`, as outras continuam habilitadas e as setas funcionam.
   3. Voltar preserva a resposta, permite editar, e o foco vai para o `h1`.
   4. Fluxo completo (perfil respondido, 1 prioridade, cenas com pulos, resultado, revelado) **sem erro de console e sem requisição fora da origem**. `/api/estado` e `/api/votos` são interceptados.
   5. axe (WCAG 2.2 AA) **sem serious/critical** em cada tela, com `reducedMotion: 'reduce'`.

   O contrato que a nova UI precisa expor está no cabeçalho do arquivo: `radiogroup`/`radio`, botões "Continuar | Próxima | Ver meu resultado" e "Voltar", `<main data-etapa>` e `<h1>` por tela. **Validado:** o esqueleto carrega e roda no Playwright 1.56 contra a UI de hoje, e os 20 testes (2 viewports × 2 eleições × 5) falham como esperado, porque a UI atual não cumpre o contrato. No Vitest ele é pulado (`npm test`: 49 passam e 1 é pulado). Ao movê-lo para `e2e/`, excluir `e2e/**` e `pipeline/**` do Vitest e trocar a guarda por import estático.

   O próprio Chromium tenta falar com serviços do Google (android.clients.google.com, www.google.com), e o proxy do ambiente registrou isso. Essas conexões não passam pelo `page.on('request')` e não contam para o critério "sem requisição externa", mas convém lançar com `args: ['--disable-background-networking', '--disable-component-update', '--no-default-browser-check']` para o log ficar limpo.

   Dependências de desenvolvimento a instalar na hora de adotar: `@playwright/test` e `@axe-core/playwright`, com a versão do Playwright casada com o Chromium disponível (1.56.x ↔ chromium-1194). Localmente, `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

---

## 6. Riscos para o que está travado e como garantir

| O que não pode mudar | Risco na refatoração | Garantia |
|---|---|---|
| `preferencia`, ids de cena/opção/tema/grupo, `publico`, `consenso`, ids de candidato | Renomear campo ou id "para o design", ou normalizar o JSON ao mover para carregamento dinâmico | Hash de estrutura no golden. Os JSON só mudam de lugar, nunca de conteúdo. Revisar diff de `src/data/*.json` = zero linhas |
| Tabela de aderência | Mesma coisa. O `versao_quiz` já é testado | Hash de `aderencia.itens` no golden |
| `calcularResultados` / `pontoNaCena` / `encaixe` | (a) Passar respostas de um `Map` em outra ordem. A soma em ponto flutuante depende da ordem e `Math.round` pode virar em x,5. A ordem também muda a lista de `encaixesDoCandidato` na tela. (b) Contar duas vezes a cena reeditada. (c) Tratar "pulou" (`null`) como resposta | `respostasOrdenadas` na ordem de `cenas`, só com strings. `lib/matching.ts` não é tocado. Golden com 42 estratégias × 3 conjuntos de prioridades × 42 perfis nomeados (7 perfis × 6 regiões) por eleição |
| `selecionarCenas` / `estimarFaixa` | Recalcular com um perfil parcial, ou mudar a ordem das perguntas do perfil (a ordem não importa, mas o valor de cada campo sim) | Golden exaustivo: **16.128 perfis por eleição** (todas as combinações dos 6 campos, `null` incluído), com hash da seleção. São 211 conjuntos distintos no governador e 208 em presidente |
| Semântica de prioridades (`[]` quando pula, máximo de 3, peso 2) | Mudar o default para "todas" ou permitir mais de 3 | Teste da máquina e golden (conjuntos `[]`, 1 tema e 3 temas) |
| Aleatoriedade (`misturarTemas`, `embaralhar`) | Ressortear a cada render ou ao voltar | Sorteio feito uma vez, no hook, e guardado no estado. Teste da máquina com sorteio injetado |

**Linha de base já gravada:** `pipeline/ux/golden-baseline.json` (90 KB), gerado agora a partir do `07ec359`:

```
npx tsx pipeline/ux/gerar-golden.ts --conferir   # → "golden OK: comportamento idêntico à linha de base"
```

Validei que ele pega regressões: mudar `PESO_PRIORIDADE` para 3 acusa `perfisNomeados` nas duas eleições, e prefixar as `preferencia` de `quiz.json` acusa `governador-rj.dados`. Depois da refatoração, trocar só a função `carregar()` do script pelo novo carregador e rodar `--conferir`. O ideal é virar um teste do Vitest (`src/lib/golden.test.ts`, lendo o JSON) para rodar no CI a cada PR. Gerar de novo (`sem --conferir`) só quando o conteúdo mudar de propósito (nova curadoria ou aderência revisada), e o diff do JSON entra no PR para revisão.

Ordem segura de execução:

1. Adotar o golden e os testes da máquina antes de mexer em UI.
2. Mover os dados para `import()` (sem mudar a UI) e conferir o golden e os 49 testes.
3. Criar `fluxo/` e as telas novas atrás do mesmo `App`, com o E2E verde nas duas viewports.
4. Rebrand dos tokens, com o axe verde.
