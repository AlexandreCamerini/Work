# E. QA: suíte de aceite do fluxo "Combina?"

Data da execução: 25/09/2026. Base: commit `cde9e7f` (refatoração do app) + as correções listadas abaixo.
Critérios de origem: `plano.md` (seção Verificação) e `B-interacao.md` §9 (A1–A15, B1–B3, C1–C7).

## Resultado

| Verificação | Resultado |
|---|---|
| `npm run test:e2e` (Playwright, 50 testes) | **48 passaram, 2 reprovaram** (os 2 são o mesmo defeito de dado, D1, nos dois tamanhos) |
| `npm test` (Vitest) | 128 passaram |
| `npx tsc -b` (agora inclui `e2e/` e `playwright.config.ts`) | sem erros |
| `npm run lint` | 0 avisos, 0 erros |
| `npx tsx pipeline/ux/gerar-golden.ts --conferir` | "golden OK: comportamento idêntico à linha de base" |
| `python3 pipeline/ux/checar_legibilidade.py` | 0 violações |
| `auditar_vies.py --eleicao governador-rj` (geral, `--regiao leste`, `--regiao interior`) | saída idêntica byte a byte à do commit anterior à refatoração (`a673c21`, rodado num worktree temporário) e aos números de `curadoria-cenas.md`: Leste 1,3% a 21,3%, interior 1,4% a 20,0%, 6 de 8 candidatos em 1º no espelho, Siri e Luan em 2º ou 3º |

A suíte completa rodou 4 vezes (a última já na versão final), sempre com o mesmo resultado, sem flutuação.

## Como rodar

```
npm run test:e2e            # build + D1 local + wrangler dev na porta 8787 (webServer do Playwright)
npx playwright test -g "presidente" --project=360x640
```

- Servidor: runtime real da Cloudflare (`wrangler dev`), que serve `dist/` com os cabeçalhos de `public/_headers`. A CSP de produção vale durante os testes: qualquer violação vira erro de console e reprova.
- API: Worker real com D1 local e `wrangler.jsonc` como está (`COLETA_ATIVA=true`, `CONTAR_CANDIDATO=false`, sem Turnstile).
- Chromium do ambiente em `/opt/pw-browsers/chromium` (ou `PW_CHROMIUM`). Não se usa `playwright install`.
- Projetos: 360×640 e 390×844, `isMobile`, `hasTouch`, `reducedMotion: 'reduce'`, `locale: pt-BR`.
- O limite de 5 votos/min por IP também vale no `wrangler dev`. Para testes em paralelo não se atrapalharem, a fixture repassa o POST `/api/votos` ao Worker real com um `cf-connecting-ip` único por teste. O corpo e a resposta não são tocados.

### Dependências novas (devDependencies)

- `@playwright/test@1.63.0`: executor da suíte de aceite. É a mesma versão do `playwright` que já estava em `node_modules`.
- `@axe-core/playwright@4.13.0`: auditoria WCAG 2.2 AA exigida no plano (critério 6).

Nenhuma das duas entra no bundle do site.

### Arquivos

- `e2e/apoio.ts`: fixture automática `vigia` (critério 5) e passos do fluxo. Os perfis cobrem todas as cenas sorteáveis. As cenas esperadas de cada perfil vêm da mesma `selecionarCenas` do app.
- `e2e/cenas.spec.ts`: critérios 1, 2 e 3 (A1–A13).
- `e2e/fluxo.spec.ts`: critérios 4, 7 e 8 (B2, B3, C1–C7).
- `e2e/a11y.spec.ts`: critério 6 (axe), A14, A15 e B1.
- `playwright.config.ts`, `tsconfig.e2e.json` (referenciado em `tsconfig.json`), script `test:e2e`. `vite.config.ts` agora exclui `e2e/**` e `pipeline/**` do Vitest. `.gitignore` ignora `test-results/` e `playwright-report/`.

## Matriz: critério → teste → resultado

### Suíte obrigatória (pedido do produto)

| # | Critério | Teste | Resultado |
|---|---|---|---|
| 1 | Depois de escolher, "avançar" fica inteiro na viewport e não fica coberto; a página não rola (`scrollHeight ≤ innerHeight`); o botão não se move ao escolher nem ao abrir ou fechar o fato. Vale para todas as cenas percorridas | `cenas.spec` "1. layout estável…", 4 perfis por eleição cobrindo as 26 cenas do RJ e as 22 do presidente | ✅ 16/16 |
| 2 | Trocar muda a seleção; tocar de novo desmarca; Voltar (botão e `history.back`) preserva resposta e ordem; recarregar mantém o progresso | `cenas.spec` "2. trocar, desmarcar, voltar…" | ✅ 4/4 |
| 3 | Folha do fato abre como dialog; Esc fecha; o foco volta ao chip | `cenas.spec` "3. folha do fato…" (também: `:modal`, Tab e Shift+Tab presos, "Fechar" e véu) | ✅ 4/4 |
| 4 | Fluxo completo até o cartão com perfil de região, e as cenas regionais aparecem | `fluxo.spec` "4. …" com RJ Leste (`barca-leste`), RJ interior (`estrada-interior`, `saude-interior`, `encosta-serra`) e presidente Nordeste (`seca-nordeste`) | ✅ 6/6 |
| 5 | Zero erros de console (inclusive CSP) e zero requisições externas | fixture `vigia` automática em **todos os 50 testes**: console `error`, `pageerror`, evento `securitypolicyviolation` e qualquer requisição fora da origem. Sonda manual confirmou que um script inline e uma imagem externa são pegos | ✅ em todos |
| 6 | axe-core em cada etapa sem violação serious ou critical | `a11y.spec` "6. …": home, abertura, perfil, prioridades (com erro), cena, cena escolhida, fato aberto, resumo 1 e 2, resultado, detalhe às cegas, como calculamos, voto (vazio, erro, escolhido), revelação (voto e todos), detalhe revelado, cartão (sem e com nomes) | ✅ 4/4 (depois das correções 1 e 2) |
| 7 | Nenhum nome de candidato visível antes do voto; depois do voto, a primeira carta revelada é a do votado | `fluxo.spec` "7. …" (confere texto e atributos acessíveis em cada etapa, cada fato e cada detalhe; vota no **último** colocado) | ❌ RJ 0/2 (defeito D1) · ✅ presidente 2/2. A parte da revelação (C4) passou também no RJ |
| 8 | Com a API local, o POST `/api/votos` envia só `{eleicao, posicao}` (sem candidato) e recebe 204 | `fluxo.spec` "8. …" (confere também `/api/estado`, que o corpo não leva o id nem o nome do candidato e a mensagem "Voto anotado…") | ✅ 4/4 |

### Critérios de B-interacao.md §9

| Critério | Onde | Resultado |
|---|---|---|
| A1 sem rolagem antes de escolher | cenas 1 | ✅ |
| A2 `#meio` sem rolagem interna, em todas as cenas reais | cenas 1 (reprova e diz quantos px faltam) | ✅ nenhuma cena rola por dentro, nos 2 tamanhos |
| A3 botão inteiro na viewport depois de escolher | cenas 1 | ✅ |
| A4 `scrollHeight` igual antes e depois | cenas 1 | ✅ |
| A5 trocar 1 → 3 | cenas 2 | ✅ (também com seta do teclado) |
| A6 tocar de novo desmarca e o botão volta a "Nenhuma dessas" | cenas 2 | ✅ |
| A7 chip visível; abrir o dialog não move o botão | cenas 1 e 3 | ✅ |
| A8 Esc fecha, foco volta, Tab preso | cenas 3 | ✅ |
| A9 Voltar: mesma resposta, mesma ordem (`data-op`), `aria-valuenow = k` | cenas 2 | ✅ |
| A10 `goBack()` leva à cena anterior | cenas 2 | ✅ (o Avançar do navegador não foi exigido; ver R2) |
| A11 `reload()` volta na mesma cena com a resposta | cenas 2 | ✅ |
| A12 foco na pergunta e aria-live "Situação k de N" | cenas 2 | ✅ |
| A13 "Metade" e "Última" uma vez; voltar e avançar não repete | cenas 1 (a repetição é conferida no perfil vazio) | ✅ |
| A14 alvos ≥ 44×44 | a11y 6, em todas as etapas (links dentro de texto corrido ficam fora, pela exceção da WCAG 2.5.8) | ✅ depois da correção 3 |
| A15 com movimento reduzido, animações ≤ 1 ms | a11y A15 | ✅ |
| B1 perfil sem rolagem | a11y 6, cada pergunta, nos 2 tamanhos | ✅ |
| B2 resposta do perfil avança em ≤ 600 ms; Voltar mostra `aria-pressed=true` | fluxo 4 | ✅ |
| B3 4º toque nas prioridades não marca e avisa "Máximo de 3" | fluxo 4 | ✅ |
| C1 "Votar às cegas" e 5 linhas visíveis sem rolar | fluxo 4 | ✅ |
| C2 detalhe às cegas sem nome, sem `blockquote`, sem link | fluxo 4 e 7 | ✅ |
| C3 confirmar sem escolha mostra `role=alert`, foca a 1ª opção e fica na tela | fluxo 7 | ✅ |
| C4 a 1ª carta é a do votado, com o nome dele; as outras só viram com "Revelar os outros" | fluxo 7 | ✅ |
| C5 com movimento reduzido, a contagem não aparece | fluxo 7 (um observador registra toda `data-etapa` que entra no DOM) | ✅ depois da correção 4 |
| C6 o cartão não leva o voto; sem a chave, sem nomes | fluxo 4: registra todo `fillText` do canvas e confere o `alt` | ✅ (limitação: ver R4) |
| C7 "Prefiro não votar" revela sem carta de destaque | fluxo 7b (também confere que nenhum POST sai) | ✅ |

## Bugs achados e corrigidos

| # | Defeito (evidência) | Correção |
|---|---|---|
| 1 | axe `scrollable-region-focusable` (serious): a folha de detalhe às cegas e a de "Como calculamos" rolam e não têm nada focável dentro. Pelo teclado não dá para ler o fim | novo `src/ui/useRolavel.ts`, usado em `src/ui/Folha.tsx` (`.corpo`). Quando a região rola e não tem nada focável, ela entra no Tab (`tabindex=0`). Quando deixa de rolar, sai |
| 2 | Mesmo alerta no `#meio` da revelação do RJ (8 cartas, que só viram botões depois de todas reveladas) | o mesmo hook em `src/ui/Tela.tsx` (`main#meio`) |
| 3 | A14: o link "Ler o plano de governo completo" no detalhe revelado tinha 22 px de altura | `src/telas/DetalheCandidato.tsx`: `inline-flex min-h-11 items-center`, igual ao link da fonte do fato |
| 4 | C5: com movimento reduzido, a tela escura da contagem ("Revelando em 3") aparecia por um quadro depois do voto. O avanço ficava num `useEffect`, e o voto espera o `fetch`, então o efeito só rodava depois da pintura | `src/telas/Contagem.tsx`: `useLayoutEffect`. Com movimento reduzido, avança antes da primeira pintura. Sem movimento reduzido, nada muda |

Nada foi mexido em `src/lib/matching.ts`, `src/lib/perfil.ts`, `src/lib/ordem.ts`, nos JSON de dados nem em `server/`. O golden e a auditoria de viés confirmam que as notas e a seleção de cenas não mudaram.

## Defeito aberto (fora do que esta etapa pode alterar)

**D1: nome de candidato aparece antes do voto (RJ).** O fato da cena `escola-bagunca` (`src/data/quiz.json`) tem a fonte `"O Dia, 11/09/2026 (dado citado por Eduardo Paes)"`. A folha "Você sabia?" mostra esse texto durante as cenas. Isso quebra a regra das cegas, e o dado é um argumento de campanha de um candidato. Severidade: alta (fere a premissa do produto). Reproduz em 100% das execuções, nos 2 tamanhos. Correção sugerida para quem cuida do conteúdo: citar a fonte primária do dado (ex.: Censo Escolar/INEP ou Seeduc), sem o nome. O teste 7 fica vermelho até lá, de propósito. Nenhum outro fato, pergunta ou opção das duas eleições cita candidato (varredura por nome e sobrenome).

## Riscos restantes

- **R1. Só Chromium.** Os testes rodam no Chromium do ambiente (build 1194) com o Playwright 1.63. Safari e WebKit no iOS não foram testados: `100dvh`, `<dialog>`, `:has()` e a área segura podem se comportar diferente. É o maior risco para celular.
- **R2. Avançar do navegador.** Depois de voltar pelo sistema, o Avançar do navegador não refaz a ida: o app fica na tela, só o índice do histórico muda. O Voltar seguinte continua coerente. Não é exigido por A10. Corrigir exigiria decidir o que "avançar" faz numa cena sem resposta.
- **R3. Texto ampliado e paisagem** (altura < 480 px, WCAG 1.4.10) não entram na suíte. Só os 2 tamanhos pedidos foram medidos.
- **R4. C6 parcial.** O teste confere o texto desenhado (sem nomes com a chave desligada; nomes e % sem "votei" ou "seu voto" com ela ligada) e o `alt`. Não confere a imagem em si (ex.: destaque só por cor).
- **R5. Turnstile.** Com `TURNSTILE_SITE_KEY` vazio, o desafio e o estado "Verificando…" não foram exercitados. Ligar o Turnstile acrescenta `challenges.cloudflare.com`, que o critério 5 vai acusar como externo: a lista de permitidos da fixture terá de incluir esse domínio.
- **R6. Movimento completo.** A suíte roda sempre com `reducedMotion: 'reduce'`, como pede o plano. A contagem 3-2-1, as viradas animadas e o auto-avanço com animação ficam sem teste automático.
- **R7. Dependência do limite por IP.** O `cf-connecting-ip` único por teste é só um recurso do teste. Em produção, a Cloudflare define esse cabeçalho e o cliente não consegue falsificá-lo.
