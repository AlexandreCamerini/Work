# Plano consolidado: refatoração de UX e rebrand (fase 2)

Base: A-linguagem.md, B-interacao.md, C-marca.md, D-tecnica.md (fase 1, 25/09/2026).
Status: **aguardando o dono do produto** escolher a marca e aprovar a interação.

## Diagnóstico medido (build de produção, Playwright)

| Problema relatado | Medida |
|---|---|
| Página cresce e obriga a rolar | botão Próxima fora da tela em 23 de 23 cenas (360×640 e 390×844); rolagem de até 386 px |
| Não dá pra mudar a resposta | opções ficam `disabled`; respostas são só acrescentadas a uma lista; Voltar do Android sai do quiz |
| Textos difíceis | 30 violações de tamanho (18 opções > 12 palavras); 18 siglas/jargões sem explicação; 5 detalhes que só um candidato usa |
| Pouco divertido, longo | 35 a 37 toques e 18 a 21 rolagens até o resultado; ~7 a 9 min contra "3 minutos" prometidos; resultado do RJ com 4.931 px |
| Técnico | JS de 713 KB (175 KB gzip), 2/3 são dados; foco perdido a cada escolha; opções sem semântica de rádio; sem `<main>` e sem `h1` na cena |

## O que será feito (fase 3), em ordem

1. **Rede de segurança antes de mexer:** `npx tsx pipeline/ux/gerar-golden.ts --conferir` passa hoje; vira passo obrigatório do `npm test` (ids, preferências, aderência, seleção de cenas para 16.128 perfis, resultados para respostas fixas).
2. **Textos:** aplicar as 125 trocas de `textos-propostos.json` com script idempotente (confere o "antes"); encurtar as cenas `operacao-policial` e `dinheiro-publico` para caber sem rolar (cena + pergunta ≤ 170 caracteres; opções somadas ≤ 260); `checar_legibilidade.py` entra na suíte. As 3 opções de "precisa reavaliação" ficam como estão até decisão.
3. **Arquitetura:** máquina de estados pura (`src/fluxo/maquina.ts`) com `useReducer`; respostas por cena (editáveis); ordem de cenas e de opções sorteada uma vez; histórico do navegador ligado a Voltar; progresso em `sessionStorage`. `src/lib/matching.ts` e `src/lib/perfil.ts` não mudam.
4. **Telas no layout fixo** (topo 44 px, meio, rodapé fixo com área segura): abertura; perfil 1 pergunta por tela que avança ao tocar; prioridades numa tela; cena sem rolagem com rádios nativos, trocar à vontade, tocar de novo desmarca, fato em chip que abre folha sem mover o botão; resumo em 2 cartões; resultado às cegas compacto com detalhe em folha; voto às cegas; contagem 3-2-1; revelação começando pelo voto; cartão compartilhável 1080×1350 sem o voto (nomes só se a pessoa ligar).
5. **Marca escolhida** aplicada como tokens (claro e escuro), logo, favicon, imagem OG em PNG, título e textos de voz.
6. **Performance:** dados de cada eleição sob demanda (JS inicial estimado 234 KB, −67%); aderência baixada durante as cenas, evidências só na revelação; fontes só latin e latin-ext.
7. **Acessibilidade:** foco no título a cada tela, `aria-live` "Situação N de M", alvos ≥ 44 px, contorno de controle ≥ 3:1, movimento reduzido.

## Verificação (fase 4)

- `tsc -b`, `npm test` (incluindo golden e legibilidade), `lint`, `build` verdes.
- E2E Playwright (a partir de `e2e-proposta.spec.ts` e dos 25 critérios de B-interacao.md): 360×640 e 390×844, duas eleições; botão de avançar dentro da viewport depois de escolher; altura estável ao escolher e ao abrir o fato; trocar muda a seleção; Voltar preserva resposta e ordem; fluxo completo sem erro de console e sem requisição externa.
- axe-core: 0 serious/critical.
- `auditar_vies.py` (geral, `--regiao leste`, `--regiao interior`) com números idênticos.
- Capturas antes/depois em `pipeline/ux/capturas/`.

## Decisões do dono do produto

1. **Marca:** Combina? (recomendada) · Só a Proposta · Ponto a Ponto. Página: https://claude.ai/artifact/4Fu3mZiZ5LpkaXyCqwYvNS
2. **Interação:** aprovar o protótipo https://claude.ai/artifact/CB1B29JPVQG5S5sv4b5pD2 (dados fictícios).
3. **3 opções que simplificar mudaria o sentido** (escala-6x1 b, operacao-policial b / via-expressa-fechada b, trabalho-app b): manter o texto atual, ou reescrever e mandar reavaliar as notas.

## Riscos

- "Combina?" pode lembrar aplicativo de namoro e "combinado" também é "arranjado"; a voz proíbe "match".
- Sem pré-teste com eleitores (decisão do produto): jargão residual só aparece com uso real.
- A refatoração toca quase todo o `src/components`; a linha de base e o E2E são o que impede regressão nas notas e na seleção de cenas.
