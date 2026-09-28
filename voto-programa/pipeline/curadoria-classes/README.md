# Curadoria por classe social (27/09/2026)

Pedido: perguntas e respostas adaptáveis e acessíveis a todas as classes sociais.

## Fluxo
1. **A-letramento** (agente): linguagem para leitor Inaf "elementar", sem soar infantil; equilíbrio entre opções. → `textos-letramento.json`, `perfil-letramento.md`, `A-letramento.md`.
2. **B-adaptação** (agente): 26 personas rodadas no `selecionarCenas` real, matriz de plausibilidade, lacunas e variantes. → `variantes-novas.json`, `ajustes-publico.json`, `cenas-padrao.json`, `B-adaptacao.md`.
3. **C-verificação** (agente independente, adversarial): fidelidade à preferência, equilíbrio, fontes, limites, conflitos entre pacotes. → `veredito.json`, `C-verificacao.md`.
4. **Orquestrador**: `decisoes.json` (por cima do veredito) e `aplicar_curadoria.py` (idempotente; aborta se "antes" não bate, se preferência muda ou se a variante não tem as preferências da origem).

## Resultado
| | Governador RJ | Presidente |
|---|---|---|
| Versão do quiz | 3.4.0 → 3.5.0 | 1.3.0 → 1.4.0 |
| Trocas de texto aplicadas | 26 | 24 |
| Variantes novas | fila-aposentado, chuva-interior, passagem-moto, passagem-interior, passagem-leste | conta-propria, fila-aposentado, neto-escola |
| Ajustes de público | vale-transporte (só capital, faixa média/alta, carro ou casa), via-expressa-fechada (metropolitana) | trabalho-app (só `aplicativo`) |
| Removida | encosta-serra (coberta por chuva-interior) | — |

Perfil (src/telas/PerfilPasso.tsx): `trabalho=aplicativo` separado de `autonomo`; `deslocamento=a_pe` separado de `moto`; rótulos sem "(a)"; subtítulo que explica por que o perfil pergunta; regiões do Brasil com exemplos de estados; temas "Violência contra a mulher", "Redes sociais", "Gastos do governo".

## Garantias verificadas
- Nenhuma nota de pergunta existente mudou; variantes novas copiam as notas da origem (mesmas preferências).
- `auditar_vies.py` com números idênticos aos de antes (geral, leste, interior, presidente).
- `checar_legibilidade.py`: 0 violações. Cegamento, contexto e legibilidade: testes verdes.
- E2E 60/60, com teste novo que exige que os perfis de teste, somados, passem por todas as cenas (layout sem rolar a 360×640 conferido também nas variantes novas).
- Golden regravado de propósito (dados, seleção de cenas e perfis nomeados mudaram; enumeração inclui `a_pe` e `aplicativo`).

## Rejeitado / decidido pelo orquestrador
- `jornada-familia` rejeitada: a padrão já diz "Você, ou alguém da sua casa"; a opção protegida "a minha jornada" fica torta na voz do avô.
- Correções manuais registradas em `decisoes.json` (fontes de passagem-leste; barca-leste: operação privada explícita e passagem R$ 5).

## Riscos e pendências
- Plausibilidade por persona é julgamento de pesquisador, sem pré-teste (decisão do produto).
- Zona rural sem campo no perfil; empresário de comércio/serviço vê a cena de licença ambiental de galpão.
- passagem-interior/leste mantêm a opção do metrô (limite de reusar as opções da origem).
- Fonte g1 de 10/02/2026 (barca R$ 5) aberta pelo revisor; o proxy desta sessão bloqueia g1.globo.com.
- Reenquadramento de 3 perguntas (transito-carro, falta-tecnico, celular-roubado RJ, escala-6x1) pode mudar a distribuição de respostas.
