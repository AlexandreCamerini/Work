# Voto por Programa

Ferramenta de apoio à decisão eleitoral (voting advice application): o eleitor
reage a situações do dia a dia (não a afirmações ideológicas) e vê seu grau
de afinidade com cada candidato, calculado apenas a partir de posições
públicas rastreáveis — nunca por imagem, coligação ou marketing.

**Piloto atual: Governador do Rio de Janeiro, eleição 2026** (1º turno em
04/10/2026).

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
    perguntas.ts         # 18 cenários situacionais (-2..+2 por opção escolhida)
    candidatos.ts         # Paes e Ruas — metadados verificados, posições vazias
  lib/
    matching.ts           # motor de cálculo de afinidade (puro, sem UI)
    matching.test.ts        # testes do motor
  components/
    Intro.tsx, Questionario.tsx, Resultados.tsx
```

### Questionário situacional (por que mudou)

A primeira versão usava afirmações Likert ("Concordo totalmente que o Estado
deveria..."). Isso pressupõe que o eleitor já tem opinião política formada e
sabe traduzi-la em jargão — filtra quem já é politizado e afasta quem a
ferramenta deveria alcançar primeiro.

O formato atual descreve uma situação concreta do cotidiano fluminense (fila
de posto de saúde, conta de luz, tiroteio perto da escola) e oferece 4
reações possíveis. Cada opção é pré-mapeada para uma posição no eixo
(`-2..+2`) por decisão de produto — o eleitor só reconhece a situação e
escolhe a reação mais próxima da sua, sem precisar saber o nome da política
pública por trás.

O motor de matching não mudou: `RespostaUsuario` continua sendo
`{ perguntaId, posicao, importancia }`, só a UI que produz esse valor mudou
de escala Likert para múltipla escolha situacional.

**Pendência:** as 18 perguntas atuais (3 por eixo × 6 eixos) foram calibradas
por raciocínio, não testadas com eleitores reais. Antes de publicar, validar
com 5-10 pessoas fora da bolha política — se alguma reação parecer forçada
ou capciosa, reescrever.

### Algoritmo de matching

Para cada pergunta respondida, `afinidade_item = 1 - |resposta_usuário -
posição_candidato| / 4`, ponderada pela importância (1–3) que o próprio
usuário atribuiu ao tema. A afinidade geral é a média ponderada de todas as
perguntas comparáveis; perguntas sem posição cadastrada para o candidato, ou
sem resposta do usuário, são simplesmente excluídas do denominador — nunca
tratadas como discordância. O mesmo cálculo é refeito por eixo temático para
o breakdown exibido no card expandido. Quando um candidato não tem nenhuma
posição cadastrada, a UI mostra "—" em vez de 0%, para não sugerir
discordância onde há apenas ausência de dado.

É determinístico, auditável e coberto por testes unitários
(`src/lib/matching.test.ts`) — não depende de LLM nem de heurística opaca.

## Piloto: Governador do Rio de Janeiro 2026

### Candidatos oficializados (9) e critério de corte

Registro encerrado em 15/08/2026: André Marinho (Novo), Anthony Garotinho
(Republicanos), Cyro Garcia (PSTU), Coronel Busnello (Missão), Douglas Ruas
(PL), Eduardo Paes (PSD), Juliete Pantoja (UP), Luan Monteiro (PCO) e William
Siri (PSOL).

O piloto (`src/data/candidatos.ts`) cobre só os 2 favoritos apurados nas
pesquisas até 24/09/2026 — **Eduardo Paes** e **Douglas Ruas** — por decisão
explícita de escopo, dado o prazo curtíssimo até o 1º turno.

**Anthony Garotinho está em `candidatosEmWatch`, fora do site**: o TRE-RJ
indeferiu seu registro em 11/09/2026 (RCand 0602359-26, suspensão de direitos
políticos por improbidade administrativa) e o recurso segue pendente no TSE
sem julgamento de mérito. Apresentá-lo como opção válida antes dessa decisão
é o tipo de erro editorial que este projeto existe para evitar. Reavaliar se
o TSE reverter antes de 04/10/2026 — o campo `situacaoJudicial.atualizadoEm`
existe exatamente para forçar essa checagem.

### Pipeline de dados (fonte oficial)

1. **Metadados** (nome, número, partido, coligação/federação, vice, situação
   judicial) — já verificados e populados em `candidatos.ts`, cada campo com
   `fonteUrl` para reportagem ou decisão judicial.
2. **Plano de governo** (PDF oficial registrado no TSE) — fonte é o Portal de
   Dados Abertos do TSE, dataset `candidatos-2026`:
   - `consulta_cand_2026.zip` — CSV com metadados de todos os candidatos,
     chave `SQ_CANDIDATO`.
   - `proposta_governo_2026_RJ.zip` — PDFs de proposta de governo do RJ,
     arquivo nomeado pelo mesmo `SQ_CANDIDATO`.
   - Ambos em `https://cdn.tse.jus.br/estatistica/sead/odsele/...` — ver
     página do dataset: https://dadosabertos.tse.jus.br/dataset/candidatos-2026
3. **Extração de posição**: leitura do PDF, uma posição por pergunta do
   questionário, com o trecho literal citado em `PosicaoCandidato.trechoFonte`
   — nunca inferida de notícia ou opinião de terceiros. Cada posição fica
   auditável e contestável (o card revelado mostra o trecho ao lado do link
   da fonte).

**Bloqueio conhecido neste ambiente:** `tse.jus.br` (todos os subdomínios)
está fora da allowlist de rede deste sandbox — download dos ZIPs falha com
403 no proxy de egress. Para popular `posicoes` de verdade: liberar o domínio
nas configurações de rede do ambiente, ou baixar os ZIPs localmente e trazer
os PDFs/CSV para dentro do projeto.

## Critérios de aceite

- [x] Questionário situacional cobre 6 eixos temáticos, com peso de
      importância definido pelo próprio eleitor.
- [x] Cálculo de afinidade transparente, testado, sem caixa-preta.
- [x] Ranking de candidatos com breakdown por eixo e por pergunta.
- [x] Candidatos ficam ocultos (nome/número/partido/coligação) até revelação
      explícita por card — a decisão por conteúdo precede a identidade.
- [x] Toda posição de candidato revelada linka para a fonte primária e mostra
      o trecho citado do documento oficial.
- [x] Candidato sem posições cadastradas mostra "sem dado", nunca 0%.
- [x] Nenhum dado pessoal ou de intenção de voto é coletado ou transmitido.
- [ ] Posições reais de Paes e Ruas extraídas do plano de governo — bloqueado
      por acesso de rede a `tse.jus.br`, ver seção acima.
- [ ] Questionário situacional validado com eleitores reais fora da bolha
      política.
- [ ] Acessibilidade (contraste, navegação por teclado, `aria-*`) — não
      auditada nesta rodada; revisar antes de publicar.
- [ ] Mecanismo de contestação de posição extraída (candidato ou eleitor
      reporta erro) — desenhado no plano, não implementado ainda.

## Deploy

É um site estático (`npm run build` gera `dist/`). Publicável em qualquer
CDN/host estático (Vercel, Netlify, GitHub Pages, Cloudflare Pages) sem
infraestrutura adicional. Nenhum deploy foi feito nesta sessão — pushar para
produção com dados de uma eleição real, antes de fechar os critérios de
aceite acima, é decisão de quem for publicar.
