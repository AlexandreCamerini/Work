# Voto por Programa

Ferramenta de apoio à decisão eleitoral (voting advice application): o eleitor
responde a um questionário sobre temas de governo e vê seu grau de afinidade
com cada candidato, calculado apenas a partir de posições públicas
rastreáveis — nunca por imagem, coligação ou marketing.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4. 100% client-side: sem
backend, sem banco de dados, sem coleta de dados pessoais. O cálculo roda no
navegador do eleitor e nada é enviado a um servidor.

Escolha deliberada: qualquer coleta de respostas de intenção de voto é dado
sensível (art. 5º da LGPD). Não persistir nada elimina essa superfície de
risco por completo, ao custo de não haver analytics agregado — se isso vier
a ser necessário, requer opt-in explícito e uma revisão de conformidade
separada, não uma alteração incidental deste MVP.

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção em dist/
npm test          # suíte de testes (vitest)
npm run lint      # oxlint
```

## Arquitetura

```
src/
  types.ts             # modelo de dados: Pergunta, Candidato, Resposta, Resultado
  data/
    eixos.ts            # eixos temáticos (economia, saúde, educação, ...)
    perguntas.ts         # banco de perguntas em escala Likert (-2..+2)
    candidatos.ts         # ⚠️ dados fictícios — ver seção abaixo
  lib/
    matching.ts           # motor de cálculo de afinidade (puro, sem UI)
    matching.test.ts        # testes do motor
  components/
    Intro.tsx, Questionario.tsx, Resultados.tsx
```

### Algoritmo de matching

Para cada pergunta respondida, `afinidade_item = 1 - |resposta_usuário -
posição_candidato| / 4`, ponderada pela importância (1–3) que o próprio
usuário atribuiu ao tema. A afinidade geral é a média ponderada de todas as
perguntas comparáveis; perguntas sem posição cadastrada para o candidato, ou
sem resposta do usuário, são simplesmente excluídas do denominador — nunca
tratadas como discordância. O mesmo cálculo é refeito por eixo temático para
o breakdown exibido no card expandido.

É determinístico, auditável e coberto por testes unitários
(`src/lib/matching.test.ts`) — não depende de LLM nem de heurística opaca.

## Colocando uma eleição real no ar

O único arquivo que precisa mudar é `src/data/candidatos.ts` (e, se os temas
não servirem, `src/data/eixos.ts` / `src/data/perguntas.ts`).

**Regra inegociável:** toda `posicao` de candidato precisa vir de uma fonte
pública citável (plano de governo registrado no TSE, entrevista, site
oficial), e `fonteUrl` deve apontar exatamente para essa fonte — a UI exibe
esse link ao lado de cada posição. Nunca publique uma posição inferida sem
fonte: além do risco reputacional, é o tipo de erro que vira desinformação
eleitoral.

Os candidatos atuais (`exemplo-a/b/c`) são fictícios e existem só para
exercitar o fluxo e os testes.

## Critérios de aceite

- [x] Questionário cobre múltiplos eixos temáticos, com peso de importância
      definido pelo próprio eleitor.
- [x] Cálculo de afinidade transparente, testado, sem caixa-preta.
- [x] Ranking de candidatos com breakdown por eixo e por pergunta.
- [x] Toda posição de candidato exibida linka para a fonte primária.
- [x] Nenhum dado pessoal ou de intenção de voto é coletado ou transmitido.
- [x] Responsivo (grid 2 colunas em mobile, 5 em desktop nas opções Likert).
- [ ] Acessibilidade (contraste, navegação por teclado, `aria-*`) — não
      auditada nesta rodada; revisar antes de publicar.
- [ ] Dataset de uma eleição real, com fontes verificadas — pendente por
      definição, não é responsabilidade deste MVP genérico.

## Deploy

É um site estático (`npm run build` gera `dist/`). Publicável em qualquer
CDN/host estático (Vercel, Netlify, GitHub Pages, Cloudflare Pages) sem
infraestrutura adicional. Nenhum deploy foi feito nesta sessão — pushar para
produção com dados de uma eleição real é decisão de quem for publicar.
